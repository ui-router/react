import * as React from 'react';
import { RawParams } from '@uirouter/core';
import { makeTestRouter } from '../../__tests__/util';
import { useIsActive } from '../useIsActive';

const state1 = { name: 'state1', url: '/state1' };
const state1Child = { name: 'state1.child', url: '/child' };
const state2 = { name: 'state2', url: '/state2/:param', params: { param: null, param2: null } };

describe('useIsActive', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter([state1, state1Child, state2])));

  function TestComponent({ state, params, exact }: { state: string; params: RawParams; exact: boolean }) {
    const isActive = useIsActive(state, params, exact);
    return <div className={isActive ? 'yesactive' : 'notactive'} />;
  }

  it('returns true when the route is active', async () => {
    await routerGo('state1');

    const wrapper = mountInRouter(<TestComponent state="state2" params={null} exact={false} />);
    expect(wrapper.find('div').props().className).toBe('notactive');

    await routerGo('state2');
    wrapper.update();
    expect(wrapper.find('div').props().className).toBe('yesactive');
  });

  it('returns true when the route is active and the desired params match', async () => {
    await routerGo('state2', { param: 'asdf' });
    const wrapper = mountInRouter(<TestComponent state="state2" params={{ param: 'foo' }} exact={false} />);
    expect(wrapper.find('div').props().className).toBe('notactive');

    await routerGo('state2', { param: 'foo' });
    wrapper.update();
    expect(wrapper.find('div').props().className).toBe('yesactive');
  });

  it('when exact: false returns true when the state or nested state is active', async () => {
    await routerGo('state1');
    const wrapper = mountInRouter(<TestComponent state="state1" params={null} exact={false} />);
    expect(wrapper.find('div').props().className).toBe('yesactive');

    await routerGo('state1.child');
    wrapper.update();
    expect(wrapper.find('div').props().className).toBe('yesactive');

    await routerGo('state2');
    wrapper.update();
    expect(wrapper.find('div').props().className).toBe('notactive');
  });

  it('when exact: true returns false when a nested state is active', async () => {
    await routerGo('state1');
    const wrapper = mountInRouter(<TestComponent state="state1" params={null} exact={true} />);
    expect(wrapper.find('div').props().className).toBe('yesactive');

    await routerGo('state1.child');
    wrapper.update();
    expect(wrapper.find('div').props().className).toBe('notactive');
  });
});
