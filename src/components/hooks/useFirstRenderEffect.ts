import { useRef, useEffect } from 'react';
import { isFunction } from '@uirouter/core';

type EffectCleanup = void | (() => void);
type EffectCallback = () => EffectCleanup;

/**
 * React hook for running an effect as soon as the first time the Component renders.
 * This is the closest thing to a constructor/willMount method.
 *
 * > NB: **You cannot used hooks inside the effect** as it runs conditionally only the first time, so it would break the hooks rules.
 * @hidden
 */
export function useFirstRenderEffect(effect: EffectCallback) {
  const hasRun = useRef<boolean>(false);
  const cleanup = useRef<EffectCleanup>(null);

  if (hasRun.current === false) {
    cleanup.current = effect();
    hasRun.current = true;
  }

  useEffect(() => {
    return () => {
      if (isFunction(cleanup.current)) cleanup.current();
    };
  }, []);
}
