import { useEffect, useMemo, useState } from 'react';
import { StateService } from '@uirouter/core';
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
  // can't add 'params' to the DependencyList because it will be a new reference every time... hmmm...
  useEffect(checkIfActiveChanged, [stateService, stateName, exact]);

  return isActive;
}
