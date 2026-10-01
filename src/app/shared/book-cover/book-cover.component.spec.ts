import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoversService } from '../../services/covers.service';
import { CoverSource } from '../models';
import { BookCoverComponent } from './book-cover.component';

/** A real, tiny picture, so the browser has no reason to report the <img> as broken. */
const PHOTO = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const GRUFFALO: CoverSource = { isbn: '9789056371593', title: 'De Gruffalo', coverUrl: null };

describe('BookCoverComponent', () => {
  let fixture: ComponentFixture<BookCoverComponent>;
  let covers: jasmine.SpyObj<CoversService>;

  function show(book: CoverSource): void {
    fixture.componentRef.setInput('book', book);
    fixture.detectChanges();
  }

  function image(): HTMLImageElement | null {
    return fixture.nativeElement.querySelector('img');
  }

  /** The photo arrives after the cover is seen and fetched: as soon as the browser reports it on screen. */
  async function until(condition: () => boolean): Promise<void> {
    for (let attempt = 0; attempt < 300 && !condition(); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();
    }
    expect(condition()).withContext('timed out waiting for the cover').toBeTrue();
  }

  beforeEach(() => {
    covers = jasmine.createSpyObj<CoversService>('CoversService', ['photoUrl']);
    covers.photoUrl.and.resolveTo(PHOTO);
    TestBed.configureTestingModule({ providers: [{ provide: CoversService, useValue: covers }] });
    fixture = TestBed.createComponent(BookCoverComponent);
    // The cover takes its width from the caller; without one it has no size and never counts as on screen.
    fixture.nativeElement.style.width = '40px';
  });

  it('shows a tile with the first letter when there is no picture', () => {
    show(GRUFFALO);

    expect(image()).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('G');
    expect(covers.photoUrl).not.toHaveBeenCalled();
  });

  it('shows the picture the ISBN lookup found', () => {
    show({ ...GRUFFALO, coverUrl: PHOTO });

    expect(image()?.src).toBe(PHOTO);
    expect(covers.photoUrl).not.toHaveBeenCalled();
  });

  it('falls back to the tile when that picture does not load', () => {
    show({ ...GRUFFALO, coverUrl: 'https://covers.example/missing.jpg' });
    const picture = image();
    expect(picture).not.toBeNull();

    picture?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(image()).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('G');
  });

  it("fetches the school's own photo once the cover is on screen, and prefers it to the lookup's picture", async () => {
    show({ ...GRUFFALO, coverUrl: 'https://covers.example/lookup.jpg', coverPhotoAt: '2026-10-01T08:00:00.000Z' });
    expect(image()).withContext('the lookup picture must not flash by while the photo loads').toBeNull();

    await until(() => image() !== null);

    expect(image()?.src).toBe(PHOTO);
    expect(covers.photoUrl).toHaveBeenCalledOnceWith('9789056371593', '2026-10-01T08:00:00.000Z');
  });

  it('does not fetch the photo again when the same book arrives as a new object', async () => {
    const book = { ...GRUFFALO, coverPhotoAt: '2026-10-01T08:00:00.000Z' };
    show(book);
    await until(() => image() !== null);

    show({ ...book });
    await fixture.whenStable();

    expect(image()?.src).toBe(PHOTO);
    expect(covers.photoUrl).toHaveBeenCalledTimes(1);
  });

  it('fetches again when the photo was replaced', async () => {
    show({ ...GRUFFALO, coverPhotoAt: '2026-10-01T08:00:00.000Z' });
    await until(() => image() !== null);

    show({ ...GRUFFALO, coverPhotoAt: '2026-10-02T09:30:00.000Z' });
    await until(() => covers.photoUrl.calls.count() === 2);

    expect(covers.photoUrl.calls.mostRecent().args).toEqual(['9789056371593', '2026-10-02T09:30:00.000Z']);
  });

  it('shows the tile when the photo cannot be fetched', async () => {
    covers.photoUrl.and.rejectWith(new Error('offline'));
    show({ ...GRUFFALO, coverPhotoAt: '2026-10-01T08:00:00.000Z' });

    await until(() => covers.photoUrl.calls.count() === 1);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(image()).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('G');
  });

  it('tries a failed fetch again when the connection is back', async () => {
    let attempts = 0;
    covers.photoUrl.and.callFake(() => (++attempts === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(PHOTO)));
    show({ ...GRUFFALO, coverPhotoAt: '2026-10-01T08:00:00.000Z' });
    await until(() => attempts === 1);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(image()).toBeNull();

    window.dispatchEvent(new Event('online'));

    await until(() => image() !== null);
    expect(image()?.src).toBe(PHOTO);
    expect(attempts).toBe(2);
  });

  it('goes back to the tile when the photo is removed', async () => {
    show({ ...GRUFFALO, coverPhotoAt: '2026-10-01T08:00:00.000Z' });
    await until(() => image() !== null);

    show({ ...GRUFFALO, coverPhotoAt: null });

    expect(image()).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe('G');
  });
});
