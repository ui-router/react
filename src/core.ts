/**
 * @reactapi
 * @module react
 */ /** */
import {UIRouter, PathNode, services} from 'ui-router-core';
import {ReactViewDeclaration, ReactStateDeclaration} from "./interface"
import {ReactViewConfig, reactViewsBuilder} from "./reactViews";

/**
 * React View Config Factory
 *
 * Given a path and a [[ReactViewDeclaration]]
 * (the view declaration object found on the state declaration),
 * returns a [[ReactViewConfig]]
 *
 * The ReactViewConfig is an instance of a view,
 * which will be provided to the matching `UIView` Component's
 * [[UIView.viewConfigUpdated]] function.
 *
 * @internalapi
 */
let viewConfigFactory = (node: [PathNode], config: ReactViewDeclaration) =>
  new ReactViewConfig(node, config);

/**
 * The main UIRouter object
 *
 * This is the main UIRouter object.
 * There should be one instance of this object per running application.
 *
 * This class has references to all the other UIRouter services.
 */
export class UIRouterReact extends UIRouter {
  /**
   * Creates a new UIRouter instance
   *
   * This can be used to manually bootstrap the router.
   *
   * #### Example:
   * ```js
   * import { UIRouterReact } from "ui-router-ng2";
   * let routerInstance = new UIRouterReact();
   * routerInstance.start();
   * ```
   */
  constructor() {
    super();
    this.viewService._pluginapi._viewConfigFactory('react', viewConfigFactory);
    this.stateRegistry.decorator("views", reactViewsBuilder);
  }

  /**
   * Starts the router
   *
   * Calling this method enables listening to the URL for changes.
   * It also performs the initial state synchronization from the URL.
   */
  start(): void {
    this.urlMatcherFactory.$get();
    this.urlRouter.listen();
    this.urlRouter.sync();
  }
}