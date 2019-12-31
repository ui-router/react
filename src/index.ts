/**
 * # React Specific API
 *
 *
 * UI-Router for React relies heavily on [`@uirouter/core`](http://github.com/ui-router/core).
 * The following APIs are extensions to the core ui-router APIs, specific to `@uirouter/react`.
 *
 * @preferred
 * @reactapi
 * @module react
 */ /** */

export * from '@uirouter/core';
export * from './interface';
export * from './reactViews';
export * from './components/components';

export { UIRouterReact, StartMethodCalledMoreThanOnceError } from './core';
export { UIRouter } from './components/components';
