/** @packageDocumentation @reactapi @module react_hooks */

import { useEffect, useMemo, useState } from 'react';
import { UIRouter } from '@uirouter/core';
import { useDeepObjectDiff } from './useDeepObjectDiff';
import { useOnStateChanged } from './useOnStateChanged';
import { useParentView } from './useParentView';
import { useRouter } from './useRouter';

/** @hidden */
function checkIfActive(router: UIRouter, stateName: string, params: object, relative: string, exact: boolean) {
  return exact
    ? router.stateService.is(stateName, params, { relative })
    : router.stateService.includes(stateName, params, { relative });
}

/**
 * A hook that returns true if a given state is active.
 *
 * Example:
 * ```jsx
 * function ContactsLabel() {
 *  const isActive = useIsActive('contacts');
 *  return <span className={isActive ? 'active' : 'inactive'}>Contacts></span>
 * }
 * ```
 *
 * Example:
 * ```jsx
 * function JoeLabel() {
 *  const isActive = useIsActive('contacts.contact', { contactId: 'joe' });
 *  return <span className={isActive ? 'active' : 'inactive'}>Joe></span>
 * }
 * ```
 *
 * @param stateName the name of the state to check.
 *        Relative state names such as '.child' are supported.
 *        Relative states are resolved relative to the state that rendered the hook.
 * @param params if present, the hook will only return true if all the provided parameter values match.
 * @param exact when true, the hook returns true only when the state matches exactly.
 *        when false, returns true if the state matches, or any child state matches.
 */
export function useIsActive(stateName: string, params = null, exact = false) {
  const router = useRouter();
  const relative = useParentView().context.name;
  // Don't re-compute initialIsActive on every render
  const initialIsActive = useMemo(() => checkIfActive(router, stateName, params, relative, exact), []);
  const [isActive, setIsActive] = useState(initialIsActive);

  const checkIfActiveChanged = () => {
    const newIsActive = checkIfActive(router, stateName, params, relative, exact);
    if (newIsActive !== isActive) {
      setIsActive(newIsActive);
    }
  };

  useOnStateChanged(checkIfActiveChanged);
  useEffect(checkIfActiveChanged, [router, stateName, useDeepObjectDiff(params), exact]);

  return isActive;
}
