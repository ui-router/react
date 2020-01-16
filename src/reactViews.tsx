/** @packageDocumentation  @reactapi @module react */
import { services, forEach, map, pick, PathNode, ViewConfig, ViewService, StateObject } from '@uirouter/core';
import { ReactViewDeclaration } from './interface';

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
export function reactViewsBuilder(state: StateObject) {
  let views = {},
    viewsDefinitionObject;
  if (!state.views) {
    viewsDefinitionObject = { $default: pick(state, ['component']) };
  } else {
    viewsDefinitionObject = map(state.views, (val: any, key) => {
      if (val.component) return val;
      return { component: val };
    });
  }

  forEach(viewsDefinitionObject, function(config, name) {
    name = name || '$default'; // Account for views: { "": { template... } }
    if (Object.keys(config).length == 0) return;

    config.$type = 'react';
    config.$context = state;
    config.$name = name;

    let normalized = ViewService.normalizeUIViewTarget(config.$context, config.$name);
    config.$uiViewName = normalized.uiViewName;
    config.$uiViewContextAnchor = normalized.uiViewContextAnchor;

    views[name] = config;
  });
  return views;
}

/** @internalapi */
let id = 0;

/** @internalapi */
export class ReactViewConfig implements ViewConfig {
  loaded: boolean = true;
  $id: number = id++;

  constructor(public path: [PathNode], public viewDecl: ReactViewDeclaration) {}

  load() {
    return services.$q.when(this);
  }
}
