import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { CoversService } from '../../services/covers.service';
import { LibraryService } from '../../services/library.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { CoverImageError } from '../../shared/cover-image';
import { Copy, Title } from '../../shared/models';
import { T } from '../../shared/nl';
import { BooksComponent } from './books.component';

function title(isbn: string, name: string, extra: Partial<Title> = {}): Title {
  return { isbn, title: name, author: '', coverUrl: null, publisher: '', year: '', avi: '', source: 'manual', createdAt: '2026-10-01T08:00:00.000Z', ...extra };
}

const GRUFFALO = title('9789056371593', 'De Gruffalo');
const DOLFJE = title('9789025542108', 'Dolfje Weerwolfje', { coverPhotoAt: '2026-10-01T08:00:00.000Z' });

describe('BooksComponent cover photos', () => {
  let fixture: ComponentFixture<BooksComponent>;
  let covers: jasmine.SpyObj<CoversService>;
  let snackBar: jasmine.SpyObj<SnackBarService>;

  /** Opens the ⋮ menu of the row showing `name` and returns its items by their text. */
  function openMenu(name: string): Map<string, HTMLButtonElement> {
    const rows = Array.from(fixture.nativeElement.querySelectorAll('.card')) as HTMLElement[];
    const row = rows.find((candidate) => candidate.textContent?.includes(name));
    (row?.querySelector('button[aria-label="Meer"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const items = Array.from(document.querySelectorAll('.mat-mdc-menu-panel button[mat-menu-item]')) as HTMLButtonElement[];
    return new Map(items.map((item) => [item.querySelector('.mat-mdc-menu-item-text')?.textContent?.trim() ?? '', item]));
  }

  /** Picks `label` from that menu. Fails loudly when it is not there, so a test cannot pass by not clicking. */
  function choose(name: string, label: string): void {
    const item = openMenu(name).get(label);
    if (!item) throw new Error(`"${name}" has no menu item "${label}"`);
    item.click();
  }

  function picker(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input[type="file"]');
  }

  /** What the browser does once the teacher has taken the photo. */
  async function pick(file: File): Promise<void> {
    const files = new DataTransfer();
    files.items.add(file);
    picker().files = files.files;
    picker().dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    covers = jasmine.createSpyObj<CoversService>('CoversService', ['setPhoto', 'removePhoto', 'photoUrl']);
    covers.setPhoto.and.resolveTo();
    covers.removePhoto.and.resolveTo();
    covers.photoUrl.and.resolveTo(null);
    snackBar = jasmine.createSpyObj<SnackBarService>('SnackBarService', ['success', 'error']);
    const library = {
      titles: signal<Title[]>([GRUFFALO, DOLFJE]),
      copies: signal<Copy[]>([]),
    };

    await TestBed.configureTestingModule({
      imports: [BooksComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: LibraryService, useValue: library },
        { provide: CoversService, useValue: covers },
        { provide: SnackBarService, useValue: snackBar },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BooksComponent);
    fixture.detectChanges();
  });

  it('saves the picked photo as the cover of the book whose menu was used', async () => {
    const photo = new File(['…'], 'IMG_0001.jpg', { type: 'image/jpeg' });
    choose('Dolfje Weerwolfje', T.books.coverPhoto);

    await pick(photo);

    expect(covers.setPhoto).toHaveBeenCalledOnceWith(DOLFJE.isbn, photo);
    expect(snackBar.success).toHaveBeenCalledOnceWith(T.books.coverSaved);
  });

  it('does nothing when the camera is closed without a photo', async () => {
    choose('De Gruffalo', T.books.coverPhoto);

    picker().dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(covers.setPhoto).not.toHaveBeenCalled();
    expect(snackBar.success).not.toHaveBeenCalled();
    expect(snackBar.error).not.toHaveBeenCalled();
  });

  it('says so in Dutch when the photo cannot be read', async () => {
    covers.setPhoto.and.rejectWith(new CoverImageError('unreadable'));
    choose('De Gruffalo', T.books.coverPhoto);

    await pick(new File(['…'], 'notes.txt', { type: 'text/plain' }));

    expect(snackBar.error).toHaveBeenCalledOnceWith(T.books.coverErrors.unreadable);
    expect(snackBar.success).not.toHaveBeenCalled();
  });

  it('offers to remove a cover photo only for a book that has one', async () => {
    expect(openMenu('De Gruffalo').has(T.books.removeCoverPhoto)).toBeFalse();
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    choose('Dolfje Weerwolfje', T.books.removeCoverPhoto);
    await fixture.whenStable();

    expect(covers.removePhoto).toHaveBeenCalledOnceWith(DOLFJE.isbn);
    expect(snackBar.success).toHaveBeenCalledOnceWith(T.books.coverRemoved);
  });
});
