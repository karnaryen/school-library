/**
 * Remembers the answer to an asynchronous question, so asking again does not
 * fetch again and two callers asking at once share one fetch.
 *
 * A failure is forgotten, so the next caller tries again. The cache holds at
 * most `limit` answers and drops the one remembered longest ago to make room.
 */
export class PromiseCache<T> {
  private readonly entries = new Map<string, Promise<T>>();

  constructor(private readonly limit: number) {}

  /** The remembered answer for `key`, or the result of `load` when there is none yet. */
  get(key: string, load: () => Promise<T>): Promise<T> {
    const known = this.entries.get(key);
    if (known) return known;

    const loading = load();
    this.remember(key, loading);
    loading.catch(() => {
      if (this.entries.get(key) === loading) this.entries.delete(key);
    });
    return loading;
  }

  /** Records an answer that is already known, replacing whatever was remembered for `key`. */
  set(key: string, value: T): void {
    this.remember(key, Promise.resolve(value));
  }

  private remember(key: string, value: Promise<T>): void {
    // Re-inserting moves the key to the end, so a replaced answer counts as new.
    this.entries.delete(key);
    this.entries.set(key, value);
    if (this.entries.size > this.limit) {
      const oldest = this.entries.keys().next();
      if (!oldest.done) this.entries.delete(oldest.value);
    }
  }
}
