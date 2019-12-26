/**
 * @reactapi
 * @module components
 */
/** */

import * as React from 'react';
import { removeFrom } from '@uirouter/core';
import { useState, useCallback, useContext, useMemo, cloneElement } from 'react';
import * as _classNames from 'classnames';

import { useCurrentStateAndParams, useUIRouter } from './hooks';

/** @hidden */
let classNames = _classNames;

export interface UISrefActiveState {
  stateName: string;
  params: object;
}

/** @hidden */
export type AddStateInfoFn = (to: string, params: { [key: string]: any }) => () => void;

/** @hidden */
export const IncorrectStateNameTypeError = new Error('State name provided to <UISref {to}> must be a string.');

/** @internalapi */
const rootAddStateInfoFn: AddStateInfoFn = () => () => undefined;
export const UISrefActiveContext = React.createContext<AddStateInfoFn>(rootAddStateInfoFn);

export interface UISrefActiveProps {
  /**
   * The class string to apply when the state is active (i.e. `"menu-item-active"`)
   */
  class?: string;
  /**
   * Whether the target state of the child [[UISref]] should match exactly the state or could also be a child state.
   * When set to `true`, if state params are supplied then they will be tested for strict equality against the current active url params, so all params must match with none missing and no extras.
   */
  exact?: Boolean;
  /**
   * The component to apply the active class to. It should be a [[UISref]] or any node with [[UISref]] descendant
   */
  children?: any;
  /**
   * Any class will be passed down to its child component
   */
  className?: string;
}

/**
 * A component working alongside `[[UISref]]` to add classes to its child element when one of the included `[[UISref]]`'s state is active, and removing them when it is inactive.
 *
 * The primary use-case is to simplify the special appearance of navigation menus relying on `[[<UISref>]]`, by having the "active" state's menu button appear different, distinguishing it from the inactive menu items.
 *
 * It will register **every** nested `[[<UISref>]]` and add the class to its child every time one of the states is active.
 *
 * ```jsx
 * <UISrefActive class="active-item">
 *   <UISref to="homestate"><a class="menu-item">Home</a></UISref>
 * </UISrefActive>
 *
 * // rendered when state is inactive
 * <a href="/path/to/homestate" class="menu-item">Home</a>
 *
 * // rendered when state is active
 * <a href="/path/to/homestate" class="menu-item active-item">Home</a>
 * ```
 */
export function UISrefActive({ children, className, class: classToApply, exact }: UISrefActiveProps) {
  const { stateService } = useUIRouter();
  const parentAddStateInfo = useContext(UISrefActiveContext);

  // keep track of states to watch and their activeClasses
  const [uiSrefs, setUiSrefs] = useState<UISrefActiveState[]>([]);
  const currentState = useCurrentStateAndParams();

  const isAnyUiSrefActive = useMemo(() => {
    return uiSrefs.some(({ stateName, params }) => {
      return exact ? stateService.is(stateName, params) : stateService.includes(stateName, params);
    });
  }, [uiSrefs, exact, stateService, currentState]);

  const addStateInfo = useCallback(
    (stateName: string, params: object) => {
      const parentDeregister = parentAddStateInfo(stateName, params);
      const addedUiSref = { stateName, params };
      setUiSrefs(uiSrefs => uiSrefs.concat(addedUiSref));
      return () => {
        parentDeregister();
        setUiSrefs(uiSrefs => removeFrom(uiSrefs, addedUiSref));
      };
    },
    [parentAddStateInfo]
  );

  // If any active class is defined, apply it the children
  const childrenWithActiveClasses = isAnyUiSrefActive
    ? cloneElement(children, {
        ...children.props,
        className: classNames(className, children.props.className, classToApply),
      })
    : children;

  return <UISrefActiveContext.Provider value={addStateInfo}>{childrenWithActiveClasses}</UISrefActiveContext.Provider>;
}

export const useUISrefActive = (stateName, params = null, exact = false) => {
  const { stateService } = useUIRouter();
  const currentState = useCurrentStateAndParams();
  const isActive = useMemo(
    () => (exact ? stateService.is(stateName, params) : stateService.includes(stateName, params)),
    [exact, stateName, params, currentState]
  );

  return isActive;
};
