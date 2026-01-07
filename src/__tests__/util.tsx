import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
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

// Silence errors from React error boundaries during tests that expect errors.
// React logs to console.error AND writes stack traces directly to stderr.
const originalStderrWrite = process.stderr.write.bind(process.stderr);
const originalConsoleError = console.error.bind(console);
export function muteConsoleErrors(messages: RegExp[] = []) {
  const maybeMute =
    (originalWriteFn: (...args: any[]) => boolean) =>
    (...args: any[]) => {
      if (messages.some((regex) => regex.test(args[0]?.toString?.() ?? ''))) {
        return true;
      }
      return originalWriteFn(...args);
    };

  vi.spyOn(console, 'error').mockImplementation(maybeMute(originalConsoleError));
  vi.spyOn(process.stderr, 'write').mockImplementation(maybeMute(originalStderrWrite));
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
