import { render } from '@testing-library/react';
import * as React from 'react';
import { useEffect } from 'react';
import { useDeepObjectDiff } from '../useDeepObjectDiff';

describe('normal react behavior', () => {
  it('triggers effects every time if a new object literal is provided', () => {
    const spy = jest.fn();
    function TestComponent(props) {
      useEffect(spy, [props]);
      return null;
    }

    const wrapper = render(<TestComponent prop={123} />);
    wrapper.rerender(<TestComponent prop={123} />);
    wrapper.rerender(<TestComponent prop={123} />);

    expect(spy).toHaveBeenCalledTimes(3);
  });
});

describe('useDeepObjectDiff', () => {
  it('changes its return value when the object has changed between renders', () => {
    const spy = jest.fn();
    function TestComponent(props) {
      useEffect(spy, [useDeepObjectDiff(props)]);
      return null;
    }

    const wrapper = render(<TestComponent prop={123} />);
    wrapper.rerender(<TestComponent prop={123} />);
    wrapper.rerender(<TestComponent prop={123} />);
    wrapper.rerender(<TestComponent prop={123} />);
    wrapper.rerender(<TestComponent prop={123} />);
    expect(spy).toHaveBeenCalledTimes(1);

    wrapper.rerender(<TestComponent prop={456} />);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
