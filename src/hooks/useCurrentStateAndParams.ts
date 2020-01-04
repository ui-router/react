import { useState } from 'react';
import { RawParams, StateDeclaration } from '@uirouter/core';
import { useOnStateChanged } from './useOnStateChanged';
import { useRouter } from './useRouter';

/**
 * Returns the current state and parameter values.
 *
 * Each time the current state or parameter values change, the component will re-render with the new values.
 */
export function useCurrentStateAndParams(): { state: StateDeclaration; params: RawParams } {
  const globals = useRouter().globals;
  const [stateData, setStateData] = useState({ state: globals.current, params: globals.params as RawParams });
  useOnStateChanged((state, params) => setStateData({ state, params }));

  return stateData;
}
