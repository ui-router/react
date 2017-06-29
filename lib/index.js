"use strict";
/**
 * # React Specific API
 *
 *
 * UI-Router for React relies heavily on [`@uirouter/core`](http://github.com/ui-router/core).
 * The following APIs are extensions to the core ui-router APIs, specific to `ui-router-react`.
 *
 * @preferred
 * @reactapi
 * @module react
 */ /** */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("@uirouter/core"));
__export(require("./reactViews"));
__export(require("./components/components"));
var core_1 = require("./core");
exports.UIRouterReact = core_1.UIRouterReact;
var components_1 = require("./components/components");
exports.UIRouter = components_1.UIRouter;
//# sourceMappingURL=index.js.map