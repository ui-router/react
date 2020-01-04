import * as React from 'react';
import { mount } from 'enzyme';
import { useStableCallback } from '../useStableCallback';

describe('useStableCallback', () => {
  function TestComponent({ prop = 'prop', spy }: { prop?: any; spy: any }) {
    const unstableCallback = () => prop;
    const stableCallback = useStableCallback(unstableCallback);
    spy(unstableCallback, stableCallback);
    return <div />;
  }

  it('returns the same stable callback reference over multiple renders', async () => {
    const spy = jest.fn();
    const wrapper = mount(<TestComponent spy={spy} />);
    wrapper.setProps({ prop: 'newvalue' });
    wrapper.setProps({ prop: 'nextvalue' });
    expect(spy).toHaveBeenCalledTimes(3);

    const stableArg1 = spy.mock.calls[0][1];
    const stableArg2 = spy.mock.calls[1][1];
    const stableArg3 = spy.mock.calls[2][1];

    expect(stableArg1).toBe(stableArg2);
    expect(stableArg1).toBe(stableArg3);
    expect(stableArg2).toBe(stableArg3);
  });

  it('returns the most recent unstable callback reference over multiple renders', async () => {
    const spy = jest.fn();
    const wrapper = mount(<TestComponent spy={spy} />);
    wrapper.setProps({ prop: 'newvalue' });
    wrapper.setProps({ prop: 'nextvalue' });
    expect(spy).toHaveBeenCalledTimes(3);

    const stableArg1 = spy.mock.calls[0][0];
    const stableArg2 = spy.mock.calls[1][0];
    const stableArg3 = spy.mock.calls[2][0];

    expect(stableArg1.name).toBe('unstableCallback');
    expect(stableArg2.name).toBe('unstableCallback');
    expect(stableArg3.name).toBe('unstableCallback');

    expect(stableArg1).not.toBe(stableArg2);
    expect(stableArg1).not.toBe(stableArg3);
    expect(stableArg2).not.toBe(stableArg3);
  });

  it('allows a stable callback reference to access the latest render closure values', async () => {
    const spy = jest.fn();
    const wrapper = mount(<TestComponent spy={spy} />);
    wrapper.setProps({ prop: 'newvalue' });
    wrapper.setProps({ prop: 'nextvalue' });
    expect(spy).toHaveBeenCalledTimes(3);

    const stableArg3 = spy.mock.calls[2][0];
    expect(stableArg3()).toBe('nextvalue');
  });
});
