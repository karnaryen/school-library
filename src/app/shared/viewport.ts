/** How far outside the viewport still counts as near, so content is there by the time it scrolls in. */
const MARGIN = '200px';

const waiting = new Map<Element, () => void>();
let observer: IntersectionObserver | undefined;

/**
 * Calls `callback` once, when `element` first comes near the viewport.
 * Returns a function that stops waiting; calling it afterwards is harmless.
 *
 * Every caller shares one observer: a book list has a cover per row, and a
 * browser handles one observer with a thousand targets far better than a
 * thousand observers.
 */
export function whenNearViewport(element: Element, callback: () => void): () => void {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const arrived = waiting.get(entry.target);
        stop(entry.target);
        arrived?.();
      }
    },
    { rootMargin: MARGIN },
  );
  waiting.set(element, callback);
  observer.observe(element);
  return () => stop(element);
}

function stop(element: Element): void {
  waiting.delete(element);
  observer?.unobserve(element);
}
