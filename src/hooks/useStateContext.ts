/** @packageDocumentation @internalapi @module react_hooks */

import { StateDeclaration, StateObject } from '@uirouter/core';
import { useContext } from 'react';
import { ViewIdContext } from '../components';
import { useRouter } from './useRouter';

/** @internalapi Gets information about the state contexts that the current render is happening within */
export function useStateContext(): { portalState: StateDeclaration; contentState?: StateDeclaration } {
  const router = useRouter();
  const viewId = useContext(ViewIdContext);
  if (viewId === undefined) {
    return {
      portalState: router.stateRegistry.root().self,
    };
  }

  const view = router.viewService._pluginapi._registeredUIView(viewId);
  if (!view) {
    throw new Error(`Could not find a registered view matching ${viewId}`);
  }

  const { portalState, contentState } = view;
  return { portalState, contentState };
}
