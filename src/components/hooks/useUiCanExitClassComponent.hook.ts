import { UIRouter } from '@uirouter/core';
import { useMemo, useRef } from 'react';

/**
 * If a class component is being rendered, wire up its uiCanExit method
 * Return a { ref: Ref<ClassComponentInstance> } if passed a component class
 * Return an empty object {} if passed anything else
 * The returned object should be spread as props onto the child component
 * @internal
 */
export function useUiCanExitClassComponentHook(router: UIRouter, stateName: string, maybeComponentClass: any) {
  // Use refs and run the callback outside of any render pass
  const componentInstanceRef = useRef<any>();
  const deregisterRef = useRef<Function>(() => undefined);

  function callbackRef(componentInstance) {
    // Use refs
    const previous = componentInstanceRef.current;
    const deregisterPreviousTransitionHook = deregisterRef.current;

    if (previous !== componentInstance) {
      componentInstanceRef.current = componentInstance;
      deregisterPreviousTransitionHook();

      const uiCanExit = componentInstance?.uiCanExit;
      if (uiCanExit) {
        const boundCallback = uiCanExit.bind(componentInstance);
        deregisterRef.current = router.transitionService.onBefore({ exiting: stateName }, boundCallback);
      } else {
        deregisterRef.current = () => undefined;
      }
    }
  }

  return useMemo(() => {
    const isComponentClass = maybeComponentClass?.prototype?.render || maybeComponentClass?.render;
    return isComponentClass ? { ref: callbackRef } : undefined;
  }, [maybeComponentClass]);
}
