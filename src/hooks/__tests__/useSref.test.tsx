import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import { act } from 'react';
import { makeTestRouter, muteConsoleErrors } from '../../__tests__/util';
import { UIRouter, UIView } from '../../components';
import { UISrefActive, UISrefActiveContext } from '../../components/UISrefActive';
import { ReactStateDeclaration } from '../../interface';
import { useSref } from '../useSref';

const state = { name: 'state', url: '/state' };
const state2 = { name: 'state2', url: '/state2' };
const state3 = { name: 'state3', url: '/state3/:param' };

const Link = ({ to, params = undefined, children = undefined, target = undefined }) => {
  const sref = useSref(to, params);
  return (
    <a data-testid="anchor" {...sref} target={target}>
      {children}
    </a>
  );
};

describe('useSref', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => {
    muteConsoleErrors([/Not implemented: navigation to another Document/]);
    return ({ router, routerGo, mountInRouter } = makeTestRouter([state, state2, state3]));
  });

  it('throws if to is not a string', () => {
    muteConsoleErrors([
      /Error: The state name passed to useSref must be a string./,
      /The above error occurred in the <Link> component/,
    ]);
    expect(() => mountInRouter(<Link to={5} />)).toThrow(/must be a string/);
  });

  it('returns an href for the target state', () => {
    const rendered = mountInRouter(<Link to="state2">state2</Link>);
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/state2">state2</a>');
  });

  describe('onClick function', () => {
    it('activates the target state', () => {
      const spy = vi.spyOn(router.stateService, 'go');
      const rendered = mountInRouter(<Link to="state" />);
      rendered.getByTestId('anchor').click();

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith('state', expect.anything(), expect.anything());
    });

    it('respects defaultPrevented', () => {
      const spy = vi.spyOn(router.stateService, 'go');
      const rendered = mountInRouter(<Link to="state" />);
      const mouseEvent = new MouseEvent('click');
      mouseEvent.preventDefault();
      fireEvent(rendered.getByTestId('anchor'), mouseEvent);

      expect(spy).not.toHaveBeenCalled();
    });

    it('does not get called when middle or right clicked', () => {
      const spy = vi.spyOn(router.stateService, 'go');
      const rendered = mountInRouter(<Link to="state" />);

      fireEvent(rendered.getByTestId('anchor'), new MouseEvent('click', { button: 1 }));
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not get called if any of these modifiers are present: ctrl, meta, shift, alt', () => {
      const spy = vi.spyOn(router.stateService, 'go');
      const rendered = mountInRouter(<Link to="state" />);

      fireEvent(rendered.getByTestId('anchor'), new MouseEvent('click', { ctrlKey: true }));
      fireEvent(rendered.getByTestId('anchor'), new MouseEvent('click', { metaKey: true }));
      fireEvent(rendered.getByTestId('anchor'), new MouseEvent('click', { shiftKey: true }));
      fireEvent(rendered.getByTestId('anchor'), new MouseEvent('click', { altKey: true }));

      expect(spy).not.toHaveBeenCalled();
    });

    it('does not get called if the underlying DOM element has a "target" attribute', () => {
      const spy = vi.spyOn(router.stateService, 'go');
      const rendered = mountInRouter(<Link to="state" target="_blank" />);

      rendered.getByTestId('anchor').click();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  it('updates the href when the stateName changes', () => {
    const rendered = render(
      <UIRouter router={router}>
        <Link to="state" />
      </UIRouter>
    );
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/state"></a>');

    rendered.rerender(
      <UIRouter router={router}>
        <Link to="state2" />
      </UIRouter>
    );
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/state2"></a>');
  });

  it('updates the href when the params changes', () => {
    const rendered = render(
      <UIRouter router={router}>
        <Link to="state3" params={{ param: '123' }} />
      </UIRouter>
    );
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/state3/123"></a>');

    rendered.rerender(
      <UIRouter router={router}>
        <Link to="state3" params={{ param: '456' }} />
      </UIRouter>
    );
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/state3/456"></a>');
  });

  it('updates href when the registered state is swapped out', async () => {
    const rendered = mountInRouter(<Link to="state2" />);
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/state2"></a>');
    act(() => {
      router.stateRegistry.deregister('state2');
    });

    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor"></a>');
    act(() => {
      router.stateRegistry.register({ name: 'state2', url: '/asdfasdf' });
    });
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/asdfasdf"></a>');
  });

  it('updates future state hrefs when the list of registered states changes', async () => {
    const lazyLoadFutureStates = () =>
      Promise.resolve({
        states: [
          { name: 'future', url: '/future' },
          { name: 'future.child', url: '/child' },
        ],
      });
    router.stateRegistry.register({ name: 'future.**', url: '/future', lazyLoad: lazyLoadFutureStates });

    const rendered = mountInRouter(<Link to="future.child" />);
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/future"></a>');

    await routerGo('future.child');
    expect(rendered.container.innerHTML).toBe('<a data-testid="anchor" href="/future/child"></a>');
  });

  it('calls go() with the actual string provided (not with the name of the matched future state)', async () => {
    router.stateRegistry.register({ name: 'future.**', url: '/future' });

    const Link = (props) => {
      const sref = useSref('future.child', { param: props.param });
      return <a data-testid="anchor" {...sref} />;
    };

    vi.spyOn(router.stateService, 'go');
    const rendered = mountInRouter(<Link />);

    rendered.getByTestId('anchor').click();
    expect(router.stateService.go).toHaveBeenCalledTimes(1);
    expect(router.stateService.go).toHaveBeenCalledWith('future.child', expect.anything(), expect.anything());
  });

  it('participates in parent UISrefActive component active state', async () => {
    await routerGo('state2');

    const State2Link = (props) => {
      const sref = useSref('state2');
      return (
        <a {...sref} {...props}>
          state2
        </a>
      );
    };

    const rendered = mountInRouter(
      <UISrefActive class="active">
        <State2Link />
      </UISrefActive>
    );
    expect(rendered.container.innerHTML).toBe('<a href="/state2" class="active">state2</a>');
  });

  it('provides a fully qualified state name to the parent UISrefActive', async () => {
    const spy = vi.fn();
    const State2Link = () => {
      return (
        <UISrefActiveContext.Provider value={spy}>
          <Link to={'.child'} />
        </UISrefActiveContext.Provider>
      );
    };

    router.stateRegistry.register({ name: 'parent', component: State2Link } as ReactStateDeclaration);
    router.stateRegistry.register({ name: 'parent.child', component: UIView } as ReactStateDeclaration);

    await routerGo('parent');
    mountInRouter(<UIView />);
    expect(spy).toHaveBeenCalledWith('parent.child', expect.anything());
  });

  it('participates in grandparent UISrefActive component active state', async () => {
    await routerGo('state2');

    const State2Link = (props) => {
      const sref = useSref('state2');
      return (
        <a {...sref} className={props.className}>
          state2
        </a>
      );
    };

    const Component = () => {
      return (
        <UISrefActive class="grandparentactive">
          <div>
            <UISrefActive class="active">
              <State2Link />
            </UISrefActive>
          </div>
        </UISrefActive>
      );
    };

    const rendered = mountInRouter(<Component />);
    expect(rendered.container.innerHTML).toBe(
      '<div class="grandparentactive"><a href="/state2" class="active">state2</a></div>'
    );
  });

  it('stops participating in parent/grandparent UISrefActive component active state when unmounted', async () => {
    await routerGo('state2');
    const State2Link = (props) => {
      const sref = useSref('state2');
      return (
        <a {...sref} className={props.className}>
          state2
        </a>
      );
    };

    const Component = (props) => {
      return (
        <UIRouter router={router}>
          <UISrefActive class="grandparentactive">
            <div>
              <UISrefActive class="active">{props.show ? <State2Link /> : <span />}</UISrefActive>
            </div>
          </UISrefActive>
        </UIRouter>
      );
    };

    const rendered = render(<Component show={true} />);
    expect(rendered.container.innerHTML).toBe(
      '<div class="grandparentactive"><a href="/state2" class="active">state2</a></div>'
    );
    rendered.rerender(<Component show={false} />);
    expect(rendered.container.innerHTML).toBe('<div><span></span></div>');
  });

  describe('implementation detail: ', () => {
    it('registers itself with the parent UISrefActive addStateInfo callback', () => {
      const spy = vi.fn();
      const Component = () => {
        const uiSref = useSref('state', {});
        return <a {...uiSref} />;
      };

      mountInRouter(
        <UISrefActiveContext.Provider value={spy}>
          <Component />
        </UISrefActiveContext.Provider>
      );

      expect(spy).toBeCalledTimes(1);
    });

    it('deregisters itself with the parent UISrefActive addStateInfo callback when unmounted', () => {
      const spy = vi.fn();
      const Component = () => {
        const uiSref = useSref('state', {});
        return <a {...uiSref} />;
      };

      const rendered = mountInRouter(
        <UISrefActiveContext.Provider value={() => spy}>
          <Component />
        </UISrefActiveContext.Provider>
      );

      expect(spy).toBeCalledTimes(0);
      rendered.unmount();
      expect(spy).toBeCalledTimes(1);
    });
  });
});
