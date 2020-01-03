import { useMemo } from 'react';
import { useCurrentStateAndParams } from './useCurrentStateAndParams';
import { useRouter } from './useRouter';

export function useIsActive(stateName: string, params = null, exact = false) {
  const { stateService } = useRouter();
  const currentState = useCurrentStateAndParams();
  const isActive = useMemo(
    () => (exact ? stateService.is(stateName, params) : stateService.includes(stateName, params)),
    [exact, stateName, params, currentState]
  );

  return isActive;
}
