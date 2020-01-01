import { useContext } from 'react';
import { UIRouterContext, UIRouterInstanceUndefinedError } from '../UIRouter';

/** Returns the UIRouter object from React Context */
export function useUIRouter() {
  const router = useContext(UIRouterContext);
  if (!router) {
    throw new Error(UIRouterInstanceUndefinedError);
  }
  return router;
}
