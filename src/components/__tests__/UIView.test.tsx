declare var jest, describe, it, expect, beforeEach;

import * as React from 'react';
import { shallow, mount, render } from 'enzyme';
import * as sinon from 'sinon';

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
        expect(wrapper.html()).toEqual(
          `<div><span>parent</span><div></div></div>`,
        );
      });
    });

    it('injects the right props', () => {
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
      return router.stateService.go('__state').then(() => {
        wrapper.update();
        expect(wrapper.find(Comp).props().myresolve).not.toBeUndefined();
        expect(wrapper.find(Comp).props().transition).not.toBeUndefined();
      });
    });

    it('injects custom resolves', () => {
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
      return router.stateService.go('__state').then(() => {
        wrapper.update();
        expect(wrapper.find(Comp).props().foo).toBe('bar');
      });
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

    it('renders nested State Components', () => {
      return router.stateService.go('parent.child').then(() => {
        const wrapper = mount(
          <UIRouter router={router}>
            <UIView />
          </UIRouter>,
        );
        expect(wrapper.html()).toEqual(
          `<div><span>parent</span><span>child</span></div>`,
        );
      });
    });

    it('renders multiple nested unmounted <UIView>', () => {
      return router.stateService.go('namedParent').then(() => {
        const wrapper = mount(
          <UIRouter router={router}>
            <UIView />
          </UIRouter>,
        );
        expect(wrapper.html()).toEqual(
          `<div><span>namedParent</span><div></div><div></div></div>`,
        );
      });
    });

    it('renders multiple nested mounted <UIView>', () => {
      return router.stateService.go('namedParent.namedChild').then(() => {
        const wrapper = mount(
          <UIRouter router={router}>
            <UIView />
          </UIRouter>,
        );
        expect(wrapper.html()).toEqual(
          `<div><span>namedParent</span><span>child1</span><span>child2</span></div>`,
        );
      });
    });

    it('unmounts State Component when changing state', () => {
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView />
        </UIRouter>,
      );
      return router.stateService
        .go('parent.child')
        .then(() => {
          expect(wrapper.html()).toEqual(
            `<div><span>parent</span><span>child</span></div>`,
          );
          return router.stateService.go('parent');
        })
        .then(() => {
          expect(wrapper.html()).toEqual(
            `<div><span>parent</span><div></div></div>`,
          );
        });
    });

    it('calls uiCanExit function of its State Component when unmounting', () => {
      let mock = jest.fn();
      class Comp extends React.Component<any, any> {
        uiCanExit = () => {
          mock(true);
          return true;
        };
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
      return router.stateService
        .go('__state')
        .then(() => {
          expect(wrapper.html()).toEqual('<span>UiCanExitHookComponent</span>');
          return router.stateService.go('exit');
        })
        .then(() => {
          expect(wrapper.html()).toEqual('<span>exit</span>');
          expect(mock).toBeCalled();
        });
    });

    it('deregisters the UIView when unmounted', () => {
      const Component = props => (
        <UIRouter router={router}>{props.show ? <UIView /> : <div />}</UIRouter>
      );
      const wrapper = mount(<Component show={true} />);
      let stub = sinon.stub(
        wrapper
          .find(UIView)
          .at(0)
          .instance(),
        'deregister',
      );
      wrapper.setProps({ show: false });
      expect(stub.calledOnce).toBe(true);
    });

    it('renders the component using the render prop', () => {
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView
            render={(Comp, props) => <Comp {...props} foo={<span>bar</span>} />}
          />
        </UIRouter>,
      );
      return router.stateService.go('withrenderprop').then(() => {
        expect(wrapper.html()).toEqual(
          `<div><span>withrenderprop</span><span>bar</span></div>`,
        );
      });
    });
  });
});
