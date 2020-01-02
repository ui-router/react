import { curry, HookFn, StateParams, TransitionService, TransitionStateHookFn } from '@uirouter/core';
import { HookMatchCriteria, HookRegOptions, TransitionHookFn } from '@uirouter/core/lib/transition/interface';
import { useEffect, useState } from 'react';
import { useRouter } from './useRouter';

type HookName = 'onBefore' | 'onStart' | 'onSuccess' | 'onError' | 'onSuccess' | 'onFinish';
type StateHookName = 'onEnter' | 'onRetain' | 'onExit';

export function useTransitionHook(
  hookName: HookName,
  criteria: HookMatchCriteria,
  callback: TransitionHookFn,
  options?: HookRegOptions
);
export function useTransitionHook(
  hookName: StateHookName,
  criteria: HookMatchCriteria,
  callback: TransitionStateHookFn,
  options?: HookRegOptions
);
export function useTransitionHook(
  hookRegistrationFn: HookName | StateHookName,
  criteria: HookMatchCriteria,
  callback: TransitionHookFn | TransitionStateHookFn,
  options?: HookRegOptions
) {
  const { transitionService } = useRouter();
  useEffect(() => {
    const deregister = transitionService[hookRegistrationFn](criteria, callback as any, options);
    return () => deregister();
  }, [transitionService, hookRegistrationFn]);
}
