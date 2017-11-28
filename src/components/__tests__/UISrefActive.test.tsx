declare var jest, describe, it, expect, beforeEach;

import * as React from 'react';
import {shallow, mount, render} from 'enzyme';
import * as sinon from 'sinon';

import {
  UIRouterReact,
  UIRouter,
  UIView,
  UISref,
  UISrefActive,
  ReactStateDeclaration,
  pushStateLocationPlugin,
  servicesPlugin,
} from '../../index';

var states = [
  {
    name: 'simple',
    url: '',
    component: () =>
      <div>
        <UISrefActive class="active">
          <UISref to="parent.child1">
            <a>child1</a>
          </UISref>
        </UISrefActive>
      </div>,
  },
  {
    name: 'simple2',
    url: '',
    component: () => <div>Simple2</div>,
  },
  {
    name: 'parent',
    url: '',
    component: () =>
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
      </div>,
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
    component: () =>
      <UISrefActive class="active">
        <UISref to={5 as any}>
          <a>child1</a>
        </UISref>
      </UISrefActive>,
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
    router.start();
  });

  it('renders its child', () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>,
    );
    return router.stateService.go('simple').then(() => {
      wrapper.update();
      const props = wrapper.find('a').props();
      expect(typeof props.onClick).toBe('function');
      expect(props.href.includes('/child1')).toBe(true);
    });
  });

  it('updates class for child <UISref>', () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>,
    );
    return router.stateService
      .go('parent.child1')
      .then(() => {
        wrapper.update();
        const activeLink = wrapper.find('a.active');
        expect(activeLink.length).toBe(1);
        expect(activeLink.props().href.includes('/child1')).toBe(true);
        return router.stateService.go('parent.child2');
      })
      .then(() => {
        wrapper.update();
        const activeLink = wrapper.find('a.active');
        expect(activeLink.length).toBe(1);
        expect(activeLink.props().href.includes('/child2')).toBe(true);
      });
  });

  it('throws if state name is not a string', () => {
    let spy = sinon.spy();
    router.stateService.defaultErrorHandler(err => {
      if (err.detail instanceof Error) spy();
    });
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>,
    );
    return router.stateService.go('throw').then(() => {
      wrapper.update();
      expect(spy.called).toBe(true);
    });
  });

  it('deregisters transition hook for active class when unmounted', () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UIView />
      </UIRouter>,
    );
    let spy, node;
    return router.stateService
      .go('simple')
      .then(() => {
        wrapper.update();
        node = wrapper.find(UISrefActive).at(0);
        spy = sinon.spy(node.instance(), 'deregister');
        return router.stateService.go('simple2');
      })
      .then(() => {
        wrapper.update();
        expect(spy.called).toBe(true);
      });
  });

  it('works with state parameters', () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <div>
          <UISrefActive class="active">
            <UISref to="withParams" params={{param: 5}}>
              <a>child1</a>
            </UISref>
          </UISrefActive>
          <UIView />
        </div>
      </UIRouter>,
    );
    return router.stateService
      .go('withParams', {param: 5})
      .then(() => {
        wrapper.update();
        const activeLink = wrapper.find('a.active');
        expect(activeLink.length).toBe(1);
        return router.stateService.go('withParams', {param: 3});
      })
      .then(() => {
        wrapper.update();
        const activeLink = wrapper.find('a.active');
        expect(activeLink.length).toBe(0);
      });
  });

  it('uses rootContext for <UISref> state when not nested in a <UIView>', () => {
    const wrapper = mount(
      <UIRouter router={router}>
        <UISrefActive class="active">
          <UISref to="parent.child1">
            <a>child1</a>
          </UISref>
        </UISrefActive>
      </UIRouter>,
    );
    let node = wrapper.find(UISrefActive).at(0);
    expect(node.instance().context.parentUIViewAddress).toBeUndefined();
    expect(node.instance().states[0].state.name).toBe('parent.child1');
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
      </UIRouter>,
    );
    const node = wrapper.find(UISrefActive).at(0);
    expect(node.instance().context.parentUIViewAddress).toBeUndefined();
    expect(node.instance().states.length).toBe(3);
  });

  it("removes active state of UISref when it's unmounted", () => {
    const Comp = props =>
      <UIRouter router={router}>
        <UISrefActive class="active">
          {props.show
            ? <UISref to="parent.child1">
                <a>child1</a>
              </UISref>
            : <div />}
        </UISrefActive>
      </UIRouter>;
    const wrapper = mount(<Comp show={true} />);
    const node = wrapper.find(UISrefActive).at(0);
    expect(node.instance().states.length).toBe(1);
    wrapper.setProps({show: false});
    expect(node.instance().states.length).toBe(0);
  });

  it('checks for exact state match when exact prop is provided', () => {
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
      </UIRouter>,
    );
    router.stateRegistry.register({
      name: '_parent',
      component: () => <UIView />,
    });
    router.stateRegistry.register({
      name: '_parent._child',
      component: () => <span>child1</span>,
    });
    return router.stateService
      .go('_parent._child')
      .then(() => {
        wrapper.update();
        expect(wrapper.find('a.active').length).toBe(1);
        return router.stateService.go('_parent');
      })
      .then(() => {
        wrapper.update();
        expect(wrapper.find('a.active').length).toBe(2);
      });
  });
});
