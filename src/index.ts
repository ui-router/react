/**
 * # React Specific API
 *
 * UI-Router for React relies heavily on [`@uirouter/core`](http://github.com/ui-router/core).
 * The following APIs are extensions to the core ui-router APIs, specific to `@uirouter/react`.
 *
 * @packageDocumentation @preferred @reactapi @module react
 */

export * from '@uirouter/core';
export * from './interface';
export * from './reactViews';
export * from './components';
export * from './hooks';

export { UIRouterReact, StartMethodCalledMoreThanOnceError } from './core';
export { UIRouter } from './components';
