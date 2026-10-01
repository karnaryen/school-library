import { TestBed } from '@angular/core/testing';
import { IsbnLookupService } from './isbn-lookup.service';

const ISBN = '9789076174082';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('IsbnLookupService', () => {
  let service: IsbnLookupService;
  let fetchSpy: jasmine.Spy<typeof fetch>;

  /** Answers each request by the first URL fragment it matches; anything else is a 404. */
  function respond(routes: Record<string, () => Response>): void {
    fetchSpy.and.callFake(async (input) => {
      const url = String(input);
      const match = Object.keys(routes).find((fragment) =>
        url.includes(fragment),
      );
      return match ? routes[match]() : json({}, 404);
    });
  }

  beforeEach(() => {
    service = TestBed.inject(IsbnLookupService);
    fetchSpy = spyOn(window, 'fetch');
  });

  it('takes the title, publisher, year and cover from the edition and the author from the work', async () => {
    respond({
      'openlibrary.org/search.json': () =>
        json({
          docs: [
            {
              title: "Harry Potter and the Philosopher's Stone",
              author_name: ['J. K. Rowling'],
            },
          ],
        }),
      'openlibrary.org/isbn/': () =>
        json({
          title: 'Harry Potter en de steen der wijzen',
          publishers: ['De Harmonie', 'Standaard'],
          publish_date: 'November 1998',
          covers: [-1, 15128106],
        }),
    });

    expect(await service.lookup(ISBN)).toEqual({
      title: 'Harry Potter en de steen der wijzen',
      author: 'J. K. Rowling',
      coverUrl: 'https://covers.openlibrary.org/b/id/15128106-M.jpg',
      publisher: 'De Harmonie, Standaard',
      year: '1998',
      source: 'openlibrary',
    });
  });

  it('falls back to the work when the edition record cannot be read', async () => {
    respond({
      'openlibrary.org/search.json': () =>
        json({
          docs: [{ title: 'Fantastic Mr Fox', author_name: ['Roald Dahl'] }],
        }),
    });

    expect(await service.lookup(ISBN)).toEqual({
      title: 'Fantastic Mr Fox',
      author: 'Roald Dahl',
      coverUrl: null,
      publisher: '',
      year: '',
      source: 'openlibrary',
    });
  });

  it('does not ask for an edition the search index does not know', async () => {
    respond({ 'openlibrary.org/search.json': () => json({ docs: [] }) });

    await service.lookup(ISBN);

    const urls = fetchSpy.calls.allArgs().map(([input]) => String(input));
    expect(
      urls.some((url) => url.includes('openlibrary.org/isbn/')),
    ).toBeFalse();
  });

  it('never calls the legacy /api/books endpoint', async () => {
    respond({ 'openlibrary.org/search.json': () => json({ docs: [] }) });

    await service.lookup(ISBN);

    const urls = fetchSpy.calls.allArgs().map(([input]) => String(input));
    expect(urls.some((url) => url.includes('/api/books'))).toBeFalse();
  });
});
