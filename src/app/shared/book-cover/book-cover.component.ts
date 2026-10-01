import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, resource, signal } from '@angular/core';
import { CoversService } from '../../services/covers.service';
import { coverInitial, coverTone } from '../cover-placeholder';
import { CoverSource } from '../models';
import { whenNearViewport } from '../viewport';

/** Tile colours of the placeholder. Written out in full: Tailwind only ships the classes it can read here. */
const TONES = [
  'bg-sky-100 text-sky-800',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-rose-100 text-rose-800',
  'bg-violet-100 text-violet-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
  'bg-indigo-100 text-indigo-800',
] as const;

/**
 * The cover of a book, in a fixed 2:3 frame. The caller sets the width with a
 * class (`class="w-10"`); everything else follows from it. The frame keeps a
 * list from jumping when a picture arrives; a picture of other proportions,
 * a landscape picture book say, is shown whole inside it rather than cropped.
 *
 * In order of preference: the school's own photo, the picture the ISBN lookup
 * found, and otherwise a coloured tile with the title's first letter. A photo
 * is only fetched once the cover is on screen, so a long list of books costs
 * one read per cover actually looked at.
 */
@Component({
  selector: 'app-book-cover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block shrink-0 aspect-[2/3] overflow-hidden rounded shadow-sm bg-slate-100 @container' },
  template: `
    @if (image(); as src) {
      <img [src]="src" alt="" class="block size-full object-contain" (error)="broken.set(src)">
    } @else {
      <div class="size-full grid place-items-center font-semibold leading-none select-none text-[length:55cqw]" [class]="tone()" aria-hidden="true">
        {{ initial() }}
      </div>
    }
  `,
})
export class BookCoverComponent {
  private readonly covers = inject(CoversService);

  readonly book = input.required<CoverSource>();

  /** True once the cover has been on screen (or close to it). */
  private readonly seen = signal(false);

  /**
   * Which photo to fetch, if any. The custom equality matters: the title list
   * hands out new objects on every change to any book, and without it each of
   * those would restart the fetch and flash the placeholder.
   */
  private readonly wanted = computed(
    () => {
      const { isbn, coverPhotoAt } = this.book();
      return this.seen() && coverPhotoAt ? { isbn, photoAt: coverPhotoAt } : undefined;
    },
    { equal: (a, b) => a?.isbn === b?.isbn && a?.photoAt === b?.photoAt },
  );

  private readonly photo = resource({
    params: () => this.wanted(),
    loader: ({ params }) => this.covers.photoUrl(params.isbn, params.photoAt),
  });

  /** An image URL that failed to load; the placeholder takes over for it. */
  protected readonly broken = signal<string | null>(null);

  protected readonly image = computed(() => {
    const book = this.book();
    // A school that took its own photo did so to replace what the lookup found, so that is never shown instead.
    const src = book.coverPhotoAt ? (this.photo.hasValue() ? this.photo.value() : null) : book.coverUrl;
    return src && src !== this.broken() ? src : null;
  });

  protected readonly initial = computed(() => coverInitial(this.book().title));
  protected readonly tone = computed(() => TONES[coverTone(this.book().title, TONES.length)]);

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => destroyRef.onDestroy(whenNearViewport(host, () => this.seen.set(true))));

    // A photo that could not be fetched mostly means the connection dropped; it is tried again once that is back.
    effect((onCleanup) => {
      if (!this.photo.error()) return;
      const retry = () => this.photo.reload();
      window.addEventListener('online', retry, { once: true });
      onCleanup(() => window.removeEventListener('online', retry));
    });
  }
}
