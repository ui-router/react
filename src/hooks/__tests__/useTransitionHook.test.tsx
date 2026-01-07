import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import { makeTestRouter } from '../../__tests__/util';
import { useTransitionHook } from '../useTransitionHook';

describe('useRouterHook', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter([])));

  it('registers with the correct transitionService hook on mount', async () => {
    function TestComponent() {
      useTransitionHook('onBefore', {}, () => null);
      return <div />;
    }

    vi.spyOn(router.transitionService, 'onBefore');
    mountInRouter(<TestComponent />);
    expect(router.transitionService.onBefore).toHaveBeenCalledTimes(1);
  });

  it('de-registers the hook on unmount', async () => {
    function TestComponent() {
      useTransitionHook('onBefore', {}, () => null);
      return <div />;
    }

    const deregisterSpy = vi.fn();
    vi.spyOn(router.transitionService, 'onBefore').mockImplementation(() => deregisterSpy);
    const wrapper = mountInRouter(<TestComponent />);
    expect(router.transitionService.onBefore).toHaveBeenCalledTimes(1);
    expect(deregisterSpy).not.toHaveBeenCalled();

    wrapper.unmount();
    expect(deregisterSpy).toHaveBeenCalled();
  });
});
