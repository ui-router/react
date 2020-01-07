/** @packageDocumentation @reactapi @module react_hooks */

import { TransitionOptions } from '@uirouter/core';
import { LinkProps, useSref } from './useSref';
import { useIsActive } from './useIsActive';

interface ActiveLinkProps extends LinkProps {
  className: string;
}

/**
 * A hook to create a link to a state and track its active status.
 *
 * This hook returns link (anchor tag) props for a given state reference.
 * The resulting props can be spread onto an anchor tag.
 * If the referenced state (and params) is active, then the activeClass is returned as the `className` prop.
 *
 * The props returned from this hook are:
 *
 * - `href`: the browser URL of the referenced state
 * - `onClick`: a mouse event handler that will active the referenced state
 * - `className`: the activeClass parameter when the state (or any child state) is active, otherwise an empty string
 *
 * Example:
 * ```jsx
 * function HomeLink() {
 *   const sref = useSref('home', null, 'active');
 *   return <a {...sref}>Home</a>
 * }
 * ```
 *
 * Example:
 * ```jsx
 * function UserLink({ userId, username }) {
 *   const sref = useSref('users.user', { userId: userId }, 'active');
 *   return <a {...sref}>{username}</a>
 * }
 * ```
 *
 * This hook is a variation of the [[useSref]] hook.
 *
 * @param stateName The name of the state to link to
 * @param params Any parameter values
 * @param activeClass A css class string to use when the state is active
 * @param options Transition options used when the onClick handler fires.
 */
export function useSrefActive(
  stateName: string,
  params: object = {},
  activeClass: string,
  options: TransitionOptions = {}
): ActiveLinkProps {
  const { href, onClick } = useSref(stateName, params, options);
  const isActive = useIsActive(stateName, params, false);
  const className = isActive ? activeClass : '';
  return { href, onClick, className };
}
