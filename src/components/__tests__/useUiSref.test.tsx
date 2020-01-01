import * as React from 'react';
import { mount } from 'enzyme';
import { UIRouterReact } from '../../core';
import { UISref, useUISref } from '../UISref';
import { UISrefActiveContext } from '../UISrefActive';
import { makeTestRouter, muteConsoleErrors } from './UIRouter.test';

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

describe('useUiSref', () => {
  let router: UIRouterReact;
  let mountInRouter: typeof mount;
  beforeEach(() => ({ router, mountInRouter } = makeTestRouter(states)));

  it('throws if to is not a string', () => {
    const Component = () => {
      const sref = useUISref(5 as any, {});
      return <a {...sref} />;
    };

    muteConsoleErrors();
    expect(() => mountInRouter(<Component />)).toThrow(/must be a string/);
  });

  it('returns an href for the target state', () => {
    const spy = jest.fn();
    const Component = () => {
      const uiSref = useUISref('state2', {});
      spy(uiSref.href);
      return <a {...uiSref} />;
    };

    mountInRouter(<Component />);

    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith('/state2');
  });

  it('returns an onClick function which activates the target state', () => {
    const spy = jest.spyOn(router.stateService, 'go');
    let onClick: Function = null;
    const Component = () => {
      const uiSref = useUISref('state', {});
      onClick = uiSref.onClick;
      return <a {...uiSref} />;
    };

    mountInRouter(<Component />);

    expect(typeof onClick).toBe('function');
    const event = { preventDefault() {} } as React.MouseEvent<any>;
    onClick(event);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith('state', expect.anything(), expect.anything());
  });

  it('registers itself with the parent UISrefActive addStateInfo callback', () => {
    const spy = jest.fn();
    const Component = () => {
      const uiSref = useUISref('state', {});
      return <a {...uiSref} />;
    };

    mountInRouter(
      <UISrefActiveContext.Provider value={spy}>
        <Component />
      </UISrefActiveContext.Provider>
    );

    expect(spy).toBeCalledTimes(1);
  });

  it('deregisters itself with the parent UISrefActive addStateInfo callback when unmounted', () => {
    const spy = jest.fn();
    const Component = () => {
      const uiSref = useUISref('state', {});
      return <a {...uiSref} />;
    };

    const wrapper = mountInRouter(
      <UISrefActiveContext.Provider value={() => spy}>
        <Component />
      </UISrefActiveContext.Provider>
    );

    expect(spy).toBeCalledTimes(0);
    wrapper.unmount();
    expect(spy).toBeCalledTimes(1);
  });
});
