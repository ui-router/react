declare var jest, describe, it, expect, beforeEach;

import * as React from 'react';
import { mount } from 'enzyme';

import {
  UIRouterReact,
  UIRouter,
  UIView,
  UISref,
  UISrefActive,
  pushStateLocationPlugin,
  servicesPlugin,
  StateNameMustBeAStringError,
} from '../../index';

var states = [
  {
    name: 'simple',
    url: '',
    component: () => (
      <div>
        <UISrefActive class="active">
          <UISref to="parent.child1">
            <a>child1</a>
          </UISref>
        </UISrefActive>
      </div>
    ),
  },
  {
    name: 'simple2',
    url: '',
    component: () => <div>Simple2</div>,
  },
  {
    name: 'parent',
    url: '',
    component: () => (
      <div>
        <UISrefActive class="active">
          <UISref to="parent.child1">
            <a>child1</a>
          </UISref>
        </UISrefActive>
        <UISrefActive class="active">
          <UISref to="parent.child2">
            <a>child2</a>
          </UISref>
        </UISrefActive>
        <UIView />
      </div>
    ),
  },
  {
    name: 'parent.child1',
    url: '/child1',
    component: () => <span>child1</span>,
  },
  {
    name: 'parent.child2',
    url: '/child2',
    component: () => <span>child2</span>,
  },
  {
    name: 'parent.child3',
    url: '/child3',
    component: (
      <UISrefActive class="active">
        <UISref to="parent">
          <a>parent</a>
        </UISref>
      </UISrefActive>
    ),
  },
  {
    name: 'throw',
    url: '/throw',
    component: () => (
      <UISrefActive class="active">
        <UISref to={5 as any}>
          <a>child1</a>
        </UISref>
      </UISrefActive>
    ),
  },
  {
    name: 'withParams',
    url: '/with?param',
    component: () => <span>with params</span>,
  },
];

describe('<UISrefActive>', () => {
  let router;
  beforeEach(() => {
    router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(pushStateLocationPlugin);
    router.stateService.defaultErrorHandler(() => {});
    states.forEach(state => router.stateRegistry.register(state));
  });

  it('renders its child', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    await router.stateService.go('simple');
    wrapper.update();
    const props = wrapper.find('a').props();
    expect(typeof props.onClick).toBe('function');
    expect(props.href.includes('/child1')).toBe(true);
  });

  it('updates class for child <UISref>', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    await router.stateService.go('parent.child1');
    wrapper.update();
    let activeLink = wrapper.find('a.active');
    expect(activeLink.length).toBe(1);
    expect(activeLink.props().href.includes('/child1')).toBe(true);
    await router.stateService.go('parent.child2');
    wrapper.update();
    activeLink = wrapper.find('a.active');
    expect(activeLink.length).toBe(1);
    expect(activeLink.props().href.includes('/child2')).toBe(true);
  });

  it('throws if state name is not a string', async () => {
    await router.stateService.go('throw');
    expect(() => {
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>
      );
    }).toThrow(StateNameMustBeAStringError);
  });

  it('deregisters transition hook for active class when unmounted', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>
    );
    let spy, node;
    await router.stateService.go('simple');
    wrapper.update();
    const instance = wrapper
      .find(UISrefActive)
      .at(0)
      .find('SrefActive')
      .at(0)
      .instance();
    const deregisterSpy = jest.spyOn(instance, 'deregister');
    await router.stateService.go('simple2');
    expect(deregisterSpy).toHaveBeenCalled();
  });

  it('works with state parameters', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <div>
          <UISrefActive class="active">
            <UISref to="withParams" params={{ param: 5 }}>
              <a>child1</a>
            </UISref>
          </UISrefActive>
          <UIView />
        </div>
      </UIRouter>
    );
    await router.stateService.go('withParams', { param: 5 });
    wrapper.update();
    let activeLink = wrapper.find('a.active');
    expect(activeLink.length).toBe(1);
    await router.stateService.go('withParams', { param: 3 });
    wrapper.update();
    activeLink = wrapper.find('a.active');
    expect(activeLink.length).toBe(0);
  });

  it('uses rootContext for <UISref> state when not nested in a <UIView>', () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UISrefActive class="active">
          <UISref to="parent.child1">
            <a>child1</a>
          </UISref>
        </UISrefActive>
      </UIRouter>
    );
    let node = wrapper.find(UISrefActive).at(0);
    const instance = wrapper
      .find(UISrefActive)
      .at(0)
      .find('SrefActive')
      .at(0)
      .instance();
    expect(instance.context.parentUIViewAddress).toBeUndefined();
    // @ts-ignore
    expect(instance.states[0].state.name).toBe('parent.child1');
  });

  it('works with multiple <UISref> children', () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UISrefActive class="active">
          <div>
            <UISref to="parent.child1">
              <a>child1</a>
            </UISref>
            <UISref to="parent.child2">
              <a>child2</a>
            </UISref>
            <UISref to="parent.child3">
              <a>child3</a>
            </UISref>
          </div>
        </UISrefActive>
      </UIRouter>
    );
    const instance = wrapper
      .find(UISrefActive)
      .at(0)
      .find('SrefActive')
      .at(0)
      .instance();
    expect(instance.context.parentUIViewAddress).toBeUndefined();
    // @ts-ignore
    expect(instance.states.length).toBe(3);
  });

  it('works with nested <UISrefActive>', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UISrefActive class="active">
          <div>
            <UISrefActive class="state1">
              <UISref to="state1">
                <a>state1</a>
              </UISref>
            </UISrefActive>
            <UISrefActive class="state2">
              <UISref to="state2">
                <a>state2</a>
              </UISref>
            </UISrefActive>
            <UISrefActive class="state3">
              <UISref to="state3">
                <a>state3</a>
              </UISref>
            </UISrefActive>
          </div>
        </UISrefActive>
      </UIRouter>
    );

    const instance = wrapper
      .find(UISrefActive)
      .at(0)
      .find('SrefActive')
      .at(0)
      .instance();
    // @ts-ignore
    expect(instance.states.length).toBe(3);

    router.stateRegistry.register({
      name: 'state1',
      component: () => <UIView />,
    });
    router.stateRegistry.register({
      name: 'state2',
      component: () => <UIView />,
    });

    await router.stateService.go('state1');
    wrapper.update();
    expect(wrapper.find('div.active').length).toBe(1);
    expect(wrapper.find('a.state2').length).toBe(0);
    expect(wrapper.find('a.state1').length).toBe(1);
    await router.stateService.go('state2');
    wrapper.update();
    expect(wrapper.find('div.active').length).toBe(1);
    expect(wrapper.find('a.state2').length).toBe(1);
    expect(wrapper.find('a.state1').length).toBe(0);
  });

  it('passes down className from parent correctly', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UISrefActive class="active">
          <UISrefActive class="state1">
            <UISref to="state1">
              <a>state1</a>
            </UISref>
          </UISrefActive>
        </UISrefActive>
      </UIRouter>
    );

    router.stateRegistry.register({
      name: 'state1',
      component: () => <UIView />,
    });
    router.stateRegistry.register({
      name: 'otherstate',
      component: () => <UIView />,
    });

    await router.stateService.go('state1');
    wrapper.update();
    expect(wrapper.find('a.active.state1').length).toBe(1);
    await router.stateService.go('otherstate');
    wrapper.update();
    expect(wrapper.find('a.active').length).toBe(0);
  });

  it("removes active state of UISref when it's unmounted", () => {
    const Comp = props => (
      <UIRouter router={router}>
        <UISrefActive class="active">
          {props.show ? (
            <UISref to="parent.child1">
              <a>child1</a>
            </UISref>
          ) : (
            <div />
          )}
        </UISrefActive>
      </UIRouter>
    );
    const wrapper = mount(<Comp show={true} />);
    const instance = wrapper
      .find(UISrefActive)
      .at(0)
      .find('SrefActive')
      .at(0)
      .instance();
    // @ts-ignore
    expect(instance.states.length).toBe(1);
    wrapper.setProps({ show: false });
    // @ts-ignore
    expect(instance.states.length).toBe(0);
  });

  it('checks for exact state match when exact prop is provided', async () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <div>
          <UISrefActive class="active">
            <UISref to="_parent">
              <a>parent</a>
            </UISref>
          </UISrefActive>
          <UISrefActive class="active" exact={true}>
            <UISref to="_parent">
              <a>parent</a>
            </UISref>
          </UISrefActive>
          <UIView />
        </div>
      </UIRouter>
    );
    router.stateRegistry.register({
      name: '_parent',
      component: () => <UIView />,
    });
    router.stateRegistry.register({
      name: '_parent._child',
      component: () => <span>child1</span>,
    });
    await router.stateService.go('_parent._child');
    wrapper.update();
    expect(wrapper.find('a.active').length).toBe(1);
    await router.stateService.go('_parent');
    wrapper.update();
    expect(wrapper.find('a.active').length).toBe(2);
  });
});
