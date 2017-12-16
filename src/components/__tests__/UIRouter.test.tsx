declare var jest, describe, it, expect, beforeEach;

import * as React from 'react';
import * as PropTypes from 'prop-types';
import { shallow, mount, render } from 'enzyme';
import * as sinon from 'sinon';

import {
  UIRouter,
  UIRouterReact,
  ReactStateDeclaration,
  memoryLocationPlugin,
} from '../../index';

class Child extends React.Component<any, any> {
  static contextTypes: React.ValidationMap<any> = {
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
        </UIRouter>,
      );
    }).toThrow();
  });

  it('creates a router instance', () => {
    const wrapper = mount(
      <UIRouter plugins={[memoryLocationPlugin]} states={[]}>
        <Child />
      </UIRouter>,
    );
    expect(wrapper.find(Child).instance().context.router).toBeDefined();
  });

  it('accepts an instance via prop', () => {
    const router = new UIRouterReact();
    router.plugin(memoryLocationPlugin);
    (router as any).__TEST__ = true;
    const wrapper = mount(
      <UIRouter router={router}>
        <Child />
      </UIRouter>,
    );
    expect(wrapper.find(Child).instance().context.router.__TEST__).toBe(true);
  });
});
