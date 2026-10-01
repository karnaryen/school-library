import { coverInitial, coverTone } from './cover-placeholder';

describe('cover placeholder', () => {
  describe('coverInitial', () => {
    it('takes the first letter of the title, in upper case', () => {
      expect(coverInitial('Dolfje Weerwolfje')).toBe('D');
      expect(coverInitial('  jip en Janneke')).toBe('J');
    });

    it('skips a leading Dutch article', () => {
      expect(coverInitial('De Gruffalo')).toBe('G');
      expect(coverInitial('Het leven van een loser')).toBe('L');
      expect(coverInitial('een gat in mijn emmer')).toBe('G');
      expect(coverInitial("'t Is weer voorbij")).toBe('I');
    });

    it('keeps the article when it is the whole title', () => {
      expect(coverInitial('Het')).toBe('H');
    });

    it('only treats a whole word as an article', () => {
      expect(coverInitial('Dertien')).toBe('D');
      expect(coverInitial('Hete soep')).toBe('H');
    });

    it('accepts digits and accented letters, and skips punctuation', () => {
      expect(coverInitial('13 verdiepingen')).toBe('1');
      expect(coverInitial('"Écht waar!"')).toBe('É');
    });

    it('answers ? when the title has no letter or digit', () => {
      expect(coverInitial('')).toBe('?');
      expect(coverInitial(' … ')).toBe('?');
    });
  });

  describe('coverTone', () => {
    it('is stable for a title, whatever its case or padding', () => {
      expect(coverTone('De Gruffalo', 8)).toBe(coverTone('  de gruffalo ', 8));
    });

    it('stays below the number of tones', () => {
      for (const title of ['', 'A', 'Dog Man en de gekloonde kat', 'Het basisschoolboek', '😀'.repeat(40)]) {
        const tone = coverTone(title, 8);
        expect(Number.isInteger(tone)).toBeTrue();
        expect(tone).toBeGreaterThanOrEqual(0);
        expect(tone).toBeLessThan(8);
      }
    });

    it('spreads different titles over more than one tone', () => {
      const titles = ['De Gruffalo', 'Dolfje Weerwolfje', 'Jip en Janneke', 'Pluk van de Petteflet', 'Kikker is Kikker', 'Mees Kees op de kast'];
      expect(new Set(titles.map((title) => coverTone(title, 8))).size).toBeGreaterThan(2);
    });
  });
});
