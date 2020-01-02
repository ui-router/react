import { RawParams, StateDeclaration } from '@uirouter/core';
import { useTransitionHook } from './useTransitionHook';

export function useOnStateChanged(onStateChangedCallback: (state: StateDeclaration, params: RawParams) => void) {
  useTransitionHook('onSuccess', {}, trans => onStateChangedCallback(trans.to(), trans.params('to')));
}
