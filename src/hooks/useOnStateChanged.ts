/** @packageDocumentation @reactapi @module react_hooks */

import { RawParams, StateDeclaration } from '@uirouter/core';
import { useTransitionHook } from './useTransitionHook';

/**
 * A hook that invokes the provided callback whenever the current state changes.
 *
 * The callback receives the [[StateDeclaration]] and parameter values of the new current state.
 *
 * Example:
 * ```jsx
 * function ShowCurrentState() {
 *   const [routerState, setRouterState] = useState('');
 *   useOnStateChanged((state) => setState(state.name);
 *   return <span>{routerState ? `state changed to ${routerState}` : null}</span>
 * }
 * ```
 *
 * @param onStateChangedCallback a callback that receives the new current state and parameter values
 */
export function useOnStateChanged(onStateChangedCallback: (state: StateDeclaration, params: RawParams) => void) {
  useTransitionHook('onSuccess', {}, trans => onStateChangedCallback(trans.to(), trans.params('to')));
}
