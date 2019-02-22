import { mount } from 'enzyme';
import * as React from 'react';

import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
  UISref,
  UIView,
  getTransitionOptions,
} from '../../index';
import { UISrefActiveContext } from '../UISrefActive';
import { ViewContext } from '@uirouter/core';

const states = [
  {
    name: 'state',
    url: '',
    component: () => (
      <UISref to="state2">
        <a>state2</a>
      </UISref>
    ),
  },
  {
    name: 'state2',
    url: '/state2',
    component: () => <span>state2</span>,
  },
];

describe('<UISref>', () => {
  beforeAll(() => jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect));
  afterAll(() => (React.useEffect as any).mockRestore());

  let router;
  beforeEach(() => {
    router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(pushStateLocationPlugin);
    states.forEach(state => router.stateRegistry.register(state));
  });

  it('renders its child with injected props', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    await router.stateService.go('state');
    wrapper.update();
    const props = wrapper.find('a').props();
    expect(typeof props.onClick).toBe('function');
    expect(props.href.includes('/state2')).toBe(true);
  });

  it('calls registers and deregisters active state from parent UISrefActive checking when mounting/unmounting', async () => {
    const deregisterFn = jest.fn();
    const parentUISrefActiveAddStateFn = jest.fn(() => deregisterFn);
    const wrapper = mount(
      <UIRouter router={router}>
        <UISrefActiveContext.Provider value={parentUISrefActiveAddStateFn}>
          <UIView />
        </UISrefActiveContext.Provider>
      </UIRouter>
    );
    await router.stateService.go('state');
    wrapper.update();
    expect(wrapper.html()).toBe('<a href="/state2" class="">state2</a>');
    expect(parentUISrefActiveAddStateFn).toHaveBeenCalled();
    await router.stateService.go('state2');
    expect(deregisterFn).toHaveBeenCalled();
  });

  it('triggers a transition to target state', async () => {
    const hookSpy = jest.fn();
    router.stateService.defaultErrorHandler(() => {});
    router.transitionService.onBefore({ to: 'state2' }, hookSpy);
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    await router.stateService.go('state');
    wrapper.update();
    const link = wrapper.find('a');
    const props = link.props();
    expect(typeof props.onClick).toBe('function');
    expect(props.href.includes('/state2')).toBe(true);
    link.simulate('click');
    expect(hookSpy).toHaveBeenCalled();
  });

  it('calls the child elements onClick function first', async () => {
    const onClickSpy = jest.fn();
    router.stateRegistry.register({
      name: 'onclick',
      url: '/onclick',
      component: () => (
        <UISref to="state2">
          <a onClick={onClickSpy}>state2</a>
        </UISref>
      ),
    });
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    await router.stateService.go('onclick');
    wrapper.update();
    const goSpy = (router.stateService.go = jest.fn());
    wrapper.find('a').simulate('click');
    expect(onClickSpy).toHaveBeenCalled();
    expect(goSpy).toHaveBeenCalled();
  });

  it('calls the child elements onClick function and honors e.preventDefault()', async () => {
    const onClickSpy = jest.fn(e => e.preventDefault());
    router.stateRegistry.register({
      name: 'preventdefault',
      url: '/preventdefault',
      component: () => (
        <UISref to="state2">
          <a onClick={onClickSpy}>state2</a>
        </UISref>
      ),
    });
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    await router.stateService.go('preventdefault');
    wrapper.update();
    const goSpy = (router.stateService.go = jest.fn());
    wrapper.find('a').simulate('click');
    expect(onClickSpy).toHaveBeenCalled();
    expect(goSpy).not.toHaveBeenCalled();
  });

  it("doesn't trigger a transition when middle-clicked/ctrl+clicked", async () => {
    router.stateService.defaultErrorHandler(() => {});
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    await router.stateService.go('state');
    wrapper.update();
    // @ts-ignore
    const stateServiceGoSpy = jest.spyOn(router.stateService, 'go');
    const link = wrapper.find('a');
    link.simulate('click');
    link.simulate('click', { button: 1 });
    link.simulate('click', { metaKey: true });
    link.simulate('click', { ctrlKey: true });
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);
  });

  describe('getTransitionOptions()', () => {
    it('uses the root context for options when no parentUIViewAddress is provided', () => {
      const options = getTransitionOptions(router.stateRegistry, {});
      expect((options.relative as ViewContext).name).toBe('');
    });
  });
});
