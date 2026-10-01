/**
 * Turns a photo from a phone camera into the thumbnail that is stored as a
 * book's cover.
 *
 * A cover is shown at most 80 CSS pixels wide, so 200 × 300 stays sharp on a
 * high-density screen, while a photo of several megabytes shrinks to roughly
 * ten kilobytes. That is what makes it affordable to keep covers in Firestore
 * rather than in a file store.
 */
export const COVER_MAX_WIDTH = 200;
export const COVER_MAX_HEIGHT = 300;
/** Upper limit for a stored cover. `firestore.rules` enforces the same number. */
export const COVER_MAX_BYTES = 32 * 1024;

/** WebP first: about a third smaller than JPEG at the same quality. Safari cannot write it and gets JPEG. */
const FORMATS = ['image/webp', 'image/jpeg'] as const;
/** Tried in order until the result fits `COVER_MAX_BYTES`; the first one nearly always does. */
const QUALITIES = [0.75, 0.6, 0.45, 0.3] as const;

export type CoverImageErrorCode = 'unreadable' | 'too-large';

/** A photo that cannot become a cover; the UI translates the code. */
export class CoverImageError extends Error {
  constructor(readonly code: CoverImageErrorCode) {
    super(code);
    this.name = 'CoverImageError';
  }
}

export interface CoverImage {
  bytes: Uint8Array;
  contentType: string;
  width: number;
  height: number;
}

interface Size {
  width: number;
  height: number;
}

/** Something that holds decoded pixels, and with them a good deal of memory. */
type Pixels = ImageBitmap | HTMLCanvasElement;

/** The largest size with the same proportions that fits the box. Never enlarges. */
export function fitWithin(width: number, height: number, maxWidth: number, maxHeight: number): Size {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export async function makeCoverImage(photo: Blob): Promise<CoverImage> {
  const source = await decode(photo);
  const size = fitWithin(source.width, source.height, COVER_MAX_WIDTH, COVER_MAX_HEIGHT);
  const thumbnail = downscale(source, size);
  try {
    const encoded = await encode(thumbnail);
    return { bytes: new Uint8Array(await encoded.arrayBuffer()), contentType: encoded.type, ...size };
  } finally {
    release(thumbnail);
  }
}

async function decode(photo: Blob): Promise<ImageBitmap> {
  try {
    // A phone stores a portrait photo as landscape pixels plus an orientation tag, which browsers apply by
    // default. Asking for that by name ('from-image') would be refused by browsers older than the option.
    return await createImageBitmap(photo);
  } catch {
    throw new CoverImageError('unreadable');
  }
}

/**
 * Shrinks in halving steps. One jump from 4000 pixels to 200 skips most of the
 * source pixels and leaves a grainy cover; halving averages them on the way.
 * Uses up `source`: every step gives its input back as soon as it is drawn.
 */
function downscale(source: ImageBitmap, target: Size): HTMLCanvasElement {
  let current: Pixels = source;
  let { width, height } = source;
  while (width / 2 >= target.width && height / 2 >= target.height) {
    width = Math.ceil(width / 2);
    height = Math.ceil(height / 2);
    current = resize(current, { width, height });
  }
  return resize(current, target);
}

function resize(image: Pixels, size: Size): HTMLCanvasElement {
  try {
    return draw(image, size);
  } finally {
    release(image);
  }
}

/**
 * Hands the pixels back now instead of at the next garbage collection. A phone
 * photo is some 50 MB decoded, and iOS caps the memory of all canvases
 * together: without this, photographing many covers in a row runs into it.
 */
function release(image: Pixels): void {
  if (image instanceof HTMLCanvasElement) image.width = image.height = 0;
  else image.close();
}

function draw(image: Pixels, size: Size): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) throw new CoverImageError('unreadable');
  // JPEG has no transparency: without a background a transparent PNG would turn black.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size.width, size.height);
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, size.width, size.height);
  return canvas;
}

async function encode(canvas: HTMLCanvasElement): Promise<Blob> {
  for (const format of FORMATS) {
    for (const quality of QUALITIES) {
      const blob = await toBlob(canvas, format, quality);
      // A browser that cannot write the format answers with PNG instead of failing.
      if (blob?.type !== format) break;
      if (blob.size <= COVER_MAX_BYTES) return blob;
    }
  }
  throw new CoverImageError('too-large');
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
