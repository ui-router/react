import * as React from 'react';
import { TransitionOptions, RawParams, StateOrName, TransitionPromise, memoryLocationPlugin } from '@uirouter/core';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { UIRouterReact } from '../core';
import { servicesPlugin, UIRouter } from '../index';
import { ReactStateDeclaration } from '../interface';

export const makeTestRouter = (states: ReactStateDeclaration[]) => {
  const router = new UIRouterReact();
  router.plugin(servicesPlugin);
  router.plugin(memoryLocationPlugin);
  router.locationConfig.html5Mode = () => true;
  states.forEach((state) => router.stateRegistry.register(state));

  const mountInRouter: typeof render = (children, opts?) => {
    const WrapperComponent = (props) => {
      const cloned = React.cloneElement(children, props);
      return <UIRouter router={router}>{cloned}</UIRouter>;
    };

    return render(<WrapperComponent />, opts) as any;
  };

  const routerGo = function (to: StateOrName, params?: RawParams, options?: TransitionOptions): TransitionPromise {
    return act(() => router.stateService.go(to, params, options) as any) as any;
  };

  return { router, routerGo, mountInRouter };
};

// silence console errors that are logged by react-dom or other actors
export function muteConsoleErrors() {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
}

export function defer<T = any>() {
  let resolve;
  let reject;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
}

describe('makeTestRouter', () => {
  it('returns a router and mountInRouter function', () => {
    const result = makeTestRouter([]);
    expect(result).toEqual({
      router: expect.any(UIRouterReact),
      routerGo: expect.any(Function),
      mountInRouter: expect.any(Function),
    });
  });
});
