import { whenNearViewport } from './viewport';

describe('whenNearViewport', () => {
  const elements: HTMLElement[] = [];

  function add(top: string): HTMLElement {
    const element = document.createElement('div');
    element.style.cssText = `position: absolute; left: 0; top: ${top}; width: 10px; height: 10px`;
    document.body.appendChild(element);
    elements.push(element);
    return element;
  }

  /** A callback to wait with, and a promise that resolves when it is first called. */
  function arrival(): { arrived: jasmine.Spy<() => void>; called: Promise<void> } {
    let resolve = (): void => undefined;
    const called = new Promise<void>((done) => (resolve = done));
    return { arrived: jasmine.createSpy('arrived').and.callFake(() => resolve()), called };
  }

  /**
   * Gives the browser the time to report what is on screen, for the tests that
   * expect to hear nothing: a fresh observer has heard about its own element,
   * and the callbacks delivered along with that have run.
   */
  async function reported(): Promise<void> {
    await new Promise<void>((resolve) => {
      const probe = new IntersectionObserver(() => {
        probe.disconnect();
        resolve();
      });
      probe.observe(add('0'));
    });
    await new Promise((resolve) => setTimeout(resolve));
  }

  afterEach(() => elements.splice(0).forEach((element) => element.remove()));

  it('calls back once for an element that is on screen', async () => {
    const { arrived, called } = arrival();
    whenNearViewport(add('0'), arrived);

    await called;
    await reported();

    expect(arrived).toHaveBeenCalledTimes(1);
  });

  it('waits for an element far below the screen until it is scrolled to', async () => {
    const { arrived, called } = arrival();
    const element = add('20000px');
    whenNearViewport(element, arrived);
    await reported();
    expect(arrived).not.toHaveBeenCalled();

    element.style.top = '0';
    await called;

    expect(arrived).toHaveBeenCalledTimes(1);
  });

  it('tells elements apart', async () => {
    const near = arrival();
    const far = arrival();
    whenNearViewport(add('0'), near.arrived);
    whenNearViewport(add('20000px'), far.arrived);

    await near.called;
    await reported();

    expect(near.arrived).toHaveBeenCalledTimes(1);
    expect(far.arrived).not.toHaveBeenCalled();
  });

  it('does not call back after waiting was stopped', async () => {
    const { arrived } = arrival();
    const element = add('20000px');
    const stop = whenNearViewport(element, arrived);
    await reported();

    stop();
    element.style.top = '0';
    await reported();
    await reported();

    expect(arrived).not.toHaveBeenCalled();
  });
});
