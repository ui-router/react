/**
 * # React Specific API
 *
 *
 * UI-Router for React relies heavily on [`ui-router-core`](http://github.com/ui-router/core).
 * The following APIs are extensions to the core ui-router APIs, specific to `ui-router-react`.
 *
 * @preferred
 * @reactapi
 * @module react
 */ /** */
export {trace} from "ui-router-core";
export {ReactStateDeclaration} from "./interface";

export {UIView, InjectedProps, Resolves} from "./components/UIView";
export {UISref} from "./components/UISref";
export {UISrefActive} from "./components/UISrefActive";
export {UIRouter} from "./components/UIRouter";

export {UIRouterReact} from "./core";

export {
  hashLocationPlugin,
  pushStateLocationPlugin,
  memoryLocationPlugin,
  servicesPlugin
} from 'ui-router-core';