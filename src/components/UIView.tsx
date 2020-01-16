/** @packageDocumentation @reactapi @module components */
import * as React from 'react';
import * as PropTypes from 'prop-types';
import {
  ClassType,
  ClassicComponentClass,
  Component,
  ComponentClass,
  createContext,
  SFC,
  ReactNode,
  StatelessComponent,
  ValidationMap,
  Validator,
  cloneElement,
  createElement,
  isValidElement,
} from 'react';

import { ActiveUIView, ViewContext, Transition, ResolveContext, StateParams, applyPairs } from '@uirouter/core';

import { UIRouterContext } from './UIRouter';
import { UIRouterReact } from '../core';
import { ReactViewConfig } from '../reactViews';
import { UIRouterInstanceUndefinedError } from '../hooks/useRouter';

/** @internalapi */
let id = 0;

/** @internalapi */
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
  Component: StatelessComponent<any> | ComponentClass<any> | ClassicComponentClass<any>,
  Props: any
) => JSX.Element | null;

export interface UIViewInjectedProps {
  transition?: Transition;
  resolves?: UIViewResolves;
  className?: string;
  style?: Object;
}

/** Component Props for `UIView` */
export interface UIViewProps {
  children?: ReactNode;
  router?: UIRouterReact;
  parentUIView?: UIViewAddress;
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

export const TransitionPropCollisionError =
  '`transition` cannot be used as resolve token. ' +
  'Please rename your resolve to avoid conflicts with the router transition.';

/** @internalapi */
export const UIViewContext = createContext<UIViewAddress>(undefined);

class View extends Component<UIViewProps, UIViewState> {
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
    router: PropTypes.object.isRequired as Validator<UIRouterReact>,
    parentUIView: PropTypes.object as Validator<UIViewAddress>,
    name: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    render: PropTypes.func,
  };

  render() {
    let { children, render } = this.props;
    let { component, props, loaded } = this.state;
    // register reference of child component
    // register new hook right after component has been rendered
    let stateName: string = this.uiViewAddress && this.uiViewAddress.context && this.uiViewAddress.context.name;

    // only class components can implement the
    // uiCanExit hook and ref doesn't work on
    // stateless function components
    if (
      typeof component !== 'string' &&
      (!!component.render || (component.prototype && !!component.prototype.render))
    ) {
      props.ref = c => {
        this.componentInstance = c;
        this.registerUiCanExitHook(stateName);
      };
    }

    // attach any style or className to the rendered component
    // specified on the UIView itself
    const { className, style } = this.props;
    const styleProps = { className, style };
    const childProps = { ...props, ...styleProps };

    let child =
      !loaded && isValidElement(children) ? cloneElement(children, childProps) : createElement(component, childProps);

    // if a render function is passed use that,
    // otherwise render the component normally
    const ChildOrRenderFunction = typeof render !== 'undefined' && loaded ? render(component, childProps) : child;
    return <UIViewContext.Provider value={this.uiViewAddress}>{ChildOrRenderFunction}</UIViewContext.Provider>;
  }

  componentDidMount() {
    const router = this.props.router;
    if (typeof router === 'undefined') {
      throw new Error(UIRouterInstanceUndefinedError);
    }

    // Check the context for the parent UIView's fqn and State
    let parent: UIViewAddress = this.props.parentUIView;
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
    if (this.deregister) {
      this.deregister();
    }
  }

  /**
   * View config updated callback
   *
   * This is called by UI-Router during ViewService.sync().
   * The `newConfig` parameter will contain view configuration (component, etc) when a
   * state is activated and one of its views targets this `UIView`.
   */
  viewConfigUpdated(newConfig: ReactViewConfig) {
    if (newConfig === this.uiViewData.config) {
      return;
    }

    let trans: Transition;
    let resolves = {};

    if (newConfig) {
      let viewContext: ViewContext = newConfig.viewDecl && newConfig.viewDecl.$context;
      this.uiViewAddress = {
        fqn: this.uiViewAddress.fqn,
        context: viewContext,
      };

      let resolveContext = new ResolveContext(newConfig.path);
      let injector = resolveContext.injector();

      let stringTokens: string[] = resolveContext.getTokens().filter(x => typeof x === 'string');
      if (stringTokens.indexOf('transition') !== -1) {
        throw new Error(TransitionPropCollisionError);
      }

      trans = injector.get(Transition);
      resolves = stringTokens.map(token => [token, injector.get(token)]).reduce(applyPairs, {});
    }

    this.uiViewData.config = newConfig;
    const key = Date.now();
    let props = { ...resolves, transition: trans, key };

    let newComponent = newConfig && newConfig.viewDecl && newConfig.viewDecl.component;
    this.setState({
      component: newComponent || 'div',
      props: newComponent ? props : {},
      loaded: !!newComponent,
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
      let transitions = this.props.router.transitionService;
      this.removeHook = transitions.onBefore(criteria, callback, {});
    }
  }
}

View.propTypes = {
  router: PropTypes.object.isRequired as Validator<UIRouterReact>,
  parentUIView: PropTypes.object as Validator<UIViewAddress>,
  name: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  render: PropTypes.func,
} as ValidationMap<UIViewProps>;

export class UIView extends Component<UIViewProps, any> {
  static displayName = 'UIView';
  static __internalViewComponent: ComponentClass<UIViewProps> = View;

  render() {
    return (
      <UIRouterContext.Consumer>
        {router => (
          <UIViewContext.Consumer>
            {parentUIView => <View {...this.props} router={router} parentUIView={parentUIView} />}
          </UIViewContext.Consumer>
        )}
      </UIRouterContext.Consumer>
    );
  }
}
