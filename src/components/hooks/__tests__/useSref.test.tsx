import * as React from 'react';
import { makeTestRouter, muteConsoleErrors } from '../../__tests__/util';
import { useSref } from '../useSref';
import { UISref } from '../../UISref';
import { UISrefActiveContext } from '../../UISrefActive';

const state = {
  name: 'state',
  url: '',
  component: () => (
    <UISref to="state2">
      <a>state2</a>
    </UISref>
  ),
};

const state2 = {
  name: 'state2',
  url: '/state2',
  component: () => <span>state2</span>,
};

describe('useUiSref', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter([state, state2])));

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
