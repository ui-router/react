import * as React from 'react';
import { isString, RawParams, StateDeclaration, TransitionOptions } from '@uirouter/core';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StateRegistry, UIRouterReact, UIViewAddress } from '../index';
import { UISrefActiveContext, UIViewContext } from '../components';
import { useDeepObjectDiff } from './useDeepObjectDiff';
import { useRouter } from './useRouter';

export interface LinkProps {
  onClick: React.MouseEventHandler<any>;
  href?: string;
}

/** @hidden */
export const IncorrectStateNameTypeError = `The state name passed to useSref must be a string.`;

/** Gets all StateDeclarations that are registered in the StateRegistry. */
function useListOfAllStates(router: UIRouterReact) {
  const initial = useMemo(() => router.stateRegistry.get(), []);
  const [states, setStates] = useState(initial);
  useEffect(() => router.stateRegistry.onStatesChanged(() => setStates(router.stateRegistry.get())), []);
  return states;
}

/** Gets the StateDeclaration that this sref was defined in.  Used to resolve relative refs. */
function useSrefContextState(router: UIRouterReact): StateDeclaration {
  const parentUIViewAddress = useContext(UIViewContext);
  return useMemo(() => {
    return parentUIViewAddress ? parentUIViewAddress.context : router.stateRegistry.root();
  }, [parentUIViewAddress, router]);
}

/** Gets the StateDeclaration that this sref targets */
function useTargetState(router: UIRouterReact, stateName: string, context: StateDeclaration): StateDeclaration {
  // Whenever any states are added/removed from the registry, get the target state again
  const allStates = useListOfAllStates(router);
  return useMemo(() => {
    return router.stateRegistry.get(stateName, context);
  }, [router, stateName, context, allStates]);
}

/**
 * A hook that helps create link to a state.
 *
 * This hook returns data for an sref (short for state reference)
 *
 * @param stateName The name of the state to link to
 * @param params Any parameter values
 * @param options Transition options
 */
export function useSref(stateName: string, params: object = {}, options: TransitionOptions = {}): LinkProps {
  if (!isString(stateName)) {
    throw new Error(IncorrectStateNameTypeError);
  }

  const router = useRouter();
  // memoize the params object until the nested values actually change so they can be used as deps
  const paramsMemo = useMemo(() => params, [useDeepObjectDiff(params)]);

  const contextState: StateDeclaration = useSrefContextState(router);
  const optionsMemo = useMemo(() => ({ relative: contextState, inherit: true, ...options }), [contextState, options]);
  const targetState = useTargetState(router, stateName, contextState);
  // Update href when the target StateDeclaration changes (in case the the state definition itself changes)
  // This is necessary to handle things like future states
  const href = useMemo(() => {
    return router.stateService.href(stateName, params, options);
  }, [router, stateName, params, options, targetState]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
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
