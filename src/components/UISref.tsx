/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import { useContext, useEffect, useMemo, useCallback, cloneElement } from 'react';
import * as PropTypes from 'prop-types';

import * as _classNames from 'classnames';

import { isFunction, TransitionOptions } from '@uirouter/core';

import { UIRouterReact, UIRouterContext, StateRegistry } from '../index';
import { UIViewAddress, UIViewContext } from './UIView';
import { UISrefActiveContext, AddStateInfoFn } from './UISrefActive';

/** @hidden */
let classNames = _classNames;

export interface UISrefProps {
  children?: any;
  to: string;
  params?: { [key: string]: any };
  options?: TransitionOptions;
  className?: string;
}

export interface LinkProps {
  onClick: React.MouseEventHandler;
  href?: string;
}

/** @hidden */
export function getTransitionOptions(
  stateRegistry: StateRegistry,
  options: TransitionOptions,
  parentUIViewAddress?: UIViewAddress
) {
  const parentContext =
    (parentUIViewAddress && parentUIViewAddress.context) ||
    stateRegistry.root();
  return { relative: parentContext, inherit: true, ...options };
}

export function useUISref(
  to: string,
  params: { [key: string]: any } = {},
  options: TransitionOptions = {}
): LinkProps {
  const router = useContext<UIRouterReact>(UIRouterContext);
  const parentUIViewAddress = useContext<UIViewAddress>(UIViewContext);
  const parentUISrefActiveAddStateInfo = useContext<AddStateInfoFn>(UISrefActiveContext);

  const { stateService, stateRegistry } = router;

  useEffect(() => parentUISrefActiveAddStateInfo(to, params), []);

  const hrefOptions = useMemo(
    () => getTransitionOptions(stateRegistry, options, parentUIViewAddress),
    [options, parentUIViewAddress, stateRegistry],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        stateService.go(to, params, hrefOptions);
      }
    },
    [hrefOptions, params, stateService, to]
  );

  return {
    onClick: handleClick,
    href: stateService.href(to, params, hrefOptions),
  };
}

/**
 * This component lets create links to router states, allowing the user to navigate through the application.
 * It works well together with `<a>` and `<button>` nodes.
 *
 * You can wrap your anchor/button and define the router state you want it to link to via props.
 * If the state has an associated URL, it will automatically generate and update the `href` attribute.
 * Cliking its children will trigger a state transition with the optional parameters.
 *
 * #### Example:
 * ```jsx
 * // state definition
 * const state = {
 *   name: 'catalog',
 *   url: '/shop/catalog?productId',
 *   component: Catalog
 * }
 *
 * // UISref component
 * <UISref to="catalog" params={{productId:103}}>
 *   <a>Product 103</a>
 * </UISref>
 *
 * // rendered dom
 * <a href="#/shop/catalog?productId=103">Product 103</a>
 * ```
 *
 * It will also repect the default behavior when the user Cmd+Click / Ctrl+Click on the link by canceling the transition event and opening a new tab instead.
 */
export const UISref: React.FC<UISrefProps> = ({ children, className, options, params, to }) => {
  const { onClick, href } = useUISref(to, params, options);
  const childrenProps = children.props;

  const handleClick = useCallback(
    e => {
      const childOnClick = childrenProps.onClick;
      if (isFunction(childOnClick)) {
        childOnClick(e);
      }

      onClick(e);
    },
    [childrenProps, onClick]
  );

  const props = useMemo(
    () =>
      Object.assign({}, childrenProps, {
        onClick: handleClick,
        href: href,
        className: classNames(className, childrenProps.className),
      }),
    [childrenProps, handleClick, href, className]
  );

  return useMemo(() => cloneElement(children, props), [children, props]);
};

UISref.displayName = 'UISref';

UISref.propTypes = {
  children: PropTypes.element.isRequired,
  to: PropTypes.string.isRequired,
  params: PropTypes.object,
  options: PropTypes.object,
  className: PropTypes.string,
};

UISref.defaultProps = {
  params: {},
  options: {},
  className: null,
};
