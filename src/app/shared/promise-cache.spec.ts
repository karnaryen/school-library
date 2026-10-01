import { PromiseCache } from './promise-cache';

describe('PromiseCache', () => {
  it('loads once and answers from memory afterwards', async () => {
    const cache = new PromiseCache<string>(10);
    const load = jasmine.createSpy('load').and.resolveTo('cover');

    expect(await cache.get('a', load)).toBe('cover');
    expect(await cache.get('a', load)).toBe('cover');

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('shares one load between callers that ask at the same time', async () => {
    const cache = new PromiseCache<string>(10);
    const load = jasmine.createSpy('load').and.resolveTo('cover');

    const answers = await Promise.all([cache.get('a', load), cache.get('a', load)]);

    expect(answers).toEqual(['cover', 'cover']);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('keeps keys apart', async () => {
    const cache = new PromiseCache<string>(10);

    expect(await cache.get('a', () => Promise.resolve('first'))).toBe('first');
    expect(await cache.get('b', () => Promise.resolve('second'))).toBe('second');
  });

  it('forgets a failure, so the next caller tries again', async () => {
    const cache = new PromiseCache<string>(10);
    const load = jasmine.createSpy('load').and.returnValues(Promise.reject(new Error('offline')), Promise.resolve('cover'));

    await expectAsync(cache.get('a', load)).toBeRejectedWithError('offline');

    expect(await cache.get('a', load)).toBe('cover');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('answers with a value that was set, without loading', async () => {
    const cache = new PromiseCache<string>(10);
    const load = jasmine.createSpy('load').and.resolveTo('fetched');
    cache.set('a', 'known');

    expect(await cache.get('a', load)).toBe('known');
    expect(load).not.toHaveBeenCalled();
  });

  it('drops the answer remembered longest ago when it is full', async () => {
    const cache = new PromiseCache<string>(2);
    const load = jasmine.createSpy('load').and.callFake(() => Promise.resolve('fetched'));
    cache.set('a', 'first');
    cache.set('b', 'second');
    cache.set('c', 'third');

    expect(await cache.get('b', load)).toBe('second');
    expect(await cache.get('c', load)).toBe('third');
    expect(load).not.toHaveBeenCalled();

    expect(await cache.get('a', load)).toBe('fetched');
    expect(load).toHaveBeenCalledTimes(1);
  });
});
