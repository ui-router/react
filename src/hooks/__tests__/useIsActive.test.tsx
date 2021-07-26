import { render } from '@testing-library/react';
import { RawParams } from '@uirouter/core';
import * as React from 'react';
import { makeTestRouter } from '../../__tests__/util';
import { UIRouter, UIView } from '../../components';
import { useIsActive } from '../useIsActive';

const state1 = { name: 'state1', url: '/state1' };
const state1Child = { name: 'state1.child', url: '/child' };
const state2 = { name: 'state2', url: '/state2/:param', params: { param: null, param2: null } };

function TestComponent({ state, params, exact }: { state: string; params: RawParams; exact: boolean }) {
  const isActive = useIsActive(state, params, exact);
  return <div data-testid="div" className={isActive ? 'yesactive' : 'notactive'} />;
}

describe('useIsActive', () => {
  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter([state1, state1Child, state2])));

  it('returns true when the route is active', async () => {
    await routerGo('state2');
    const wrapper = mountInRouter(<TestComponent state="state2" params={null} exact={false} />);
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('yesactive');
  });

  it('returns false when the route is not active', async () => {
    const wrapper = mountInRouter(<TestComponent state="state2" params={null} exact={false} />);
    await routerGo('state1');
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('notactive');
  });

  it('returns true when the route is active and the desired params match', async () => {
    await routerGo('state2', { param: 'foo' });
    const wrapper = mountInRouter(<TestComponent state="state2" params={{ param: 'foo' }} exact={false} />);
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('yesactive');
  });

  it('returns false when the route is active but the desired params do not match', async () => {
    await routerGo('state2', { param: 'asdf' });
    const wrapper = mountInRouter(<TestComponent state="state2" params={{ param: 'foo' }} exact={false} />);
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('notactive');
  });

  it('returns true when a nested state is active and exact is false', async () => {
    await routerGo('state1.child');
    const wrapper = mountInRouter(<TestComponent state="state1" params={null} exact={false} />);
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('yesactive');
  });

  it('returns false when a nested state is active and exact is true', async () => {
    const wrapper = mountInRouter(<TestComponent state="state1" params={null} exact={true} />);
    await routerGo('state1.child');
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('notactive');
  });

  it('works with relative states', async () => {
    const parent = { name: 'parent', component: () => <TestComponent state=".child" params={null} exact={false} /> };
    const child = { name: 'parent.child', component: () => <div /> };
    router.stateRegistry.register(parent);
    router.stateRegistry.register(child);
    await routerGo('parent');
    const wrapper = mountInRouter(<UIView />);
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('notactive');

    await routerGo('parent.child');
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('yesactive');
  });

  it('updates when the desired state changes', async () => {
    await routerGo('state2');
    const wrapper = render(
      <UIRouter router={router}>
        <TestComponent state="state1" params={null} exact={false} />
      </UIRouter>
    );
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('notactive');

    wrapper.rerender(
      <UIRouter router={router}>
        <TestComponent state="state2" params={null} exact={false} />
      </UIRouter>
    );
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('yesactive');
  });

  it('updates when the desired params changes', async () => {
    await routerGo('state2', { param: 'bar' });
    const wrapper = render(
      <UIRouter router={router}>
        <TestComponent state="state2" params={{ param: 'foo' }} exact={false} />
      </UIRouter>
    );
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('notactive');

    wrapper.rerender(
      <UIRouter router={router}>
        <TestComponent state="state2" params={{ param: 'bar' }} exact={false} />
      </UIRouter>
    );
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('yesactive');
  });

  it('updates when the active state changes', async () => {
    await routerGo('state2');
    const wrapper = mountInRouter(<TestComponent state="state1" params={null} exact={false} />);
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('notactive');

    await routerGo('state1');
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('yesactive');

    await routerGo('state2');
    expect(wrapper.getByTestId('div').getAttribute('class')).toBe('notactive');
  });
});
