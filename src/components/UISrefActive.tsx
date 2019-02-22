/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import { useState, useCallback, useContext, useRef } from 'react';
import { cloneElement } from 'react';
import * as _classNames from 'classnames';

import { useFirstRenderEffect } from './hooks';
import { UIRouterReact, UIRouterContext } from '../index';
import { UIViewAddress } from './UIView';
import { UIRouterInstanceUndefinedError } from './UIRouter';

import { UIViewContext } from './UIView';

/** @hidden */
let classNames = _classNames;

export interface UISrefActiveState {
  state: { name?: string; [key: string]: any };
  params: Object;
  hash: string;
}

/** @hidden */
export type AddStateInfoFn = (
  to: string,
  params: { [key: string]: any }
) => () => void;

/** @hidden */
type UISrefActiveStateContainer = {
  info: UISrefActiveState;
  hash: string;
};

/** @hidden */
export const IncorrectStateNameTypeError = new Error(
  'State name provided to <UISref {to}> must be a string.'
);

/** @internalapi */
export const UISrefActiveContext = React.createContext<AddStateInfoFn>(null);

/** @hidden */
function createStateHash(state: string, params: {}) {
  if (typeof state !== 'string') {
    throw IncorrectStateNameTypeError;
  }
  return params && typeof params === 'object'
    ? state + JSON.stringify(params)
    : state;
}

/**
 * @hidden
 * Creates a UISrefActiveStateContainer from a state name and its params and an optional parent UIView address.
 * It returns a State Info and its hash to be used to check againts the current state when the component needs to apply active classes.
 */
export function createStateInfoAndHash(
  router: UIRouterReact,
  parentUIViewAddress: UIViewAddress,
  stateName: string,
  stateParams: object
): UISrefActiveStateContainer {
  const { stateService, stateRegistry } = router;
  const stateContext =
    (parentUIViewAddress && parentUIViewAddress.context) ||
    stateRegistry.root();
  const state = stateService.get(stateName, stateContext);
  const stateHash = createStateHash(stateName, stateParams);
  const stateInfo = {
    state: state || { name: stateName },
    params: stateParams,
    hash: stateHash,
  };

  return {
    info: stateInfo,
    hash: stateHash,
  };
}

/**
 * @hidden
 * Takes a UISrefActiveStateContainer and adds the state info and the activeClass and registers them in the array and map.
 * It returns a function to remove the state info and the class from the contaners when called.
 */
export function addToRegisterWithUnsubscribe(
  states: Array<UISrefActiveState>,
  classesMap: { [key: string]: string },
  newState: UISrefActiveStateContainer,
  newClass: string
) {
  states.push(newState.info);
  classesMap[newState.hash] = newClass;
  return () => {
    const idx = states.indexOf(newState.info);
    if (idx !== -1) {
      states.splice(idx, 1);
      delete classesMap[newState.hash];
    }
  };
}

/** @hidden */
const getChecker = (stateService, exact) => {
  return exact
    ? (stateName, params) => stateService.is(stateName, params)
    : (stateName, params) => stateService.includes(stateName, params);
};


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
export function UISrefActive({
  children,
  className,
  class: classToApply,
  exact,
}: UISrefActiveProps) {
  const router = useContext<UIRouterReact>(UIRouterContext);
  const parentUIViewAddress = useContext<UIViewAddress>(UIViewContext);
  const parentAddStateInfo = useContext<AddStateInfoFn>(UISrefActiveContext);

  // keep track of states to watch and their activeClasses
  const states = useRef<Array<UISrefActiveState>>([]);
  const activeClassesMap = useRef<{ [key: string]: string }>({});

  const activeClassesRef = useRef<string>('');
  const [activeClasses, setActiveClasses] = useState<string>('');

  const getActiveClasses = useCallback(
    (): string => {
      const { stateService } = router;
      const checker = getChecker(stateService, exact);
      const classes = states.current
        .filter(({ state, params }) => checker(state.name, params))
        .map(({ hash }) => activeClassesMap.current[hash]);
      return classNames(classes);
    },
    [router, states, activeClassesMap, exact]
  );

  const updateActiveClasses = useCallback(
    () => {
      const newActiveClasses = getActiveClasses();
      if (activeClassesRef.current !== newActiveClasses) {
        activeClassesRef.current = newActiveClasses;
        setActiveClasses(newActiveClasses);
      }
    },
    [activeClassesRef.current, setActiveClasses, getActiveClasses]
  );

  const registerStateAndClass = useCallback(
    (stateName, stateParams, activeClass) => {
      const state = createStateInfoAndHash(
        router,
        parentUIViewAddress,
        stateName,
        stateParams
      );
      return addToRegisterWithUnsubscribe(
        states.current,
        activeClassesMap.current,
        state,
        activeClass
      );
    },
    [router, parentUIViewAddress, activeClassesMap, states.current]
  );

  const addStateInfo = useCallback(
    (stateName, stateParams) => {
      const deregister = registerStateAndClass(
        stateName,
        stateParams,
        classToApply
      );
      updateActiveClasses();

      if (typeof parentAddStateInfo === 'function') {
        const parentDeregister = parentAddStateInfo(stateName, stateParams);
        return () => {
          deregister();
          parentDeregister();
        };
      }

      return deregister;
    },
    [classToApply, parentAddStateInfo, registerStateAndClass]
  );

  useFirstRenderEffect(() => {
    if (typeof router === 'undefined') {
      throw UIRouterInstanceUndefinedError;
    }
    // register callback for state change
    const deregister = router.transitionService.onSuccess({}, () => {
      updateActiveClasses();
    });

    return () => {
      deregister();
    };
  });

  // If any active class is defined, apply it the children
  const childrenWithActiveClasses =
    activeClasses.length > 0
      ? cloneElement(children, {
          ...children.props,
          className: classNames(
            className,
            children.props.className,
            activeClasses
          ),
        })
      : children;

  return (
    <UISrefActiveContext.Provider value={addStateInfo}>
      {childrenWithActiveClasses}
    </UISrefActiveContext.Provider>
  );
}

export const useUISrefActive = (stateName, params = null, exact = false) => {
  const { transitionService, stateService } = useContext<UIRouterReact>(UIRouterContext);
  const check = React.useMemo(() => getChecker(stateService, exact), [stateService, exact]);
  const [isActive = check(stateName, params), setState] = React.useState(undefined);

  const transitionHook = React.useCallback(() => setState(check(stateName, params)), [
    setState,
    check,
    stateName,
    params,
  ]);

  React.useEffect(() => {
    const deregister = transitionService.onSuccess({}, transitionHook);
    return () => deregister();
  }, [transitionService, transitionHook]);

  return isActive;
};
