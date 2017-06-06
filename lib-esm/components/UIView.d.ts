/// <reference types="react" />
import { Component, ValidationMap } from 'react';
import { SFC, ClassType, StatelessComponent, ComponentClass, ClassicComponentClass } from 'react';
import { ActiveUIView, ViewContext, Transition, StateParams } from "@uirouter/core";
import { ReactViewConfig } from "../reactViews";
/** @internalpi */
export interface UIViewAddress {
    context: ViewContext;
    fqn: string;
}
/**
 * Interface for [[InjectedProps.resolves]]
 *
 * This Typescript interface shows what fields are available on the `resolves` field.
 */
export interface UIViewResolves {
    /**
     * Any key/value pair defined by a state's resolve
     *
     * If a state defines any [[ReactStateDeclaration.resolve]]s, they will be found on this object.
     */
    [key: string]: any;
    /**
     * The `StateParams` for the `Transition` that activated the component
     *
     * This is an alias for:
     * ```js
     * let $stateParams = $transition$.params("to");
     * ```
     */
    $stateParams: StateParams;
    /** The `Transition` that activated the component */
    $transition$: Transition;
}
/**
 * Function type for [[UIViewProps.render]]
 *
 * If the `render` function prop is provided, the `UIView` will use it instead of rendering the component by itself.
 * @internalapi
 */
export declare type RenderPropCallback = (Component: StatelessComponent<any> | ComponentClass<any> | ClassicComponentClass<any>, Props: any) => JSX.Element | null;
export interface UIViewInjectedProps {
    transition?: Transition;
    resolves?: UIViewResolves;
    className?: string;
    style?: Object;
}
/** Component Props for `UIView` */
export interface UIViewProps {
    name?: string;
    className?: string;
    style?: Object;
    render?: RenderPropCallback;
}
/** Component State for `UIView` */
export interface UIViewState {
    id?: number;
    loaded?: boolean;
    component?: string | SFC<any> | ClassType<any, any, any> | ComponentClass<any>;
    props?: any;
}
export declare class UIView extends Component<UIViewProps, UIViewState> {
    uiViewData: ActiveUIView;
    uiViewAddress: UIViewAddress;
    deregister: Function;
    componentInstance: any;
    removeHook: Function;
    state: UIViewState;
    static propTypes: ValidationMap<UIViewProps>;
    static childContextTypes: ValidationMap<any>;
    static contextTypes: ValidationMap<any>;
    render(): JSX.Element;
    getChildContext(): {
        parentUIViewAddress: UIViewAddress;
    };
    componentWillMount(): void;
    componentWillUnmount(): void;
    /**
     * View config updated callback
     *
     * This is called by UI-Router when a state was activated, and one of its views targets this `UIView`
     */
    viewConfigUpdated(newConfig: ReactViewConfig): void;
    registerUiCanExitHook(stateName: string): void;
}
