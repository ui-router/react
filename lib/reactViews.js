"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @reactapi
 * @module react
 */ /** */
var core_1 = require("@uirouter/core");
/**
 * This is a [[StateBuilder.builder]] function for react `views`.
 *
 * When the [[StateBuilder]] builds a [[State]] object from a raw [[StateDeclaration]], this builder
 * handles the `views` property with logic specific to ui-router-react.
 *
 * If no `views: {}` property exists on the [[StateDeclaration]], then it creates the `views` object and
 * applies the state-level configuration to a view named `$default`.
 *
 * @internalapi
 */
function reactViewsBuilder(state) {
    var views = {}, viewsDefinitionObject;
    if (!state.views) {
        viewsDefinitionObject = { "$default": core_1.pick(state, ["component"]) };
    }
    else {
        viewsDefinitionObject = core_1.map(state.views, function (val, key) {
            if (val.component)
                return val;
            return { component: val };
        });
    }
    core_1.forEach(viewsDefinitionObject, function (config, name) {
        name = name || "$default"; // Account for views: { "": { template... } }
        if (Object.keys(config).length == 0)
            return;
        config.$type = "react";
        config.$context = state;
        config.$name = name;
        var normalized = core_1.ViewService.normalizeUIViewTarget(config.$context, config.$name);
        config.$uiViewName = normalized.uiViewName;
        config.$uiViewContextAnchor = normalized.uiViewContextAnchor;
        views[name] = config;
    });
    return views;
}
exports.reactViewsBuilder = reactViewsBuilder;
/** @internalapi */
var id = 0;
/** @internalapi */
var ReactViewConfig = (function () {
    function ReactViewConfig(path, viewDecl) {
        this.path = path;
        this.viewDecl = viewDecl;
        this.loaded = true;
        this.$id = id++;
    }
    ReactViewConfig.prototype.load = function () {
        return core_1.services.$q.when(this);
    };
    return ReactViewConfig;
}());
exports.ReactViewConfig = ReactViewConfig;
//# sourceMappingURL=reactViews.js.map