import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { Transition } from '@uirouter/core';

import { makeTestRouter, muteConsoleErrors } from '../../__tests__/util';
import { TransitionPropCollisionError, UIRouter, UIView } from '../../components';
import { ReactStateDeclaration } from '../../interface';

const states: ReactStateDeclaration[] = [
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
      child1: (() => <span>child1</span>) as any,
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
    let { router, routerGo, mountInRouter } = makeTestRouter([]);
    beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter(states)));

    it('renders an empty <div>', () => {
      const wrapper = mountInRouter(<UIView />);
      expect(wrapper.html()).toBe('<div></div>');
    });

    it('renders its child if provided', () => {
      expect(
        mountInRouter(
          <UIView>
            <span />
          </UIView>
        ).contains(<span />)
      ).toBe(true);
    });

    it('injects props correctly', () => {
      expect(
        mountInRouter(
          <UIView className="myClass" style={{ margin: 5 }}>
            <span />
          </UIView>
        ).contains(<span className="myClass" style={{ margin: 5 }} />)
      ).toBe(true);
    });
  });

  describe('(mounted)', () => {
    let { router, routerGo, mountInRouter } = makeTestRouter([]);
    beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter(states)));
    it('renders its State Component', async () => {
      const wrapper = mountInRouter(<UIView />);
      await routerGo('parent');
      expect(wrapper.update().html()).toEqual(`<div><span>parent</span><div></div></div>`);
    });

    describe('injects the right props:', () => {
      let lastProps = undefined;
      const Comp = (props) => {
        lastProps = props;
        return <span>component</span>;
      };

      beforeEach(() => {
        lastProps = undefined;
        router.stateRegistry.register({
          name: '__state',
          component: Comp,
          resolve: [
            { resolveFn: () => 'resolveval', token: 'myresolve' },
            { resolveFn: () => true, token: 'otherresolve' },
            { resolveFn: () => true, token: {} },
          ],
        } as ReactStateDeclaration);
      });

      it('injects the transition', async () => {
        await routerGo('__state');
        mountInRouter(<UIView />);
        expect(lastProps.transition).toEqual(expect.any(Transition));
      });

      it('injects custom resolves if the token is a string', async () => {
        await routerGo('__state');
        mountInRouter(<UIView />);
        expect(lastProps.myresolve).toBe('resolveval');
        expect(lastProps.otherresolve).toBe(true);
      });

      it('injects className and style props', async () => {
        await routerGo('__state');
        mountInRouter(<UIView className="foo" style={{ color: 'red' }} />);
        expect(lastProps.className).toBe('foo');
        expect(lastProps.style).toEqual({ color: 'red' });
      });

      it('provides a stable key prop', async () => {
        await routerGo('__state');
        const wrapper = mountInRouter(<UIView />);
        const initialKey = wrapper.find(Comp).key();
        wrapper.setProps({ otherProp: 123 });
        wrapper.update();
        expect(wrapper.find(Comp).key()).toBe(initialKey);
      });

      it('updates the key prop on reload', async () => {
        await routerGo('__state');
        const wrapper = mountInRouter(<UIView />);
        const initialKey = wrapper.find(Comp).key();
        wrapper.setProps({ otherProp: 123 });
        expect(wrapper.find(Comp).key()).toBe(initialKey);
        await act(() => router.stateService.reload());
        wrapper.update();
        expect(wrapper.find(Comp).key()).not.toBe(initialKey);
      });
    });

    it('throws if a resolve uses the token `transition`', async () => {
      const Comp = () => <span>component</span>;
      router.stateRegistry.register({
        name: '__state',
        component: Comp,
        resolve: [{ token: 'transition', resolveFn: () => null }],
      } as ReactStateDeclaration);

      await routerGo('__state');

      muteConsoleErrors();
      expect(() => mountInRouter(<UIView />)).toThrow(TransitionPropCollisionError);
    });

    it('renders nested State Components', async () => {
      await routerGo('parent.child');
      const wrapper = mountInRouter(<UIView />);
      expect(wrapper.html()).toEqual(`<div><span>parent</span><span>child</span></div>`);
    });

    it('renders multiple nested unmounted <UIView>', async () => {
      await routerGo('namedParent');
      const wrapper = mountInRouter(<UIView />);
      expect(wrapper.html()).toEqual(`<div><span>namedParent</span><div></div><div></div></div>`);
    });

    it('renders multiple nested mounted <UIView>', async () => {
      await routerGo('namedParent.namedChild');
      const wrapper = mountInRouter(<UIView />);
      expect(wrapper.html()).toEqual(`<div><span>namedParent</span><span>child1</span><span>child2</span></div>`);
    });

    it('unmounts State Component when changing state', async () => {
      const wrapper = mountInRouter(<UIView />);
      await routerGo('parent.child');
      expect(wrapper.update().html()).toEqual(`<div><span>parent</span><span>child</span></div>`);
      await routerGo('parent');
      expect(wrapper.update().html()).toEqual(`<div><span>parent</span><div></div></div>`);
    });

    describe('uiCanExit', () => {
      function makeSpyComponent(uiCanExitSpy) {
        return class Comp extends React.Component<any, any> {
          uiCanExit() {
            return uiCanExitSpy();
          }
          render() {
            return <span>UiCanExitHookComponent</span>;
          }
        };
      }

      it('calls the uiCanExit function of a Class Component when unmounting', async () => {
        const uiCanExitSpy = jest.fn();
        router.stateRegistry.register({ name: '__state', component: makeSpyComponent(uiCanExitSpy) } as any);

        await routerGo('__state');
        const wrapper = mountInRouter(<UIView />);
        expect(wrapper.html()).toEqual('<span>UiCanExitHookComponent</span>');

        await routerGo('parent');
        expect(wrapper.update().html()).toContain('parent');
        expect(uiCanExitSpy).toBeCalled();
      });

      it('calls uiCanExit function of a React.forwardRef() Class Component when unmounting', async () => {
        const uiCanExitSpy = jest.fn();
        const Comp = makeSpyComponent(uiCanExitSpy);
        const ForwardRef = React.forwardRef((props, ref: any) => <Comp {...props} ref={ref} />);
        router.stateRegistry.register({ name: '__state', component: ForwardRef } as ReactStateDeclaration);
        await routerGo('__state');

        const wrapper = mountInRouter(<UIView />);
        expect(wrapper.html()).toEqual('<span>UiCanExitHookComponent</span>');

        await routerGo('parent');
        expect(wrapper.update().html()).toContain('parent');
        expect(uiCanExitSpy).toBeCalled();
      });

      it('does not transition if uiCanExit function of its State Component returns false', async () => {
        let uiCanExitSpy = jest.fn().mockImplementation(() => false);
        router.stateRegistry.register({ name: '__state', component: makeSpyComponent(uiCanExitSpy) } as any);
        await routerGo('__state');
        const wrapper = mountInRouter(<UIView />);
        expect(wrapper.html()).toEqual('<span>UiCanExitHookComponent</span>');

        try {
          await routerGo('parent');
        } catch (error) {}
        expect(wrapper.update().html()).toEqual('<span>UiCanExitHookComponent</span>');
        expect(uiCanExitSpy).toBeCalled();
      });
    });

    it('deregisters the UIView when unmounted', () => {
      const Component = (props) => <UIRouter router={router}>{props.show ? <UIView /> : <div />}</UIRouter>;
      const deregisterSpy = jest.spyOn(router.viewService._pluginapi, '_deregisterView');
      const wrapper = mount(<Component show={true} />);
      wrapper.setProps({ show: false });
      expect(deregisterSpy).toHaveBeenCalled();
    });

    it('renders the component using the render prop', async () => {
      const wrapper = mount(
        <UIRouter router={router}>
          <UIView render={(Comp, props) => <Comp {...props} foo={<span>bar</span>} />} />
        </UIRouter>
      );
      await routerGo('withrenderprop');
      expect(wrapper.update().html()).toEqual(`<div><span>withrenderprop</span><span>bar</span></div>`);
    });

    it('unmounts the State Component when calling stateService.reload(true)', async () => {
      const componentDidMountSpy = jest.fn();
      const componentWillUnmountSpy = jest.fn();
      class TestUnmountComponent extends React.Component {
        componentDidMount = componentDidMountSpy;
        componentWillUnmount = componentWillUnmountSpy;
        render() {
          return <div />;
        }
      }
      const testState = {
        name: 'testunmount',
        component: TestUnmountComponent,
      } as ReactStateDeclaration;
      router.stateRegistry.register(testState);

      await routerGo('testunmount');
      const wrapper = mountInRouter(<UIView />);
      expect(componentDidMountSpy).toHaveBeenCalledTimes(1);

      await act(() => router.stateService.reload('testunmount'));
      expect(componentWillUnmountSpy).toHaveBeenCalledTimes(1);
      expect(componentDidMountSpy).toHaveBeenCalledTimes(2);
      wrapper.unmount();
    });
  });
});
