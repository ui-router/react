declare var jest, describe, it, expect, beforeEach;

import * as React from 'react';
import { mount } from 'enzyme';

import { UIRouterReact, UIRouter, UIView, UISref, pushStateLocationPlugin, servicesPlugin } from '../../index';

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
      </UIRouter>,
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
      </UIRouter>,
    );
    await router.stateService.go('state');
    wrapper.update();
    expect(wrapper.html()).toBe('<a href="/state2" class="">state2</a>');
    const uiSref = wrapper.find(UISref).at(0);
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
      </UIRouter>,
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

  it("doesn't trigger a transition when middle-clicked/ctrl+clicked", async () => {
    router.stateService.defaultErrorHandler(() => {});
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>,
    );
    await router.stateService.go('state');
    wrapper.update();
    const stateServiceGoSpy = jest.spyOn(wrapper.instance().router.stateService, 'go');
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
      </UIRouter>,
    );
    expect(wrapper.find(UISref).instance().context.parentUIViewAddress).toBeUndefined();
    expect(
      wrapper
        .find(UISref)
        .instance()
        .getOptions().relative.name,
    ).toBe('');
  });
});
