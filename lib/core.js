"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @reactapi
 * @module react
 */ /** */
var core_1 = require("@uirouter/core");
var reactViews_1 = require("./reactViews");
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
var viewConfigFactory = function (node, config) {
    return new reactViews_1.ReactViewConfig(node, config);
};
/**
 * The main UIRouter object
 *
 * This is the main UIRouter object.
 * There should be one instance of this object per running application.
 *
 * This class has references to all the other UIRouter services.
 */
var UIRouterReact = (function (_super) {
    __extends(UIRouterReact, _super);
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
    function UIRouterReact() {
        var _this = _super.call(this) || this;
        _this.viewService._pluginapi._viewConfigFactory('react', viewConfigFactory);
        _this.stateRegistry.decorator("views", reactViews_1.reactViewsBuilder);
        return _this;
    }
    /**
     * Starts the router
     *
     * Calling this method enables listening to the URL for changes.
     * It also performs the initial state synchronization from the URL.
     */
    UIRouterReact.prototype.start = function () {
        this.urlMatcherFactory.$get();
        this.urlRouter.listen();
        this.urlRouter.sync();
    };
    return UIRouterReact;
}(core_1.UIRouter));
exports.UIRouterReact = UIRouterReact;
//# sourceMappingURL=core.js.map