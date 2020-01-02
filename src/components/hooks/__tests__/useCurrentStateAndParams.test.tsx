import * as React from 'react';
import { RawParams, StateDeclaration, StateService } from '@uirouter/core';
import { UIRouterReact } from '../../../core';
import { defer, makeTestRouter } from '../../__tests__/util';
import { useCurrentStateAndParams } from '../useCurrentStateAndParams';

const state1 = { name: 'state1', url: '/state1/:param', params: { param: null } };
const state2 = { name: 'state2', url: '/state2/:param', params: { param: null } };

describe('useCurrentStateAndParams', () => {
  let router: UIRouterReact;
  let routerGo: StateService['go'];
  let mountInRouter;
  let hookSpy = jest.fn();

  function TestComponent({ spy }: { spy: (state: StateDeclaration, params: RawParams) => void }) {
    const current = useCurrentStateAndParams();
    spy(current.state, current.params);
    return <div />;
  }

  beforeEach(() => {
    ({ router, routerGo, mountInRouter } = makeTestRouter([state1, state2]));
    hookSpy = jest.fn();
    mountInRouter(<TestComponent spy={hookSpy} />);
    hookSpy.mockReset();
  });

  it('returns the current state', async () => {
    await routerGo('state1');
    expect(hookSpy).toHaveBeenCalledTimes(1);
    expect(hookSpy.mock.calls[0][0]).toBe(state1);
  });

  it('returns the current params', async () => {
    await routerGo('state1', { param: '123' });
    expect(hookSpy).toHaveBeenCalledTimes(1);
    expect(hookSpy.mock.calls[0][1]).toEqual(expect.objectContaining({ param: '123' }));
  });

  it('returns the previous state until a pending transition is successful', async () => {
    await routerGo('state1', { param: '123' });
    expect(hookSpy).toHaveBeenCalledTimes(1);
    expect(hookSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'state1' }), expect.anything());

    const { promise, resolve } = defer();
    router.transitionService.onStart({ to: 'state2' }, transition => promise);
    const goPromise = routerGo('state2', { param: '456' });

    expect(hookSpy).toHaveBeenCalledTimes(1);
    resolve();
    await goPromise;
    expect(hookSpy).toHaveBeenCalledTimes(2);
    expect(hookSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'state2' }), expect.anything());
  });

  it('returns the previous state if transition is unsuccessful', async () => {
    await routerGo('state1', { param: '123' });
    expect(hookSpy).toHaveBeenCalledTimes(1);
    expect(hookSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'state1' }), expect.anything());

    const { promise, reject } = defer();
    router.transitionService.onStart({ to: 'state2' }, transition => promise);
    const goPromise = routerGo('state2', { param: '456' });

    expect(hookSpy).toHaveBeenCalledTimes(1);
    try {
      router.stateService.defaultErrorHandler(() => null);
      reject();
      await goPromise;
    } catch (error) {}
    expect(hookSpy).toHaveBeenCalledTimes(1);
  });
});
