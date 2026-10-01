import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { CoversService } from '../../services/covers.service';
import { LibraryService } from '../../services/library.service';
import { SnackBarService } from '../../services/snack-bar.service';
import { BookCoverComponent } from '../../shared/book-cover/book-cover.component';
import { CoverImageError } from '../../shared/cover-image';
import { Copy, Title } from '../../shared/models';
import { T } from '../../shared/nl';

interface Row {
  title: Title;
  copies: Copy[];
  total: number;
  available: number;
}

@Component({
  selector: 'app-books',
  imports: [BookCoverComponent, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './books.component.html',
})
export class BooksComponent {
  private readonly library = inject(LibraryService);
  private readonly covers = inject(CoversService);
  private readonly snackBar = inject(SnackBarService);

  /** The book the photo picker was opened for. The list shares one picker, which cannot tell by itself. */
  private coverPhotoFor: string | null = null;

  protected readonly t = T;
  protected readonly search = signal('');
  protected readonly location = signal('');
  protected readonly locations = computed(() =>
    [...new Set((this.library.copies() ?? []).filter((c) => c.status !== 'removed').map((c) => c.location).filter((l) => l !== ''))].sort((a, b) =>
      a.localeCompare(b, 'nl', { numeric: true }),
    ),
  );
  protected readonly busy = signal<string | null>(null);
  protected readonly loaded = computed(() => this.library.titles() !== undefined && this.library.copies() !== undefined);

  protected readonly rows = computed<Row[]>(() => {
    const copiesByIsbn = new Map<string, Copy[]>();
    for (const copy of this.library.copies() ?? []) {
      if (copy.status === 'removed') continue;
      copiesByIsbn.set(copy.isbn, [...(copiesByIsbn.get(copy.isbn) ?? []), copy]);
    }
    return (this.library.titles() ?? [])
      .map((title) => {
        const copies = copiesByIsbn.get(title.isbn) ?? [];
        return { title, copies, total: copies.length, available: copies.filter((c) => c.status === 'available').length };
      })
      .sort((a, b) => a.title.title.localeCompare(b.title.title, 'nl'));
  });

  protected readonly visible = computed(() => {
    const needle = this.search().trim().toLowerCase();
    const location = this.location();
    return this.rows()
      .filter((r) => !location || r.copies.some((c) => c.location === location))
      .filter(
        (r) => !needle || r.title.title.toLowerCase().includes(needle) || r.title.author.toLowerCase().includes(needle) || r.title.isbn.includes(needle),
      );
  });

  protected async addCopy(row: Row): Promise<void> {
    await this.run(row.title.isbn, () => this.library.addTitleWithCopies(row.title.isbn, row.title, 1));
  }

  protected async markCopy(row: Row, status: 'lost' | 'removed'): Promise<void> {
    const copy = row.copies.find((c) => c.status === 'available') ?? row.copies.find((c) => c.status === 'lost');
    if (!copy) return;
    await this.run(row.title.isbn, () => this.library.setCopyStatus(copy, status));
  }

  /** Opens the camera (phone) or the file dialog (computer) for this book's cover. */
  protected pickCoverPhoto(row: Row, picker: HTMLInputElement): void {
    this.coverPhotoFor = row.title.isbn;
    // Otherwise choosing the same file twice in a row would not count as a change.
    picker.value = '';
    picker.click();
  }

  protected async onCoverPhotoPicked(picker: HTMLInputElement): Promise<void> {
    const isbn = this.coverPhotoFor;
    const photo = picker.files?.[0];
    this.coverPhotoFor = null;
    if (!isbn || !photo) return;
    await this.run(isbn, () => this.covers.setPhoto(isbn, photo), T.books.coverSaved);
  }

  protected async removeCoverPhoto(row: Row): Promise<void> {
    await this.run(row.title.isbn, () => this.covers.removePhoto(row.title.isbn), T.books.coverRemoved);
  }

  private async run(isbn: string, action: () => Promise<void>, done: string = T.books.saved): Promise<void> {
    this.busy.set(isbn);
    try {
      await action();
      this.snackBar.success(done);
    } catch (err) {
      this.snackBar.error(err instanceof CoverImageError ? T.books.coverErrors[err.code] : T.common.genericError);
    } finally {
      this.busy.set(null);
    }
  }
}
