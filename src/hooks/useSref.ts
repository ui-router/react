/** @packageDocumentation @reactapi @module react_hooks */

import * as React from 'react';
import { ReactHTMLElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isString, StateDeclaration, TransitionOptions, UIRouter } from '@uirouter/core';
import { UISrefActiveContext } from '../components';
import { useDeepObjectDiff } from './useDeepObjectDiff';
import { useParentView } from './useParentView';
import { useRouter } from './useRouter';

export interface LinkProps {
  onClick: React.MouseEventHandler<any>;
  href?: string;
}

/** @hidden */
export const IncorrectStateNameTypeError = `The state name passed to useSref must be a string.`;

/** @hidden Gets all StateDeclarations that are registered in the StateRegistry. */
function useListOfAllStates(router: UIRouter) {
  const initial = useMemo(() => router.stateRegistry.get(), []);
  const [states, setStates] = useState(initial);
  useEffect(() => router.stateRegistry.onStatesChanged(() => setStates(router.stateRegistry.get())), []);
  return states;
}

/** @hidden Gets the StateDeclaration that this sref targets */
function useTargetState(router: UIRouter, stateName: string, relative: string): StateDeclaration {
  // Whenever any states are added/removed from the registry, get the target state again
  const allStates = useListOfAllStates(router);
  return useMemo(() => {
    return router.stateRegistry.get(stateName, relative);
  }, [router, stateName, relative, allStates]);
}

/**
 * A hook to create a link to a state.
 *
 * This hook returns link (anchor tag) props for a given state reference.
 * The resulting props can be spread onto an anchor tag.
 *
 * The props returned from this hook are:
 *
 * - `href`: the browser URL of the referenced state
 * - `onClick`: a mouse event handler that will active the referenced state
 *
 * Example:
 * ```jsx
 * function HomeLink() {
 *   const sref = useSref('home');
 *   return <a {...sref}>Home</a>
 * }
 * ```
 *
 * Example:
 * ```jsx
 * function UserLink({ userId, username }) {
 *   const sref = useSref('users.user', { userId: userId });
 *   return <a {...sref}>{username}</a>
 * }
 * ```
 *
 * @param stateName The name of the state to link to
 * @param params Any parameter values
 * @param options Transition options used when the onClick handler fires.
 */
export function useSref(stateName: string, params: object = {}, options: TransitionOptions = {}): LinkProps {
  if (!isString(stateName)) {
    throw new Error(IncorrectStateNameTypeError);
  }

  const router = useRouter();
  // memoize the params object until the nested values actually change so they can be used as deps
  const paramsMemo = useMemo(() => params, [useDeepObjectDiff(params)]);

  const relative: string = useParentView().context.name;
  const optionsMemo = useMemo(() => ({ relative, inherit: true, ...options }), [relative, options]);
  const targetState = useTargetState(router, stateName, relative);
  // Update href when the target StateDeclaration changes (in case the the state definition itself changes)
  // This is necessary to handle things like future states
  const href = useMemo(() => {
    return router.stateService.href(stateName, paramsMemo, optionsMemo);
  }, [router, stateName, paramsMemo, optionsMemo, targetState]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      const targetAttr = (e.target as any)?.attributes?.target;
      const modifierKey = e.button >= 1 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
      if (!e.defaultPrevented && targetAttr == null && !modifierKey) {
        e.preventDefault();
        router.stateService.go(stateName, paramsMemo, optionsMemo);
      }
    },
    [router, stateName, paramsMemo, optionsMemo]
  );

  // Participate in any parent UISrefActive
  const parentUISrefActiveAddStateInfo = useContext(UISrefActiveContext);
  useEffect(() => {
    return parentUISrefActiveAddStateInfo(targetState && targetState.name, paramsMemo);
  }, [targetState, paramsMemo]);

  return { onClick, href };
}
