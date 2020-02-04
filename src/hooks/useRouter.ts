/** @packageDocumentation @reactapi @module react_hooks */

import { useContext } from 'react';
import { UIRouter } from '@uirouter/core';
import { UIRouterContext } from '../components/UIRouter';

/** @hidden */
export const UIRouterInstanceUndefinedError = `UIRouter instance is undefined. Did you forget to include the <UIRouter> as root component?`;

/**
 * A hook that returns the UIRouter instance
 *
 * Example:
 * ```jsx
 * const FormSubmit() {
 *   const router = useRouter();
 *   const form = useContext(FormFromContext);
 *   function submit() {
 *     validateForm(form)
 *       .then(submitForm)
 *       .then(() => router.stateService.go('home'));
 *   }
 *
 *   return <button onClick={submit}>Submit form</button>;
 * }
 * ```
 */
export function useRouter(): UIRouter {
  const router = useContext(UIRouterContext);
  if (!router) {
    throw new Error(UIRouterInstanceUndefinedError);
  }
  return router;
}
