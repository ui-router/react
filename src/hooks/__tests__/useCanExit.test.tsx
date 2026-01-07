import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { TransitionHookFn } from '@uirouter/core';
import { makeTestRouter } from '../../__tests__/util';
import { UIView } from '../../components';
import { ReactStateDeclaration } from '../../interface';
import { useCanExit } from '../useCanExit';

const state1 = { name: 'state1', url: '/state1', component: UIView };

function TestComponent({ callback }: { callback: TransitionHookFn }) {
  useCanExit(callback);
  return <div />;
}

describe('useCanExit', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter([state1])));

  async function registerAndGo(state: ReactStateDeclaration) {
    router.stateRegistry.register(state);
    await routerGo(state);
  }

  it('can block a transition that exits the state it was used in', async () => {
    const callback = vi.fn(() => false);
    await registerAndGo({ name: 'state2', component: () => <TestComponent callback={callback} /> });
    mountInRouter(<UIView />);
    expect(routerGo('state1')).rejects.toMatchObject({
      message: 'The transition has been aborted',
    });
    expect(callback).toHaveBeenCalled();
    expect(router.globals.current.name).toBe('state2');
  });

  it('can block a transition using a Promise that resolves to false', async () => {
    const callback = vi.fn(() => Promise.resolve(false));
    await registerAndGo({ name: 'state2', component: () => <TestComponent callback={callback} /> });
    mountInRouter(<UIView />);
    expect(routerGo('state1')).rejects.toMatchObject({
      message: 'The transition has been aborted',
    });
    expect(callback).toHaveBeenCalled();
    expect(router.globals.current.name).toBe('state2');
  });

  it('can allow a transition using a Promise that resolves to true', async () => {
    const callback = vi.fn(() => Promise.resolve(true));
    await registerAndGo({ name: 'state2', component: () => <TestComponent callback={callback} /> });
    mountInRouter(<UIView />);
    await routerGo('state1');
    expect(router.globals.current.name).toBe('state1');
  });

  it('can allow a transition using a Promise that resolves to undefined', async () => {
    const callback = vi.fn(() => Promise.resolve(undefined));
    await registerAndGo({ name: 'state2', component: () => <TestComponent callback={callback} /> });
    mountInRouter(<UIView />);
    await routerGo('state1');
    expect(router.globals.current.name).toBe('state1');
  });

  it('can allow a transition that exits the state it was used in', async () => {
    const callback = vi.fn(() => true);
    await registerAndGo({ name: 'state2', component: () => <TestComponent callback={callback} /> });
    mountInRouter(<UIView />);
    await routerGo('state1');
    expect(callback).toHaveBeenCalled();
    expect(router.globals.current.name).toBe('state1');
  });

  it('can block a transition that goes to the parent state', async () => {
    const callback = vi.fn(() => false);
    await registerAndGo({ name: 'state1.child', component: () => <TestComponent callback={callback} /> });
    mountInRouter(<UIView />);
    expect(routerGo('state1')).rejects.toMatchObject({
      message: 'The transition has been aborted',
    });
    expect(callback).toHaveBeenCalled();
    expect(router.globals.current.name).toBe('state1.child');
  });

  it('does not block a transition which retains (does not exit) the state the hook was used in', async () => {
    const callback = vi.fn(() => false);
    const state2Component = () => (
      <>
        <TestComponent callback={callback} />
        <UIView />
      </>
    );

    // hook used in state2
    router.stateRegistry.register({ name: 'state2', component: state2Component } as ReactStateDeclaration);
    router.stateRegistry.register({ name: 'state2.child', component: () => <div /> } as ReactStateDeclaration);

    await routerGo('state2.child');
    mountInRouter(<UIView />);
    // exit state2.child but retain state2
    await routerGo('state2');

    expect(callback).not.toHaveBeenCalled();
    expect(router.globals.current.name).toBe('state2');
  });

  describe('implementation detail', () => {
    it('registers an onBefore transition hook', async () => {
      const callback = () => true;
      await registerAndGo({ name: 'state2', component: () => <TestComponent callback={callback} /> });
      const spy = vi.spyOn(router.transitionService, 'onBefore');
      mountInRouter(<UIView />);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ exiting: 'state2' }, expect.any(Function), undefined);
    });

    it('deregisters the onBefore transition hook when unmounted', async () => {
      const deregisterSpy = vi.fn();
      await registerAndGo({ name: 'state2', component: () => <TestComponent callback={() => true} /> });
      vi.spyOn(router.transitionService, 'onBefore').mockImplementation(() => deregisterSpy);
      mountInRouter(<UIView />);
      expect(deregisterSpy).toHaveBeenCalledTimes(0);

      await routerGo('state1');
      expect(router.globals.current.name).toBe('state1');
      expect(deregisterSpy).toHaveBeenCalledTimes(1);
    });
  });
});
