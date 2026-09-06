import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../app.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly zone = inject(NgZone);

  /** `undefined` until Firebase has restored the session; then the user or `null`. */
  readonly user = signal<User | null | undefined>(undefined);
  readonly ready = computed(() => this.user() !== undefined);
  readonly uid = computed(() => this.user()?.uid ?? null);
  /** True when the user signs in with e-mail and password (rather than Google). */
  readonly usesPassword = computed(() => this.user()?.providerData.some((p) => p.providerId === 'password') ?? false);

  constructor() {
    onAuthStateChanged(this.auth, (user) => this.zone.run(() => this.user.set(user)));
  }

  /** Resolves once the initial session check has completed. */
  whenReady(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  async register(email: string, password: string): Promise<User> {
    const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const { user } = await signInWithEmailAndPassword(this.auth, email, password);
    return user;
  }

  async loginWithGoogle(): Promise<User> {
    const { user } = await signInWithPopup(this.auth, new GoogleAuthProvider());
    return user;
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  /**
   * Firebase refuses to delete a user whose sign-in is older than a few
   * minutes, so prove it is really them first: with the password, or with a
   * Google popup for Google accounts.
   */
  async reauthenticate(password?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not signed in');
    if (this.usesPassword()) {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? '', password ?? ''));
    } else {
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
    }
  }

  /** Deletes the Firebase Auth user; this also signs them out. Call `reauthenticate` first. */
  async deleteAccount(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Not signed in');
    await deleteUser(user);
  }
}
