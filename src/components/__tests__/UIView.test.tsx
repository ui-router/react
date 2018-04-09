declare var jest, describe, it, expect, beforeEach;

import * as React from 'react';
import { mount } from 'enzyme';

import {
  UIRouterReact,
  UIRouter,
  UIView,
  ReactStateDeclaration,
  memoryLocationPlugin,
  servicesPlugin,
  TransitionPropCollisionError,
} from '../../index';

const states = [
  {
    name: 'parent',
    component: () => (
      <div>
        <span>parent</span>
        <UIView />
      </div>
    ),
  },
  {
    name: 'parent.child',
    component: () => <span>child</span>,
  },
  {
    name: 'namedParent',
    component: () => (
      <div>
        <span>namedParent</span>
        <UIView name="child1" />
        <UIView name="child2" />
      </div>
    ),
  },
  {
    name: 'namedParent.namedChild',
    views: {
      child1: () => <span>child1</span>,
      child2: { component: () => <span>child2</span> },
    },
  },
  {
    name: 'withrenderprop',
    component: ({ foo }) => (
      <div>
        <span>withrenderprop</span>
        {foo}
      </div>
    ),
  },
];

describe('<UIView>', () => {
  describe('(unmounted)', () => {
    let router;
    beforeEach(() => {
      router = new UIRouterReact();
      router.plugin(memoryLocationPlugin);
    });

    it('renders an empty <div>', () => {
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      expect(wrapper.html()).toBe('<div></div>');
    });

    it('renders its child if provided', () => {
      expect(
        mount(
          <UIRouter router={router}>
            <UIView>
              <span />
            </UIView>
          </UIRouter>,
        ).contains(<span />),
      ).toBe(true);
    });

    it('injects props correctly', () => {
      expect(
        mount(
          <UIRouter router={router}>
            <UIView className="myClass" style={{ margin: 5 }}>
              <span />
            </UIView>
          </UIRouter>,
        ).contains(<span className="myClass" style={{ margin: 5 }} />),
      ).toBe(true);
    });
  });

  describe('(mounted)', () => {
    let router;
    beforeEach(() => {
      router = new UIRouterReact();
      router.plugin(servicesPlugin);
      router.plugin(memoryLocationPlugin);
      states.forEach(state => router.stateRegistry.register(state));
    });

    it('renders its State Component', () => {
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      return router.stateService.go('parent').then(() => {
        expect(wrapper.html()).toEqual(`<div><span>parent</span><div></div></div>`);
      });
    });

    it('injects the right props', async () => {
      const Comp = () => <span>component</span>;
      router.stateRegistry.register({
        name: '__state',
        component: Comp,
        resolve: [{ resolveFn: () => true, token: 'myresolve' }],
      });
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      await router.stateService.go('__state');
      wrapper.update();
      expect(wrapper.find(Comp).props().myresolve).not.toBeUndefined();
      expect(wrapper.find(Comp).props().transition).not.toBeUndefined();
    });

    it('injects custom resolves', async () => {
      const Comp = () => <span>component</span>;
      router.stateRegistry.register({
        name: '__state',
        component: Comp,
        resolve: [{ token: 'foo', resolveFn: () => 'bar' }],
      });
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      await router.stateService.go('__state');
      wrapper.update();
      expect(wrapper.find(Comp).props().foo).toBe('bar');
    });

    it('throws if a resolve uses the token `transition`', async () => {
      const Comp = () => <span>component</span>;
      router.stateRegistry.register({
        name: '__state',
        component: Comp,
        resolve: [{ token: 'transition', resolveFn: () => null }],
      });

      await router.stateService.go('__state');

      expect(() => {
        const wrapper = mount(
          <UIRouter router={router}>
            <UIView />
          </UIRouter>,
        );
      }).toThrow(TransitionPropCollisionError);
    });

    it('renders nested State Components', async () => {
      await router.stateService.go('parent.child');
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      expect(wrapper.html()).toEqual(`<div><span>parent</span><span>child</span></div>`);
    });

    it('renders multiple nested unmounted <UIView>', async () => {
      await router.stateService.go('namedParent');
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      expect(wrapper.html()).toEqual(`<div><span>namedParent</span><div></div><div></div></div>`);
    });

    it('renders multiple nested mounted <UIView>', async () => {
      await router.stateService.go('namedParent.namedChild');
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      expect(wrapper.html()).toEqual(`<div><span>namedParent</span><span>child1</span><span>child2</span></div>`);
    });

    it('unmounts State Component when changing state', async () => {
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      await router.stateService.go('parent.child');
      expect(wrapper.html()).toEqual(`<div><span>parent</span><span>child</span></div>`);
      await router.stateService.go('parent');
      expect(wrapper.html()).toEqual(`<div><span>parent</span><div></div></div>`);
    });

    it('calls uiCanExit function of its State Component when unmounting', async () => {
      let uiCanExitSpy = jest.fn();
      class Comp extends React.Component<any, any> {
        uiCanExit = uiCanExitSpy;
        render() {
          return <span>UiCanExitHookComponent</span>;
        }
      }
      const Exit = () => <span>exit</span>;
      router = new UIRouterReact();
      router.plugin(servicesPlugin);
      router.plugin(memoryLocationPlugin);
      router.stateRegistry.register({
        name: '__state',
        component: Comp,
      } as ReactStateDeclaration);
      router.stateRegistry.register({
        name: 'exit',
        component: Exit,
      } as ReactStateDeclaration);
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      await router.stateService.go('__state');
      expect(wrapper.html()).toEqual('<span>UiCanExitHookComponent</span>');
      await router.stateService.go('exit');
      expect(wrapper.html()).toEqual('<span>exit</span>');
      expect(uiCanExitSpy).toBeCalled();
    });

    it('deregisters the UIView when unmounted', () => {
      const Component = props => <UIRouter router={router}>{props.show ? <UIView /> : <div />}</UIRouter>;
      const wrapper = mount(<Component show={true} />);
      let UIViewInstance = wrapper
        .find(UIView)
        .at(0)
        .instance();
      const deregisterSpy = jest.spyOn(UIViewInstance, 'deregister');
      wrapper.setProps({ show: false });
      expect(deregisterSpy).toHaveBeenCalled();
    });

    it('renders the component using the render prop', async () => {
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView render={(Comp, props) => <Comp {...props} foo={<span>bar</span>} />} />
        </UIRouter>,
      );
      await router.stateService.go('withrenderprop');
      expect(wrapper.html()).toEqual(`<div><span>withrenderprop</span><span>bar</span></div>`);
    });
  });
});
