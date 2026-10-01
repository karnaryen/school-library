import { COVER_MAX_BYTES, COVER_MAX_HEIGHT, COVER_MAX_WIDTH, CoverImageError, fitWithin, makeCoverImage } from './cover-image';

/** A stand-in for a camera photo: every pixel random, which is the hardest thing there is to compress. */
function noisePhoto(width: number, height: number, type = 'image/jpeg'): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const pixels = context.createImageData(width, height);
  for (let i = 0; i < pixels.data.length; i++) pixels.data[i] = i % 4 === 3 ? 255 : Math.floor(Math.random() * 256);
  context.putImageData(pixels, 0, 0);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob as Blob), type, 0.95));
}

/**
 * A 16 × 8 JPEG whose EXIF orientation says "turn me a quarter", the way a
 * phone stores a photo taken upright. Shown correctly it is 8 wide and 16 high.
 */
const UPRIGHT_PHONE_PHOTO =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDxKvIaKK/VPAz/AJmX/cL/ANyn7X4yf8y//uL/AO4z/9k=';

function fromBase64(base64: string, type: string): Blob {
  return new Blob([Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))], { type });
}

async function sizeOf(bytes: Uint8Array, contentType: string): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type: contentType }));
  return { width: bitmap.width, height: bitmap.height };
}

describe('cover image', () => {
  describe('fitWithin', () => {
    it('shrinks a portrait photo to the box, keeping its proportions', () => {
      expect(fitWithin(3000, 4000, 200, 300)).toEqual({ width: 200, height: 267 });
    });

    it('lets the height decide for a tall photo', () => {
      expect(fitWithin(1000, 3000, 200, 300)).toEqual({ width: 100, height: 300 });
    });

    it('lets the width decide for a landscape photo', () => {
      expect(fitWithin(4000, 3000, 200, 300)).toEqual({ width: 200, height: 150 });
    });

    it('never enlarges a small image', () => {
      expect(fitWithin(120, 90, 200, 300)).toEqual({ width: 120, height: 90 });
    });

    it('never rounds a side down to nothing', () => {
      expect(fitWithin(4000, 2, 200, 300)).toEqual({ width: 200, height: 1 });
    });
  });

  describe('makeCoverImage', () => {
    it('turns a large photo into a thumbnail under the byte limit', async () => {
      const cover = await makeCoverImage(await noisePhoto(1500, 2000));

      expect({ width: cover.width, height: cover.height }).toEqual({ width: 200, height: 267 });
      expect(['image/webp', 'image/jpeg']).toContain(cover.contentType);
      expect(cover.bytes.byteLength).toBeGreaterThan(0);
      expect(cover.bytes.byteLength).toBeLessThanOrEqual(COVER_MAX_BYTES);
    });

    it('writes an image of the size it reports', async () => {
      const cover = await makeCoverImage(await noisePhoto(1600, 1200));

      expect(await sizeOf(cover.bytes, cover.contentType)).toEqual({ width: cover.width, height: cover.height });
      expect(cover.width).toBeLessThanOrEqual(COVER_MAX_WIDTH);
      expect(cover.height).toBeLessThanOrEqual(COVER_MAX_HEIGHT);
    });

    it('keeps an image that is already small at its own size', async () => {
      const cover = await makeCoverImage(await noisePhoto(90, 120, 'image/png'));

      expect({ width: cover.width, height: cover.height }).toEqual({ width: 90, height: 120 });
    });

    it('turns a photo the way the phone meant it', async () => {
      const cover = await makeCoverImage(fromBase64(UPRIGHT_PHONE_PHOTO, 'image/jpeg'));

      expect({ width: cover.width, height: cover.height }).toEqual({ width: 8, height: 16 });
    });

    it('writes JPEG in a browser that cannot write WebP', async () => {
      // Safari answers a request for WebP with a PNG instead of an error.
      const photo = await noisePhoto(600, 800);
      const toBlob = HTMLCanvasElement.prototype.toBlob;
      spyOn(HTMLCanvasElement.prototype, 'toBlob').and.callFake(function (this: HTMLCanvasElement, callback, type, quality) {
        toBlob.call(this, callback, type === 'image/webp' ? 'image/png' : type, quality);
      });

      const cover = await makeCoverImage(photo);

      expect(cover.contentType).toBe('image/jpeg');
      expect(cover.bytes.byteLength).toBeLessThanOrEqual(COVER_MAX_BYTES);
    });

    it('refuses a photo that stays above the byte limit at every quality', async () => {
      const photo = await noisePhoto(600, 800);
      spyOn(HTMLCanvasElement.prototype, 'toBlob').and.callFake((callback, type) =>
        callback(new Blob([new Uint8Array(COVER_MAX_BYTES + 1)], { type })),
      );

      await expectAsync(makeCoverImage(photo)).toBeRejectedWith(new CoverImageError('too-large'));
    });

    it('refuses a file that is not an image', async () => {
      const notAnImage = new Blob(['not an image'], { type: 'image/jpeg' });

      await expectAsync(makeCoverImage(notAnImage)).toBeRejectedWith(new CoverImageError('unreadable'));
    });
  });
});
