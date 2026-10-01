import { Injectable } from '@angular/core';
import { environment } from '../../../injected-environment';
import { isInternalCode } from '../shared/isbn';
import { TitleDraft } from '../shared/models';

/**
 * Looks an ISBN up in public book databases.
 *
 * Open Library first: it allows browser requests without a key (CORS) and
 * covers a fair share of Dutch children's books. Google Books only when an
 * API key is configured, because keyless requests are rate-limited to zero
 * since 2026. Coverage is uneven either way, so the user can always correct
 * the result. The KB (national library) SRU service has the best Dutch
 * coverage but no CORS, so it needs a server-side proxy: phase 2.
 */
@Injectable({ providedIn: 'root' })
export class IsbnLookupService {
  async lookup(isbn: string): Promise<TitleDraft | null> {
    if (isInternalCode(isbn)) return null;
    return (await this.openLibrary(isbn)) ?? (await this.googleBooks(isbn));
  }

  private async googleBooks(isbn: string): Promise<TitleDraft | null> {
    const key = environment.googleBooksKey;
    if (!key) return null;
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1&key=${key}`);
      if (!res.ok) return null;
      const data = (await res.json()) as GoogleVolumes;
      const info = data.items?.[0]?.volumeInfo;
      if (!info?.title) return null;
      return {
        title: info.title,
        author: (info.authors ?? []).join(', '),
        coverUrl: info.imageLinks?.thumbnail?.replace(/^http:/, 'https:') ?? null,
        publisher: info.publisher ?? '',
        year: (info.publishedDate ?? '').slice(0, 4),
        source: 'google',
      };
    } catch {
      return null;
    }
  }

  /**
   * Two requests, because neither answers alone. The search index is asked
   * first: it answers 200 with zero hits for an unknown ISBN, so a miss — the
   * common case — is not a failed request, and it carries the author names.
   * It only knows the work, though, and a work's title is the original one,
   * not the translation's. The edition record supplies the title on the
   * cover, with its publisher, year and cover image.
   *
   * The legacy `/api/books?bibkeys=` endpoint did both in one request, until
   * it started answering 404 for every ISBN.
   */
  private async openLibrary(isbn: string): Promise<TitleDraft | null> {
    try {
      const res = await fetch(`https://openlibrary.org/search.json?isbn=${isbn}&fields=title,author_name&limit=1`);
      if (!res.ok) return null;
      const work = ((await res.json()) as OpenLibrarySearch).docs?.[0];
      if (!work?.title) return null;
      const edition = await this.openLibraryEdition(isbn);
      const cover = edition?.covers?.find((id) => id > 0);
      return {
        title: edition?.title ?? work.title,
        author: (work.author_name ?? []).join(', '),
        coverUrl: cover ? `https://covers.openlibrary.org/b/id/${cover}-M.jpg` : null,
        publisher: (edition?.publishers ?? []).join(', '),
        year: (edition?.publish_date ?? '').match(/\d{4}/)?.[0] ?? '',
        source: 'openlibrary',
      };
    } catch {
      return null;
    }
  }

  /** Optional detail: a failure here still leaves the work's title and author. */
  private async openLibraryEdition(isbn: string): Promise<OpenLibraryEdition | null> {
    try {
      const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      return res.ok ? ((await res.json()) as OpenLibraryEdition) : null;
    } catch {
      return null;
    }
  }
}

interface GoogleVolumes {
  items?: {
    volumeInfo?: {
      title?: string;
      authors?: string[];
      publisher?: string;
      publishedDate?: string;
      imageLinks?: { thumbnail?: string };
    };
  }[];
}

interface OpenLibrarySearch {
  docs?: { title?: string; author_name?: string[] }[];
}

interface OpenLibraryEdition {
  title?: string;
  publishers?: string[];
  publish_date?: string;
  covers?: number[];
}
