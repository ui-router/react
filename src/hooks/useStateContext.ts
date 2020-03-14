/** @packageDocumentation @internalapi @module react_hooks */

import { RegisteredView, StateObject } from '@uirouter/core';
import { useContext } from 'react';
import { ViewIdContext } from '../components';
import { useRouter } from './useRouter';

/** @internalapi Gets information about the state contexts that the current render is happening within */
export function useStateContext(): { portalState: StateObject; contentState?: StateObject } {
  const router = useRouter();
  const viewId = useContext(ViewIdContext);
  if (viewId === undefined) {
    return {
      portalState: router.stateRegistry.root(),
    };
  }

  const view: RegisteredView = router.viewService._pluginapi._registeredUIView(viewId);
  if (!view) {
    throw new Error(`Could not find a registered view matching ${viewId}`);
  }

  const { portalState, contentState } = view;
  return { portalState, contentState };
}
