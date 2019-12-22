import { useContext } from 'react';
import { UIRouterContext } from '../UIRouter';

/** Returns the UIRouter object from React Context */
export function useUIRouter() {
  const router = useContext(UIRouterContext);
  if (!router) {
    throw new Error(`UIRouter instance is undefined. Did you forget to include the <UIRouter> as root component?`);
  }
  return router;
}
