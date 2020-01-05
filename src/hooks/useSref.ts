import * as React from 'react';
import { isString, StateDeclaration, TransitionOptions } from '@uirouter/core';
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

function useListOfAllStates(router: UIRouterReact) {
  const initial = useMemo(() => router.stateRegistry.get(), []);
  const [states, setStates] = useState(initial);
  useEffect(() => router.stateRegistry.onStatesChanged(() => setStates(router.stateRegistry.get())), []);
  return states;
}

// The state the sref was defined in. Used to resolve relative srefs.
function useSrefContextState(router: UIRouterReact): StateDeclaration {
  const parentUIViewAddress = useContext(UIViewContext);
  return useMemo(() => {
    return parentUIViewAddress ? parentUIViewAddress.context : router.stateRegistry.root();
  }, [parentUIViewAddress, router]);
}

// returns the StateDeclaration that this sref targets, or undefined
function useTargetState(router: UIRouterReact, stateName: string, context: StateDeclaration): StateDeclaration {
  // Whenever allStates changes, get the target state again
  const allStates = useListOfAllStates(router);
  return useMemo(() => router.stateRegistry.get(stateName, context), [stateName, context, allStates]);
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
export function useSref(relativeStateName: string, params: object = {}, options: TransitionOptions = {}): LinkProps {
  if (!isString(relativeStateName)) {
    throw new Error(IncorrectStateNameTypeError);
  }

  const router = useRouter();
  const parentUISrefActiveAddStateInfo = useContext(UISrefActiveContext);
  const { stateService } = router;

  const contextState: StateDeclaration = useSrefContextState(router);
  const targetState: StateDeclaration = useTargetState(router, relativeStateName, contextState);
  const stateName = targetState && targetState.name;
  // Keep a memoized reference to the initial params object until the nested values actually change
  const paramsMemo = useMemo(() => params, [useDeepObjectDiff(params)]);

  const optionsMemo = useMemo(() => {
    return { relative: contextState, inherit: true, ...options };
  }, [contextState, options]);

  const href = useMemo(() => {
    return router.stateService.href(stateName, paramsMemo, optionsMemo);
  }, [router, stateName, paramsMemo, optionsMemo]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.stateService.go(stateName, paramsMemo, optionsMemo);
      }
    },
    [router, stateName, paramsMemo, optionsMemo]
  );

  useEffect(() => parentUISrefActiveAddStateInfo(stateName, paramsMemo), [stateName, paramsMemo]);

  return { onClick, href };
}
