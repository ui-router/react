/** @packageDocumentation @reactapi @module react_hooks */
import { useState } from 'react';
import { RawParams, StateDeclaration } from '@uirouter/core';
import { useOnStateChanged } from './useOnStateChanged';
import { useRouter } from './useRouter';

/**
 * A hook that returns the current state and parameter values.
 *
 * Each time the current state or parameter values change, the component will re-render with the new values.
 *
 * Example:
 * ```jsx
 * function CurrentState() {
 *   const { state, params } = useCurrentStateAndParams();
 *   return <span>{state.name} ({JSON.stringify(params)})</span>;
 * }
 * ```
 */
export function useCurrentStateAndParams(): { state: StateDeclaration; params: RawParams } {
  const globals = useRouter().globals;
  const [stateData, setStateData] = useState({ state: globals.current, params: globals.params as RawParams });
  useOnStateChanged((state, params) => setStateData({ state, params }));

  return stateData;
}
