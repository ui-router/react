import * as React from 'react';
import { isString, TransitionOptions } from '@uirouter/core';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { StateRegistry, UIViewAddress } from '../../index';
import { UISrefActiveContext } from '../UISrefActive';
import { UIViewContext } from '../UIView';
import { useRouter } from './useRouter';

export interface LinkProps {
  onClick: React.MouseEventHandler<any>;
  href?: string;
}

/** @hidden */
export const IncorrectStateNameTypeError = `The state name passed to useSref must be a string.`;

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
  const router = useRouter();
  const parentUIViewAddress = useContext(UIViewContext);
  const parentUISrefActiveAddStateInfo = useContext(UISrefActiveContext);

  const { stateService, stateRegistry } = router;
  if (!isString(stateName)) {
    throw new Error(IncorrectStateNameTypeError);
  }

  useEffect(() => parentUISrefActiveAddStateInfo(stateName, params), []);

  const hrefOptions = useMemo(() => getTransitionOptions(stateRegistry, options, parentUIViewAddress), [
    options,
    parentUIViewAddress,
    stateRegistry,
  ]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        stateService.go(stateName, params, hrefOptions);
      }
    },
    [hrefOptions, params, stateService, stateName]
  );

  return {
    onClick: handleClick,
    href: stateService.href(stateName, params, hrefOptions),
  };
}

/** @hidden */
export function getTransitionOptions(
  stateRegistry: StateRegistry,
  options: TransitionOptions,
  parentUIViewAddress?: UIViewAddress
) {
  const parentContext = (parentUIViewAddress && parentUIViewAddress.context) || stateRegistry.root();
  return { relative: parentContext, inherit: true, ...options };
}
