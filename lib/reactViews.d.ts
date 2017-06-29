/**
 * @reactapi
 * @module react
 */ /** */
import { PathNode, ViewConfig, StateObject } from "@uirouter/core";
import { ReactViewDeclaration } from "./interface";
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
export declare function reactViewsBuilder(state: StateObject): {};
/** @internalapi */
export declare class ReactViewConfig implements ViewConfig {
    path: [PathNode];
    viewDecl: ReactViewDeclaration;
    loaded: boolean;
    $id: number;
    constructor(path: [PathNode], viewDecl: ReactViewDeclaration);
    load(): Promise<this>;
}
