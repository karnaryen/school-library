/**
 * What stands in for a cover the school has no picture of: a coloured tile
 * with one letter. Both are derived from the title alone, so a book looks the
 * same on every device without anything being stored for it.
 */

/** A title is not remembered by its article: "De Gruffalo" is a G. */
const ARTICLES = new Set(['de', 'het', 'een', "'t", '’t']);

/** The letter (or digit) on the tile; `?` for a title without any. */
export function coverInitial(title: string): string {
  const words = title.trim().split(/\s+/);
  const start = words.length > 1 && ARTICLES.has(words[0].toLowerCase()) ? 1 : 0;
  const first = /[\p{L}\p{N}]/u.exec(words.slice(start).join(' '))?.[0];
  return first ? first.toLocaleUpperCase('nl') : '?';
}

/** A stable index below `tones` for a title, so a book keeps its colour between visits. */
export function coverTone(title: string, tones: number): number {
  const text = title.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash % tones;
}
