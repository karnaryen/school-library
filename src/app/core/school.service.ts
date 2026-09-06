import { Injectable, NgZone, computed, effect, inject, signal, untracked } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { makeInternalCode } from '../shared/isbn';
import { JoinCode, Member, School, UserProfile, addDays, now, today } from '../shared/models';
import { MONETIZATION_ENABLED, PlanInfo, TRIAL_DAYS, planInfo } from '../shared/plan';
import { AuthService } from './auth.service';
import { chunk, documentChanges } from './firestore.util';

export class JoinError extends Error {
  constructor(readonly code: 'unknown-code' | 'already-member') {
    super(code);
    this.name = 'JoinError';
  }
}

/** Account deletion refused: the user is the beheerder of a school that still has other members. */
export class AccountError extends Error {
  constructor(readonly schoolName: string) {
    super('admin-with-members');
    this.name = 'AccountError';
  }
}

/** Everything under a school document, in the order it is wiped. */
const SCHOOL_COLLECTIONS = ['loans', 'copies', 'titles', 'students'] as const;

const DEFAULT_GROUPS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const DEFAULT_LOAN_DAYS = 21;

/**
 * Holds the signed-in user's current school (the tenant) and membership.
 * Every data service reads `schoolId()` from here.
 */
@Injectable({ providedIn: 'root' })
export class SchoolService {
  private readonly db = inject(Firestore);
  private readonly zone = inject(NgZone);
  private readonly auth = inject(AuthService);

  /** `undefined` while loading; `null` when the user belongs to no school yet. */
  readonly school = signal<School | null | undefined>(undefined);
  readonly member = signal<Member | null>(null);
  readonly schoolId = computed(() => this.school()?.id ?? null);
  readonly isAdmin = computed(() => this.member()?.role === 'beheerder');
  readonly ready = computed(() => this.school() !== undefined);
  /** Subscription status of the current school; `null` while no school is loaded or while monetisation is off. */
  readonly plan = computed<PlanInfo | null>(() => {
    const school = this.school();
    return school && MONETIZATION_ENABLED ? planInfo(school, today()) : null;
  });
  /** True when the school may not add books or lend (trial over and above the free tier). */
  readonly locked = computed(() => this.plan()?.locked ?? false);

  private subscriptions: Subscription[] = [];

  constructor() {
    // Keyed on the uid string, not the User object: Firebase hands out a new
    // User reference on token refreshes, which must not re-run this.
    effect(() => {
      const uid = this.auth.uid();
      untracked(() => this.follow(uid));
    });
  }

  /** Creates a school with the current user as beheerder. Returns the school id. */
  async createSchool(name: string): Promise<string> {
    const user = this.requireUser();
    const schoolRef = doc(collection(this.db, 'schools'));
    const joinCode = generateJoinCode();
    const school: Omit<School, 'id'> = {
      name: name.trim(),
      plan: 'trial',
      trialEndsAt: addDays(today(), TRIAL_DAYS),
      paidUntil: null,
      copyCount: 0,
      nextInternalCode: 1,
      loanDays: DEFAULT_LOAN_DAYS,
      groups: DEFAULT_GROUPS,
      joinCode,
      createdAt: now(),
      createdBy: user.uid,
    };
    const member: Omit<Member, 'uid'> = {
      role: 'beheerder',
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      addedAt: now(),
    };

    const batch = writeBatch(this.db);
    batch.set(schoolRef, school);
    batch.set(doc(schoolRef, 'members', user.uid), member);
    batch.set(doc(this.db, 'joinCodes', joinCode), { schoolId: schoolRef.id } satisfies JoinCode);
    batch.set(this.profileRef(user.uid), this.profileFor(user.uid, user.email, schoolRef.id));
    await batch.commit();

    this.follow(user.uid);
    return schoolRef.id;
  }

  /** Attaches the current user to an existing school as medewerker. */
  async joinSchool(rawCode: string): Promise<string> {
    const user = this.requireUser();
    const code = rawCode.trim().toUpperCase();
    const codeSnap = await getDoc(doc(this.db, 'joinCodes', code));
    if (!codeSnap.exists()) throw new JoinError('unknown-code');
    const { schoolId } = codeSnap.data() as JoinCode;

    const profileSnap = await getDoc(this.profileRef(user.uid));
    const existing = profileSnap.exists() ? (profileSnap.data() as UserProfile).schoolIds : [];
    if (existing.includes(schoolId)) throw new JoinError('already-member');

    const member = {
      role: 'medewerker',
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      addedAt: now(),
      joinCode: code, // checked by the security rules, harmless to keep
    };
    const batch = writeBatch(this.db);
    batch.set(doc(this.db, 'schools', schoolId, 'members', user.uid), member);
    batch.set(this.profileRef(user.uid), this.profileFor(user.uid, user.email, schoolId, existing));
    await batch.commit();

    this.follow(user.uid);
    return schoolId;
  }

  updateSchool(patch: Partial<Pick<School, 'name' | 'loanDays' | 'groups'>>): Promise<void> {
    const id = this.requireSchoolId();
    return updateDoc(doc(this.db, 'schools', id), patch);
  }

  /**
   * Deletes the current school with everything in it (beheerder only). Other
   * members lose access immediately; their profiles are cleaned up the next
   * time they sign in (see `follow`).
   */
  async deleteSchool(): Promise<void> {
    const user = this.requireUser();
    const school = this.school();
    if (!school) throw new Error('No school selected');

    this.stopFollowing();
    this.school.set(undefined);
    try {
      await this.wipeSchool(school.id, school.joinCode);
      await updateDoc(this.profileRef(user.uid), { schoolIds: arrayRemove(school.id) });
    } finally {
      await this.follow(user.uid);
    }
  }

  /**
   * Removes the user from every school (deleting schools where they are the
   * only member), deletes their profile and finally their sign-in account.
   * The caller must have re-authenticated first, so the last step cannot fail
   * after data is already gone.
   */
  async deleteAccount(): Promise<void> {
    const user = this.requireUser();
    const profileSnap = await getDoc(this.profileRef(user.uid));
    const schoolIds = profileSnap.exists() ? (profileSnap.data() as UserProfile).schoolIds : [];

    // Check every school before touching anything, so a refusal leaves no half-deleted state.
    const plans: { id: string; joinCode: string; wipe: boolean }[] = [];
    for (const id of schoolIds) {
      const memberSnap = await getDoc(doc(this.db, 'schools', id, 'members', user.uid));
      if (!memberSnap.exists()) continue;
      const schoolSnap = await getDoc(doc(this.db, 'schools', id));
      const members = await getDocs(collection(this.db, 'schools', id, 'members'));
      const others = members.docs.filter((m) => m.id !== user.uid);
      const otherAdmin = others.some((m) => (m.data() as Member).role === 'beheerder');
      if (others.length > 0 && (memberSnap.data() as Member).role === 'beheerder' && !otherAdmin) {
        throw new AccountError((schoolSnap.data() as School | undefined)?.name ?? '');
      }
      plans.push({ id, joinCode: (schoolSnap.data() as School | undefined)?.joinCode ?? '', wipe: others.length === 0 });
    }

    this.stopFollowing();
    this.school.set(undefined);
    for (const plan of plans) {
      if (plan.wipe) await this.wipeSchool(plan.id, plan.joinCode);
      else await deleteDoc(doc(this.db, 'schools', plan.id, 'members', user.uid));
    }
    await deleteDoc(this.profileRef(user.uid));
    await this.auth.deleteAccount();
  }

  /** Reserves the next school-internal barcode for a book without an ISBN. */
  async allocateInternalCode(): Promise<string> {
    const ref = doc(this.db, 'schools', this.requireSchoolId());
    return runTransaction(this.db, async (tx) => {
      const snap = await tx.get(ref);
      const next = (snap.data()?.['nextInternalCode'] as number | undefined) ?? 1;
      tx.update(ref, { nextInternalCode: next + 1 });
      return makeInternalCode(next);
    });
  }

  /** Path helper for the data services. */
  schoolCollection(name: string): CollectionReference {
    return collection(this.db, 'schools', this.requireSchoolId(), name);
  }

  schoolDoc(name: string, id: string): DocumentReference {
    return doc(this.db, 'schools', this.requireSchoolId(), name, id);
  }

  requireSchoolId(): string {
    const id = this.schoolId();
    if (!id) throw new Error('No school selected');
    return id;
  }

  private requireUser() {
    const user = this.auth.user();
    if (!user) throw new Error('Not signed in');
    return user;
  }

  private profileRef(uid: string) {
    return doc(this.db, 'users', uid);
  }

  private profileFor(uid: string, email: string | null, schoolId: string, existing: string[] = []): UserProfile {
    return { uid, email: email ?? '', schoolIds: [...existing, schoolId], createdAt: now() };
  }

  /**
   * Deletes a school and all of its data. The order matters: the school
   * document goes first, because that is the write the security rules may
   * refuse, and then nothing else has been touched yet. Members keep their
   * member documents until the very end so they are still allowed to delete
   * the subcollections.
   */
  private async wipeSchool(schoolId: string, joinCode: string): Promise<void> {
    const schoolRef = doc(this.db, 'schools', schoolId);
    const batch = writeBatch(this.db);
    batch.delete(schoolRef);
    if (joinCode) batch.delete(doc(this.db, 'joinCodes', joinCode));
    await batch.commit();
    for (const name of SCHOOL_COLLECTIONS) {
      await this.deleteCollection(collection(schoolRef, name));
    }
    await this.deleteCollection(collection(schoolRef, 'members'));
  }

  private async deleteCollection(ref: CollectionReference): Promise<void> {
    const snap = await getDocs(ref);
    for (const part of chunk(snap.docs)) {
      const batch = writeBatch(this.db);
      part.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  private stopFollowing(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
    this.member.set(null);
  }

  /** (Re)subscribes to the user's first school and their membership in it. */
  private async follow(uid: string | null): Promise<void> {
    this.stopFollowing();

    if (!uid) {
      this.school.set(this.auth.ready() ? null : undefined);
      return;
    }
    this.school.set(undefined);

    const profileSnap = await getDoc(this.profileRef(uid));
    const schoolId = profileSnap.exists() ? (profileSnap.data() as UserProfile).schoolIds[0] : undefined;
    if (!schoolId) {
      this.school.set(null);
      return;
    }

    // A school that was deleted (by its beheerder) is no longer readable: drop
    // it from the profile and continue as a user without a school.
    const gone = async () => {
      this.stopFollowing();
      this.school.set(null);
      await updateDoc(this.profileRef(uid), { schoolIds: arrayRemove(schoolId) }).catch(() => undefined);
    };
    this.subscriptions.push(
      documentChanges<School>(this.zone, doc(this.db, 'schools', schoolId)).subscribe({
        next: (school) => (school ? this.school.set(school) : gone()),
        error: gone,
      }),
      documentChanges<Member>(this.zone, doc(this.db, 'schools', schoolId, 'members', uid), 'uid').subscribe({
        next: (member) => this.member.set(member),
        error: () => this.member.set(null),
      }),
    );
  }
}

/** Six characters, no ambiguous ones (0/O, 1/I). */
function generateJoinCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
