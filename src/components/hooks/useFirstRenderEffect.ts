import { useRef, useEffect } from 'react';
import { isFunction } from '@uirouter/core';

type EffectCallback = () => void | (() => void);

/**
 * React hook for running an effect as soon as the first time the Component renders.
 * This is the closest thing to a constructor/willMount method.
 *
 * > NB: **You cannot used hooks inside the effect** as it runs conditionally only the first time, so it would break the hooks rules.
 * @hidden
 */
export function useFirstRenderEffect(effect: EffectCallback) {
  const hasRun = useRef<boolean>(false);
  let cleanup;

  if (hasRun.current === false) {
    cleanup = effect();
    hasRun.current = true;
  }

  useEffect(() => {
    return () => {
      if (isFunction(cleanup)) cleanup();
    };
  }, []);
}
