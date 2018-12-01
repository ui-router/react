declare var jest, describe, it, expect, beforeEach;

import { mount } from 'enzyme';
import * as React from 'react';

import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
  UISref,
  UIView,
} from '../../index';

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

  it('calls deregister active state checking when unmounting', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    await router.stateService.go('state');
    wrapper.update();
    expect(wrapper.html()).toBe('<a href="/state2" class="">state2</a>');
    const uiSref = wrapper
      .find(UISref)
      .at(0)
      .find('Sref')
      .at(0);
    const deregisterSpy = jest.spyOn(uiSref.instance(), 'deregister');
    await router.stateService.go('state2');
    expect(deregisterSpy).toHaveBeenCalled();
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
    const stateServiceGoSpy = jest.spyOn(router.stateService, 'go');
    const link = wrapper.find('a');
    link.simulate('click');
    link.simulate('click', { button: 1 });
    link.simulate('click', { metaKey: true });
    link.simulate('click', { ctrlKey: true });
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);
  });

  it('uses rootContext for options when not nested in a <UIView>', () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UISref to="state">
          <a>link</a>
        </UISref>
      </UIRouter>
    );
    const uiSref = wrapper
      .find(UISref)
      .at(0)
      .find('Sref')
      .at(0);
    expect(uiSref.instance().context.parentUIViewAddress).toBeUndefined();
    expect(uiSref.instance().getOptions().relative.name).toBe('');
  });
});
