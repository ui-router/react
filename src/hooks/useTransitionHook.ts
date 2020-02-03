/** @packageDocumentation @reactapi @module react_hooks */

import { useEffect } from 'react';
import { TransitionStateHookFn, HookMatchCriteria, HookRegOptions, TransitionHookFn } from '@uirouter/core';
import { useDeepObjectDiff } from './useDeepObjectDiff';
import { useRouter } from './useRouter';
import { useStableCallback } from './useStableCallback';

type HookName = 'onBefore' | 'onStart' | 'onSuccess' | 'onError' | 'onSuccess' | 'onFinish';
type StateHookName = 'onEnter' | 'onRetain' | 'onExit';

/**
 * A React hook that registers a UI-Router Transition Hook and manages its lifecycle.
 *
 * This hook can be used to register a Transition Hook with UI-Router from a component.
 * The Transition Hook will be automatically de-registered when the component unmounts.
 * The Transition Hook will receive the current [[Transition]] object (like all Transition Hooks).
 *
 *
 * Example:
 * ```jsx
 * function DisallowExitUntilVerified() {
 *   const [allowExit, setAllowExit] = useState(false);
 *   useTransitionHook('onBefore', {}, transition => {
 *     return allowExit;
 *   });
 *
 *   if (canExit) {
 *     return <span>OK, the current state can be exited!</span>
 *   }
 *   return (
 *     <div>
 *       The current state can't be exited until you click this button:
 *       <button onClick={() => setAllowExit(true)}>Allow Exit</button>
 *      </div>
 *   )
 * }
 * ```
 *
 * @param hookName the name of the lifecycle event
 * @param criteria the transition criteria object
 * @param callback the callback to invoke
 * @param options transition hook options
 */
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
  hookRegistrationFnName: HookName | StateHookName,
  criteria: HookMatchCriteria,
  callback: TransitionHookFn | TransitionStateHookFn,
  options?: HookRegOptions
) {
  const { transitionService } = useRouter();
  const stableCallback = useStableCallback(callback);
  useEffect(() => {
    if (!!criteria) {
      const deregister = transitionService[hookRegistrationFnName](criteria, stableCallback as any, options);
      return () => deregister();
    } else {
      return () => {};
    }
  }, [transitionService, hookRegistrationFnName, useDeepObjectDiff(criteria), useDeepObjectDiff(options)]);
}
