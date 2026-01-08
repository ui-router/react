import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { UIRouterContext, UIRouter } from '../UIRouter';
import { UIRouterReact } from '../../core';
import { memoryLocationPlugin } from '../../index';
import { muteConsoleErrors } from '../../__tests__/util';

class Child extends React.Component<any, any> {
  static propTypes = {
    router: PropTypes.object,
  };
  render() {
    return <div>child</div>;
  }
}

describe('<UIRouter>', () => {
  it('throws an error if no plugin or router instance is passed via prop', () => {
    muteConsoleErrors([/Router instance or plugins missing/, /The above error occurred in the <UIRouter> component:/]);
    expect(() =>
      render(
        <UIRouter>
          <Child />
        </UIRouter>
      )
    ).toThrow();
  });

  it('creates a router instance', () => {
    const rendered = render(
      <UIRouter plugins={[memoryLocationPlugin]} states={[]}>
        <UIRouterContext.Consumer>
          {(router) => <span>{router === undefined ? 'yes' : 'no'}</span>}
        </UIRouterContext.Consumer>
      </UIRouter>
    );
    expect(rendered.asFragment().textContent).toBe('no');
  });

  it('accepts an instance via prop', () => {
    const router = new UIRouterReact();
    router.plugin(memoryLocationPlugin);
    const rendered = render(
      <UIRouter router={router}>
        <UIRouterContext.Consumer>
          {(instance) => <span>{instance === router ? 'yes' : 'no'}</span>}
        </UIRouterContext.Consumer>
      </UIRouter>
    );
    expect(rendered.asFragment().textContent).toBe('yes');
  });

  it('starts the router', () => {
    const router = new UIRouterReact();
    router.plugin(memoryLocationPlugin);
    const spy = vi.spyOn(router, 'start');
    render(
      <UIRouter router={router}>
        <UIRouterContext.Consumer>{(router) => <Child router={router} />}</UIRouterContext.Consumer>
      </UIRouter>
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });

  describe('<UIRouterCosumer>', () => {
    it('passes down the router instance', () => {
      let router;

      render(
        <UIRouter plugins={[memoryLocationPlugin]}>
          <UIRouterContext.Consumer>
            {(_router) => {
              router = _router;
              return null;
            }}
          </UIRouterContext.Consumer>
        </UIRouter>
      );

      expect(router).toBeInstanceOf(UIRouterReact);
    });

    it('passes down the correct router instance when passed via props', () => {
      const router = new UIRouterReact();
      router.plugin(memoryLocationPlugin);
      render(
        <UIRouter router={router}>
          <UIRouterContext.Consumer>
            {(_router) => {
              expect(_router).toBe(router);
              return null;
            }}
          </UIRouterContext.Consumer>
        </UIRouter>
      );
    });
  });
});
