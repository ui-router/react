import {Component, PropTypes, ValidationMap, createElement, cloneElement, isValidElement} from 'react';
import {ActiveUIView, ViewContext, ViewConfig, Transition, ResolveContext, applyPairs, extend} from "ui-router-core";
import UIRouterReact from "../index";
import {ReactViewConfig} from "../ui-router-react";

let id = 0;

export interface UIViewAddress {
  context: ViewContext;
  fqn: string;
}

export interface IProps {
  name?: string;
  className?: string;
  style?: Object;
}

export interface IState {
  id?: number;
  loaded?: boolean;
  component?: string;
  props?: any;
}

export class UIView extends Component<IProps, IState> {
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

  state: IState = {
    loaded: false,
    component: 'div',
    props: {}
  }

  static propTypes: ValidationMap<IProps> = {
    name: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object
  }

  static childContextTypes: ValidationMap<any> = {
    parentUIViewAddress: PropTypes.object
  }

  static contextTypes: ValidationMap<any> = {
    parentUIViewAddress: PropTypes.object
  }

  render() {
    let { children } = this.props;
    let { component, props, loaded } = this.state;
    // register reference of child component
    // register new hook right after component has been rendered
    let stateName: string = this.uiViewAddress && this.uiViewAddress.context && this.uiViewAddress.context.name;
    props.ref = c => {
      this.componentInstance = c;
      this.registerUiCanExitHook(stateName);
    };
    
    let child = !loaded && isValidElement(children)
      ? cloneElement(children, props)
      : createElement(component, props);
    return child;
  }

  getChildContext() {
    return {
      parentUIViewAddress: this.uiViewAddress
    }
  }

  componentWillMount() {
    let router = UIRouterReact.instance;

    // Check the context for the parent UIView's fqn and State
    let parent: UIViewAddress = this.context['parentUIViewAddress'];
    // Not found in context, this is a root UIView
    parent = parent || { fqn: "", context: router.stateRegistry.root() };

    let name = this.props.name || "$default";

    this.uiViewData = {
      $type: 'react',
      id: ++id,
      name: name,
      fqn: parent.fqn ? parent.fqn + "." + name : name,
      creationContext: parent.context,
      configUpdated: this.viewConfigUpdated.bind(this),
      config: undefined
    } as ActiveUIView;

    this.uiViewAddress = { fqn: this.uiViewData.fqn, context: undefined };

    this.deregister = router.viewService.registerUIView(this.uiViewData);

    this.setState({ id: this.uiViewData.id });
  }

  componentWillUnmount() {
    this.deregister();
  }

  viewConfigUpdated(newConfig: ReactViewConfig) {
    let newComponent = newConfig && newConfig.viewDecl && newConfig.viewDecl.component;
    let trans: Transition = undefined, resolves = {};

    if (newConfig) {
      let context: ViewContext = newConfig.viewDecl && newConfig.viewDecl.$context;
      this.uiViewAddress = { fqn: this.uiViewAddress.fqn, context };

      let ctx = new ResolveContext(newConfig.path);
      trans = ctx.getResolvable(Transition).data;
      let stringTokens = trans.getResolveTokens().filter(x => typeof x === 'string');
      resolves = stringTokens.map(token => [token, trans.getResolveValue(token)]).reduce(applyPairs, {});
    }

    this.uiViewData.config = newConfig;
    let props = {resolves, transition: trans};

    // attach any style or className to the rendered component
    // specified on the UIView itself
    let styleProps: {
      className?:string,
      style?: Object
    } = {}
    if (this.props.className) styleProps.className = this.props.className;
    if (this.props.className) styleProps.style = this.props.style;

    this.setState({
      component: newComponent || 'div',
      props: newComponent ? extend(props, styleProps) : styleProps,
      loaded: newComponent ? true : false 
    });
  }

  registerUiCanExitHook (stateName: string) {
    typeof this.removeHook === 'function' && this.removeHook();
    let criteria = { exiting: stateName };
    let callback = this.componentInstance && typeof this.componentInstance.uiCanExit === 'function' && this.componentInstance.uiCanExit;
    if (stateName && callback) {
      let transitions = UIRouterReact.instance.transitionService;
      this.removeHook = transitions.onBefore(criteria, callback, {});
    }
  }
}