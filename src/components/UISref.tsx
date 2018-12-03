/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import { useContext, useEffect, useRef, cloneElement } from 'react';

import * as _classNames from 'classnames';

import { isFunction, TransitionOptions } from '@uirouter/core';

import { UIRouterReact, UIRouterContext } from '../index';
import { UIViewAddress, UIViewContext } from './UIView';
import { UIRouterInstanceUndefinedError } from './UIRouter';
import { UISrefActiveContext, AddStateInfoFn } from './UISrefActive';
import { useFirstRenderEffect } from './hooks';

/** @hidden */
let classNames = _classNames;

export interface UISrefProps {
  children?: any;
  to: string;
  params?: { [key: string]: any };
  options?: TransitionOptions;
  className?: string;
}

/** @hidden */
export function getTransitionOptions(
  router: UIRouterReact,
  options: TransitionOptions,
  parentUIViewAddress?: UIViewAddress
) {
  const parentContext =
    (parentUIViewAddress && parentUIViewAddress.context) ||
    router.stateRegistry.root();
  return { relative: parentContext, inherit: true, ...options };
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
export function UISref({
  children,
  to,
  params = {},
  options = {},
  className,
}: UISrefProps) {
  const router = useContext<UIRouterReact>(UIRouterContext);
  const parentUIViewAddress = useContext<UIViewAddress>(UIViewContext);
  const parentUISrefActiveAddStateInfo = useContext<AddStateInfoFn>(
    UISrefActiveContext
  );

  useFirstRenderEffect(() => {
    const deregister =
      typeof parentUISrefActiveAddStateInfo === 'function'
        ? parentUISrefActiveAddStateInfo(to, params)
        : () => {};
    if (typeof router === 'undefined') {
      throw UIRouterInstanceUndefinedError;
    }

    return () => {
      deregister();
    };
  });

  const getOptions = () =>
    getTransitionOptions(router, options, parentUIViewAddress);

  const handleClick = e => {
    const childOnClick = children.props.onClick;
    if (isFunction(childOnClick)) {
      childOnClick(e);
    }

    if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      router.stateService.go(to, params, getOptions());
    }
  };

  const childrenProps = children.props;
  const props = {
    ...childrenProps,
    onClick: handleClick,
    href: router.stateService.href(to, params, getOptions()),
    className: classNames(className, childrenProps.className),
  };
  return cloneElement(children, props);
}
