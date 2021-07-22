import * as React from 'react';
import { useState, useCallback, useContext, useMemo, cloneElement } from 'react';
import classNames from 'classnames';

import { useCurrentStateAndParams, useRouter } from '../hooks';

export interface UISrefActiveState {
  stateName: string;
  params: object;
}

/** @hidden */
export type AddStateInfoFn = (to: string, params: { [key: string]: any }) => () => void;

/** @internal */
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
 * A component that applies an 'active' class when a [[UISref]] component's state is active.
 *
 * If you are using functional components, consider using the [[useSrefActive]] hook instead.
 *
 * This component works together with `[[UISref]]` child components.
 * It adds an active class to its child element when any of its children `[[UISref]]`'s state is active.
 *
 * This component can be used to highlight the active state in a navigation menu.
 *
 * ```jsx
 * <UISrefActive class="active-item">
 *   <UISref to="homestate"><a className="menu-item">Home</a></UISref>
 * </UISrefActive>
 *
 * // rendered when state is inactive
 * <a href="/path/to/homestate" class="menu-item">Home</a>
 *
 * // rendered when state is active
 * <a href="/path/to/homestate" class="menu-item active-item">Home</a>
 * ```
 *
 * Note: A `UISrefActive` will add the class if any child `UISref` is active.
 * This can be used to highlight a parent nav item if any nested child nav items are active.
 *
 *
 * ```jsx
 * <UISrefActive class="active">
 *   <div className="menu-item-dropdown">
 *     <span>Admin<span>
 *     <ul>
 *       <li><UISref to="users"><a className="menu-item">Users</a></UISref></li>
 *       <li><UISref to="groups"><a className="menu-item">Groups</a></UISref></li>
 *     </ul>
 *   </div>
 * </UISrefActive>
 *
 * // rendered with either users or groups states are active
 * <div className="active menu-item-dropdown">
 * ```
 */
export function UISrefActive({ children, className, class: classToApply, exact }: UISrefActiveProps) {
  const { stateService } = useRouter();
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
      setUiSrefs((uiSrefs) => uiSrefs.concat(addedUiSref));
      return () => {
        parentDeregister();
        setUiSrefs((uiSrefs) => uiSrefs.filter((x) => x !== addedUiSref));
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
