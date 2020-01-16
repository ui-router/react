/** @packageDocumentation @reactapi @module components */
import { isFunction, TransitionOptions } from '@uirouter/core';

import * as _classNames from 'classnames';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { cloneElement, useCallback, useMemo } from 'react';
import { useSref } from '../hooks/useSref';

/** @hidden */
let classNames = _classNames;

export interface UISrefProps {
  children?: any;
  to: string;
  params?: object;
  options?: TransitionOptions;
  className?: string;
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
 * It will also respect the default behavior when the user Cmd+Click / Ctrl+Click on the link by canceling the transition event and opening a new tab instead.
 */
export const UISref: React.FC<UISrefProps> = ({ children, className, options, params, to }) => {
  const { onClick, href } = useSref(to, params, options);
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
