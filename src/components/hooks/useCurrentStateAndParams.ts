import { StateParams } from '@uirouter/core';
import { useEffect, useState } from 'react';
import { useUIRouter } from './useUIRouter';

export function useCurrentStateAndParams() {
  const uiRouter = useUIRouter();
  const { globals } = uiRouter;
  const [stateData, setStateData] = useState({ state: globals.current, params: globals.params });

  useEffect(() => {
    const deregister = uiRouter.transitionService.onSuccess({}, transition => {
      const state = transition.to();
      const params = transition.params('to') as StateParams;
      setStateData({ state, params });
    });
    return () => deregister();
  }, [uiRouter]);

  return stateData;
}
