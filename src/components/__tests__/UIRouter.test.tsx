import * as React from 'react';
import * as PropTypes from 'prop-types';
import { mount } from 'enzyme';

import { UIRouter, UIRouterConsumer, UIRouterReact, memoryLocationPlugin } from '../../index';

class Child extends React.Component<any, any> {
  static propTypes: React.ValidationMap<any> = {
    router: PropTypes.object,
  };
  render() {
    return <div>child</div>;
  }
}

describe('<UIRouter>', () => {
  it('throws an error if no plugin or router instance is passed via prop', () => {
    expect(() => {
      const wrapper = mount(
        <UIRouter>
          <Child />
        </UIRouter>
      );
    }).toThrow();
  });

  it('creates a router instance', () => {
    const wrapper = mount(
      <UIRouter plugins={[memoryLocationPlugin]} states={[]}>
        <UIRouterConsumer>{router => <Child router={router} />}</UIRouterConsumer>
      </UIRouter>
    );
    expect(wrapper.find(Child).props().router).toBeDefined();
  });

  it('accepts an instance via prop', () => {
    const router = new UIRouterReact();
    router.plugin(memoryLocationPlugin);
    const wrapper = mount(
      <UIRouter router={router}>
        <UIRouterConsumer>{router => <Child router={router} />}</UIRouterConsumer>
      </UIRouter>
    );
    expect(wrapper.find(Child).props().router).toBe(router);
  });

  describe('<UIRouterCosumer>', () => {
    it('passes down the router instance', () => {
      const wrapper = mount(
        <UIRouter plugins={[memoryLocationPlugin]}>
          <UIRouterConsumer>
            {router => {
              expect(router).toBeInstanceOf(UIRouterReact);
              return null;
            }}
          </UIRouterConsumer>
        </UIRouter>
      );
    });

    it('passes down the correct router instance when passed via props', () => {
      const router = new UIRouterReact();
      router.plugin(memoryLocationPlugin);
      const wrapper = mount(
        <UIRouter router={router}>
          <UIRouterConsumer>
            {_router => {
              expect(_router).toBe(router);
              return null;
            }}
          </UIRouterConsumer>
        </UIRouter>
      );
    });
  });
});
