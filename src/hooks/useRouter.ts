import { useContext } from 'react';
import { UIRouterReact } from '../core';
import { UIRouterContext } from '../components/UIRouter';

/** @hidden */
export const UIRouterInstanceUndefinedError = `UIRouter instance is undefined. Did you forget to include the <UIRouter> as root component?`;

/** Returns the UIRouter object from React Context */
export function useRouter(): UIRouterReact {
  const router = useContext(UIRouterContext);
  if (!router) {
    throw new Error(UIRouterInstanceUndefinedError);
  }
  return router;
}
