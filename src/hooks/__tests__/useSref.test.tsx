import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { makeTestRouter, muteConsoleErrors } from '../../__tests__/util';
import { useSref } from '../useSref';
import { UISrefActive, UISrefActiveContext } from '../../components/UISrefActive';

const state = { name: 'state', url: '/state' };
const state2 = { name: 'state2', url: '/state2' };
const state3 = { name: 'state3', url: '/state3/:param' };

describe('useUiSref', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter([state, state2, state3])));

  it('throws if to is not a string', () => {
    const Component = () => {
      const sref = useSref(5 as any, {});
      return <a {...sref} />;
    };

    muteConsoleErrors();
    expect(() => mountInRouter(<Component />)).toThrow(/must be a string/);
  });

  it('returns an href for the target state', () => {
    const Component = () => {
      const uiSref = useSref('state2', {});
      return <a {...uiSref}>state2</a>;
    };
    const wrapper = mountInRouter(<Component />);
    expect(wrapper.html()).toBe('<a href="/state2">state2</a>');
  });

  it('returns an onClick function which activates the target state', () => {
    const spy = jest.spyOn(router.stateService, 'go');
    const Component = () => {
      const uiSref = useSref('state');
      return <a {...uiSref}>state</a>;
    };

    const wrapper = mountInRouter(<Component />);
    wrapper.simulate('click');

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith('state', expect.anything(), expect.anything());
  });

  it('returns an onClick function which respects defaultPrevented', () => {
    const spy = jest.spyOn(router.stateService, 'go');
    const Component = () => {
      const uiSref = useSref('state');
      return <a {...uiSref}>state</a>;
    };

    const wrapper = mountInRouter(<Component />);
    wrapper.simulate('click', { defaultPrevented: true });

    expect(spy).not.toHaveBeenCalled();
  });

  it('updates the href when the stateName changes', () => {
    const Component = props => {
      const uiSref = useSref(props.state);
      return <a {...uiSref} />;
    };

    const wrapper = mountInRouter(<Component state="state" />);
    expect(wrapper.html()).toBe('<a href="/state"></a>');

    wrapper.setProps({ state: 'state2' });
    expect(wrapper.html()).toBe('<a href="/state2"></a>');
  });

  it('updates the href when the params changes', () => {
    const State3Link = props => {
      const sref = useSref('state3', { param: props.param });
      return <a {...sref} />;
    };

    const wrapper = mountInRouter(<State3Link param="123" />);
    expect(wrapper.html()).toBe('<a href="/state3/123"></a>');

    wrapper.setProps({ param: '456' });
    expect(wrapper.html()).toBe('<a href="/state3/456"></a>');
  });

  it('updates href when the registered state is swapped out', async () => {
    const State2Link = () => {
      const sref = useSref('state2');
      return <a {...sref} />;
    };

    const wrapper = mountInRouter(<State2Link />);
    expect(wrapper.html()).toBe('<a href="/state2"></a>');
    act(() => {
      router.stateRegistry.deregister('state2');
    });

    expect(wrapper.update().html()).toBe('<a></a>');
    act(() => {
      router.stateRegistry.register({ name: 'state2', url: '/asdfasdf' });
    });
    expect(wrapper.update().html()).toBe('<a href="/asdfasdf"></a>');
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

    const Link = props => {
      const sref = useSref('future.child', { param: props.param });
      return <a {...sref} />;
    };

    const wrapper = mountInRouter(<Link />);
    expect(wrapper.html()).toBe('<a href="/future"></a>');

    await routerGo('future.child');
    expect(wrapper.update().html()).toBe('<a href="/future/child"></a>');
  });

  it('participates in parent UISrefActive component active state', async () => {
    await routerGo('state2');

    const State2Link = props => {
      const sref = useSref('state2');
      return (
        <a {...sref} className={props.className}>
          state2
        </a>
      );
    };

    const wrapper = mountInRouter(
      <UISrefActive class="active">
        <State2Link />
      </UISrefActive>
    );
    expect(wrapper.html()).toBe('<a href="/state2" class="active">state2</a>');
  });

  it('participates in grandparent UISrefActive component active state', async () => {
    await routerGo('state2');

    const State2Link = props => {
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

    const wrapper = mountInRouter(<Component />);
    expect(wrapper.html()).toBe('<div class="grandparentactive"><a href="/state2" class="active">state2</a></div>');
  });

  it('stops participating in parent/grandparent UISrefActive component active state when unmounted', async () => {
    await routerGo('state2');

    const State2Link = props => {
      const sref = useSref('state2');
      return (
        <a {...sref} className={props.className}>
          state2
        </a>
      );
    };

    const Component = props => {
      return (
        <UISrefActive class="grandparentactive">
          <div>
            <UISrefActive class="active">{props.show ? <State2Link /> : <span />}</UISrefActive>
          </div>
        </UISrefActive>
      );
    };

    const wrapper = mountInRouter(<Component show={true} />);
    expect(wrapper.html()).toBe('<div class="grandparentactive"><a href="/state2" class="active">state2</a></div>');

    wrapper.setProps({ show: false });
    expect(wrapper.html()).toBe('<div><span></span></div>');
  });

  describe('implementation detail: ', () => {
    it('registers itself with the parent UISrefActive addStateInfo callback', () => {
      const spy = jest.fn();
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
      const spy = jest.fn();
      const Component = () => {
        const uiSref = useSref('state', {});
        return <a {...uiSref} />;
      };

      const wrapper = mountInRouter(
        <UISrefActiveContext.Provider value={() => spy}>
          <Component />
        </UISrefActiveContext.Provider>
      );

      expect(spy).toBeCalledTimes(0);
      wrapper.unmount();
      expect(spy).toBeCalledTimes(1);
    });
  });
});
