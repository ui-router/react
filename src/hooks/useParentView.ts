/** @packageDocumentation @internalapi @module react_hooks */

import { useContext, useMemo } from 'react';
import { UIViewAddress, UIViewContext } from '../components';
import { useRouter } from './useRouter';

/** @internalapi Gets the parent UIViewAddress from context, or the root UIViewAddress */
export function useParentView(): UIViewAddress {
  const router = useRouter();
  const parentUIViewContext: UIViewAddress = useContext(UIViewContext);
  return useMemo(() => {
    return parentUIViewContext ? parentUIViewContext : { fqn: '', context: router.stateRegistry.root() };
  }, [parentUIViewContext, router]);
}
