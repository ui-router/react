/**
 * @reactapi
 * @module react
 */ /** */
import { UIRouter } from '@uirouter/core';
/**
 * The main UIRouter object
 *
 * This is the main UIRouter object.
 * There should be one instance of this object per running application.
 *
 * This class has references to all the other UIRouter services.
 */
export declare class UIRouterReact extends UIRouter {
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
    constructor();
    /**
     * Starts the router
     *
     * Calling this method enables listening to the URL for changes.
     * It also performs the initial state synchronization from the URL.
     */
    start(): void;
}
