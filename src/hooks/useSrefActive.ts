import { TransitionOptions } from '@uirouter/core';
import { LinkProps, useSref } from './useSref';
import { useIsActive } from './useIsActive';

interface ActiveLinkProps extends LinkProps {
  className: string;
}

/**
 * A hook that helps create link to a state and tracks if that state is active.
 *
 * This hook returns an object the following properties of an sref (short for state reference).
 *
 * - href: the browser URL of the referenced state
 * - onClick: a mouse event handler that will active the referenced state
 * - className: the activeClass parameter when the state or any child state is active, otherwise an empty string
 *
 * Example
 * ```
 * function LinkToHome() {
 *   const sref = useSrefActive('home', null, 'active');
 *   return <a {...sref}>Home</a>
 * }
 * ```
 *
 * @param stateName The name of the state to link to
 * @param params Any parameter values
 * @param activeClass A css class string to use when the state is active
 * @param options Transition options
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
