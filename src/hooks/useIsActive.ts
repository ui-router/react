import { StateDeclaration } from '@uirouter/core';
import { useEffect, useMemo, useState } from 'react';
import { UIRouterReact } from '../core';
import { useDeepObjectDiff } from './useDeepObjectDiff';
import { useOnStateChanged } from './useOnStateChanged';
import { useRouter } from './useRouter';
import { useViewContextState } from './useViewContextState';

function checkIfActive(
  router: UIRouterReact,
  stateName: string,
  params: object,
  relative: StateDeclaration,
  exact: boolean
) {
  return exact
    ? router.stateService.is(stateName, params, { relative })
    : router.stateService.includes(stateName, params, { relative });
}

export function useIsActive(stateName: string, params = null, exact = false) {
  const router = useRouter();
  const relative = useViewContextState(router);
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
