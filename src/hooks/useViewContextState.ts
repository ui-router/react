/** @packageDocumentation @internalapi @module react_hooks */

import { StateDeclaration } from '@uirouter/core';
import { useContext, useMemo } from 'react';
import { UIViewContext } from '../components';
import { UIRouterReact } from '../core';

/** Gets the StateDeclaration that this sref was created in.  Used to resolve relative refs. */
export function useViewContextState(router: UIRouterReact): StateDeclaration {
  const parentUIViewAddress = useContext(UIViewContext);
  return useMemo(() => {
    return parentUIViewAddress ? parentUIViewAddress.context : router.stateRegistry.root();
  }, [parentUIViewAddress, router]);
}
