import { StateService } from '@uirouter/core';
import { useEffect, useMemo, useState } from 'react';
import { useDeepObjectDiff } from './useDeepObjectDiff';
import { useOnStateChanged } from './useOnStateChanged';
import { useRouter } from './useRouter';

function checkIfActive(stateService: StateService, stateName: string, params: object, exact: boolean) {
  return exact ? stateService.is(stateName, params) : stateService.includes(stateName, params);
}

export function useIsActive(stateName: string, params = null, exact = false) {
  const { stateService } = useRouter();
  // Don't re-compute initialIsActive on every render
  const initialIsActive = useMemo(() => checkIfActive(stateService, stateName, params, exact), []);
  const [isActive, setIsActive] = useState(initialIsActive);

  const checkIfActiveChanged = () => {
    const newIsActive = checkIfActive(stateService, stateName, params, exact);
    if (newIsActive !== isActive) {
      setIsActive(newIsActive);
    }
  };

  useOnStateChanged(checkIfActiveChanged);
  useEffect(checkIfActiveChanged, [stateService, stateName, useDeepObjectDiff(params), exact]);

  return isActive;
}
