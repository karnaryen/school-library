import { Injectable, inject } from '@angular/core';
import { Bytes, Firestore, getDoc, writeBatch } from 'firebase/firestore';
import { SchoolService } from '../core/school.service';
import { makeCoverImage } from '../shared/cover-image';
import { CoverPhoto, now } from '../shared/models';
import { PromiseCache } from '../shared/promise-cache';

/** How many pictures are kept in memory. A school scrolling past more than this re-reads the oldest ones. */
const CACHE_LIMIT = 300;

/**
 * A school's own cover photos: `covers/{isbn}`, announced on the title by
 * `coverPhotoAt`. The two are always written together, so a title never
 * points at a photo that is not there.
 */
@Injectable({ providedIn: 'root' })
export class CoversService {
  private readonly db = inject(Firestore);
  private readonly school = inject(SchoolService);

  /**
   * Pictures already fetched, as `data:` URLs (`null`: the photo is gone). The
   * key holds the school and the photo's timestamp, so a replaced photo or
   * another school is simply a miss.
   */
  private readonly photos = new PromiseCache<string | null>(CACHE_LIMIT);

  /** Shrinks `photo` to a thumbnail and stores it as the cover of `isbn`, replacing an earlier photo. */
  async setPhoto(isbn: string, photo: Blob): Promise<void> {
    const { bytes, contentType } = await makeCoverImage(photo);
    const savedAt = now();
    const cover: CoverPhoto = { image: Bytes.fromUint8Array(bytes), contentType, updatedAt: savedAt };

    // Firestore shows the title's new `coverPhotoAt` to the screen before the server has confirmed it, and the
    // screen asks for the photo right away. Remembered first, it is answered from here instead of read back.
    // Should the write fail, the entry is harmless: its key holds this attempt's timestamp, which no title has.
    this.photos.set(this.key(isbn, savedAt), toDataUrl(cover));

    const batch = writeBatch(this.db);
    batch.set(this.school.schoolDoc('covers', isbn), cover);
    batch.update(this.school.schoolDoc('titles', isbn), { coverPhotoAt: savedAt });
    await batch.commit();
  }

  async removePhoto(isbn: string): Promise<void> {
    const batch = writeBatch(this.db);
    batch.delete(this.school.schoolDoc('covers', isbn));
    batch.update(this.school.schoolDoc('titles', isbn), { coverPhotoAt: null });
    await batch.commit();
  }

  /**
   * The photo as a `data:` URL an <img> can show, or `null` when it is gone.
   * `photoAt` is the title's `coverPhotoAt`. A failure (offline, say) is not
   * remembered, so asking again tries again.
   */
  photoUrl(isbn: string, photoAt: string): Promise<string | null> {
    return this.photos.get(this.key(isbn, photoAt), () => this.fetch(isbn));
  }

  private async fetch(isbn: string): Promise<string | null> {
    const snap = await getDoc(this.school.schoolDoc('covers', isbn));
    return snap.exists() ? toDataUrl(snap.data() as CoverPhoto) : null;
  }

  private key(isbn: string, photoAt: string): string {
    return `${this.school.requireSchoolId()}/${isbn}@${photoAt}`;
  }
}

function toDataUrl(cover: CoverPhoto): string {
  return `data:${cover.contentType};base64,${cover.image.toBase64()}`;
}
