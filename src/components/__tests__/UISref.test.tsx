import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { UISref, UIView } from '../../components';
import { UISrefActiveContext } from '../UISrefActive';
import { makeTestRouter, muteConsoleErrors } from '../../__tests__/util';

const states = [
  {
    name: 'state',
    url: '/state',
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
  let mockUseEffect: any;
  beforeEach(() => (mockUseEffect = jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect)));
  afterEach(() => mockUseEffect.mockRestore());

  let { router, routerGo, mountInRouter } = makeTestRouter([]);
  beforeEach(() => ({ router, routerGo, mountInRouter } = makeTestRouter(states)));

  it('renders its child with injected props', async () => {
    const wrapper = mountInRouter(
      <UISref to="state2">
        <a data-testid="anchor">state2</a>
      </UISref>
    );
    await routerGo('state');
    const goSpy = jest.spyOn(router.stateService, 'go');
    const anchor = wrapper.getByTestId('anchor');
    expect(anchor.getAttribute('href').includes('/state2')).toBe(true);
    anchor.click();
    expect(goSpy).toHaveBeenCalledTimes(1);
  });

  it('throws if state name is not a string', () => {
    muteConsoleErrors();
    expect(() => mountInRouter(<UISref to={5 as any} />)).toThrow(/must be a string/);
  });

  it('registers and deregisters active state from parent UISrefActive when mounting/unmounting', async () => {
    await routerGo('state');

    const deregisterFn = jest.fn();
    const parentUISrefActiveAddStateFn = jest.fn(() => deregisterFn);

    mountInRouter(
      <UISrefActiveContext.Provider value={parentUISrefActiveAddStateFn}>
        <UIView />
      </UISrefActiveContext.Provider>
    );

    expect(parentUISrefActiveAddStateFn).toHaveBeenCalled();
    await routerGo('state2');
    expect(deregisterFn).toHaveBeenCalled();
  });

  it('triggers a transition to target state', async () => {
    const goSpy = jest.spyOn(router.stateService, 'go');
    const rendered = mountInRouter(
      <UISref to="state2">
        <a data-testid="anchor" />
      </UISref>
    );

    rendered.getByTestId('anchor').click();

    expect(goSpy).toHaveBeenCalledTimes(1);
    expect(goSpy).toHaveBeenCalledWith('state2', expect.anything(), expect.anything());
  });

  it('calls the child elements onClick function first', async () => {
    const log = [];
    const goSpy = jest.spyOn(router.stateService, 'go').mockImplementation(() => log.push('go') as any);
    const onClickSpy = jest.fn(() => log.push('onClick'));
    const rendered = mountInRouter(
      <UISref to="state2">
        <a data-testid="anchor" onClick={onClickSpy}>
          state2
        </a>
      </UISref>
    );
    rendered.getByTestId('anchor').click();

    expect(onClickSpy).toHaveBeenCalled();
    expect(goSpy).toHaveBeenCalled();
    expect(log).toEqual(['onClick', 'go']);
  });

  it('calls the child elements onClick function and honors e.preventDefault()', async () => {
    const goSpy = jest.spyOn(router.stateService, 'go');
    const onClickSpy = jest.fn((e) => e.preventDefault());
    const rendered = mountInRouter(
      <UISref to="state2">
        <a data-testid="anchor" onClick={onClickSpy}>
          state2
        </a>
      </UISref>
    );
    rendered.getByTestId('anchor').click();

    expect(onClickSpy).toHaveBeenCalled();
    expect(goSpy).not.toHaveBeenCalled();
  });

  it("doesn't trigger a transition when middle-clicked", async () => {
    const stateServiceGoSpy = jest.spyOn(router.stateService, 'go');
    const rendered = mountInRouter(
      <UISref to="state2">
        <a data-testid="anchor">state2</a>
      </UISref>
    );

    const link = rendered.getByTestId('anchor');
    link.click();
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);

    fireEvent(link, new MouseEvent('click', { button: 1 }));
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);
  });

  it("doesn't trigger a transition when ctrl/meta/shift/alt+clicked", async () => {
    const stateServiceGoSpy = jest.spyOn(router.stateService, 'go');
    const rendered = mountInRouter(
      <UISref to="state2">
        <a data-testid="anchor">state2</a>
      </UISref>
    );

    const link = rendered.getByTestId('anchor');
    link.click();
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);

    fireEvent(link, new MouseEvent('click', { ctrlKey: true }));
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);

    fireEvent(link, new MouseEvent('click', { metaKey: true }));
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);

    fireEvent(link, new MouseEvent('click', { shiftKey: true }));
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);

    fireEvent(link, new MouseEvent('click', { altKey: true }));
    expect(stateServiceGoSpy).toHaveBeenCalledTimes(1);
  });

  it("doesn't trigger a transition when the anchor has a 'target' attribute", async () => {
    const stateServiceGoSpy = jest.spyOn(router.stateService, 'go');
    const rendered = mountInRouter(
      <UISref to="state2">
        <a data-testid="anchor" target="_blank">
          state2
        </a>
      </UISref>
    );

    rendered.getByTestId('anchor').click();
    expect(stateServiceGoSpy).not.toHaveBeenCalled();
  });
});
