/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import {
  Component,
  ValidationMap,
  createElement,
  cloneElement,
  isValidElement,
  ReactElement,
  SFC,
  ClassType,
  StatelessComponent,
  ComponentClass,
  ClassicComponentClass,
} from 'react';
import * as PropTypes from 'prop-types';

import {
  ActiveUIView,
  ViewContext,
  ViewConfig,
  Transition,
  ResolveContext,
  StateParams,
  applyPairs,
  extend,
} from '@uirouter/core';

import { UIRouterReact } from '../index';
import { ReactViewConfig } from '../reactViews';
import { UIRouterInstanceUndefinedError } from './UIRouter';

/** @internalapi */
let id = 0;

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
export type RenderPropCallback = (
  Component:
    | StatelessComponent<any>
    | ComponentClass<any>
    | ClassicComponentClass<any>,
  Props: any,
) => JSX.Element | null;

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
  component?:
    | string
    | SFC<any>
    | ClassType<any, any, any>
    | ComponentClass<any>;
  props?: any;
}

export const TransitionPropCollisionError = new Error(
  '`transition` cannot be used as resolve token. ' +
    'Please rename your resolve to avoid conflicts with the router transition.',
);

export class UIView extends Component<UIViewProps, UIViewState> {
  // This object contains all the metadata for this UIView
  uiViewData: ActiveUIView;

  // This object contains only the state context which created this <UIView/> component
  // and the UIView's fully qualified name. This object is made available to children via `context`
  uiViewAddress: UIViewAddress;

  // Deregisters the UIView when it is unmounted
  deregister: Function;

  // Bind the rendered component instance in order to call its uiCanExit hook
  componentInstance: any;
  // Removes th Hook when the UIView is unmounted
  removeHook: Function;

  state: UIViewState = {
    loaded: false,
    component: 'div',
    props: {},
  };

  static propTypes: ValidationMap<UIViewProps> = {
    name: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    render: PropTypes.func,
  };

  static childContextTypes: ValidationMap<any> = {
    parentUIViewAddress: PropTypes.object,
  };

  static contextTypes: ValidationMap<any> = {
    router: PropTypes.object,
    parentUIViewAddress: PropTypes.object,
  };

  render() {
    let { children, render } = this.props;
    let { component, props, loaded } = this.state;
    // register reference of child component
    // register new hook right after component has been rendered
    let stateName: string =
      this.uiViewAddress &&
      this.uiViewAddress.context &&
      this.uiViewAddress.context.name;

    // only class components can implement the
    // uiCanExit hook and ref doesn't work on
    // stateless function components
    if (typeof component !== 'string' && !!component.prototype.render) {
      props.ref = c => {
        this.componentInstance = c;
        this.registerUiCanExitHook(stateName);
      };
    }

    let child =
      !loaded && isValidElement(children)
        ? cloneElement(children, props)
        : createElement(component, props);

    // if a render function is passed use that,
    // otherwise render the component normally
    return typeof render !== 'undefined' && loaded
      ? render(component, props)
      : child;
  }

  getChildContext() {
    return {
      parentUIViewAddress: this.uiViewAddress,
    };
  }

  componentWillMount() {
    let router = this.context['router'];
    if (typeof router === 'undefined') {
      throw UIRouterInstanceUndefinedError;
    }

    // Check the context for the parent UIView's fqn and State
    let parent: UIViewAddress = this.context['parentUIViewAddress'];
    // Not found in context, this is a root UIView
    parent = parent || { fqn: '', context: router.stateRegistry.root() };

    let name = this.props.name || '$default';

    this.uiViewData = {
      $type: 'react',
      id: ++id,
      name: name,
      fqn: parent.fqn ? parent.fqn + '.' + name : name,
      creationContext: parent.context,
      configUpdated: this.viewConfigUpdated.bind(this),
      config: undefined,
    } as ActiveUIView;

    this.uiViewAddress = { fqn: this.uiViewData.fqn, context: undefined };

    this.deregister = router.viewService.registerUIView(this.uiViewData);

    this.setState({ id: this.uiViewData.id });
  }

  componentWillUnmount() {
    this.deregister();
  }

  /**
   * View config updated callback
   *
   * This is called by UI-Router when a state was activated, and one of its views targets this `UIView`
   */
  viewConfigUpdated(newConfig: ReactViewConfig) {
    let newComponent =
      newConfig && newConfig.viewDecl && newConfig.viewDecl.component;
    let trans: Transition = undefined,
      resolves = {};

    if (newConfig) {
      let context: ViewContext =
        newConfig.viewDecl && newConfig.viewDecl.$context;
      this.uiViewAddress = { fqn: this.uiViewAddress.fqn, context };

      let ctx = new ResolveContext(newConfig.path);
      trans = ctx.getResolvable(Transition).data;
      let stringTokens: string[] = trans
        .getResolveTokens()
        .filter(x => typeof x === 'string');
      resolves = stringTokens
        .map(token => [token, trans.injector().get(token)])
        .reduce(applyPairs, {});

      if (stringTokens.indexOf('transition') !== -1) {
        throw TransitionPropCollisionError;
      }
    }

    this.uiViewData.config = newConfig;
    let props = { ...resolves, transition: trans };

    // attach any style or className to the rendered component
    // specified on the UIView itself
    let styleProps: {
      className?: string;
      style?: Object;
    } = {};
    if (this.props.className) styleProps.className = this.props.className;
    if (this.props.className) styleProps.style = this.props.style;

    this.setState({
      component: newComponent || 'div',
      props: newComponent ? extend(props, styleProps) : styleProps,
      loaded: newComponent ? true : false,
    });
  }

  registerUiCanExitHook(stateName: string) {
    typeof this.removeHook === 'function' && this.removeHook();
    let criteria = { exiting: stateName };
    let callback =
      this.componentInstance &&
      typeof this.componentInstance.uiCanExit === 'function' &&
      this.componentInstance.uiCanExit;
    if (stateName && callback) {
      let transitions = this.context['router'].transitionService;
      this.removeHook = transitions.onBefore(criteria, callback, {});
    }
  }
}
