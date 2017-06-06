/**
 * @reactapi
 * @module react
 */ /** */
import { services, forEach, map, pick, ViewService } from "@uirouter/core";
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
export function reactViewsBuilder(state) {
    var views = {}, viewsDefinitionObject;
    if (!state.views) {
        viewsDefinitionObject = { "$default": pick(state, ["component"]) };
    }
    else {
        viewsDefinitionObject = map(state.views, function (val, key) {
            if (val.component)
                return val;
            return { component: val };
        });
    }
    forEach(viewsDefinitionObject, function (config, name) {
        name = name || "$default"; // Account for views: { "": { template... } }
        if (Object.keys(config).length == 0)
            return;
        config.$type = "react";
        config.$context = state;
        config.$name = name;
        var normalized = ViewService.normalizeUIViewTarget(config.$context, config.$name);
        config.$uiViewName = normalized.uiViewName;
        config.$uiViewContextAnchor = normalized.uiViewContextAnchor;
        views[name] = config;
    });
    return views;
}
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
        return services.$q.when(this);
    };
    return ReactViewConfig;
}());
export { ReactViewConfig };
//# sourceMappingURL=reactViews.js.map