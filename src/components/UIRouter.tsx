/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import { Component, Children } from 'react';
import * as PropTypes from 'prop-types';

import { UIRouterPlugin, servicesPlugin } from '@uirouter/core';

import { UIRouterReact, ReactStateDeclaration } from '../index';

export const {
  /** @internalapi */
  Provider: UIRouterProvider,
  /**
   * <UIRouterConsumer> component lets you access the UIRouter instance
   * anywhere in the component tree, by simply wrapping your component and
   * using the function-as-child pattern to pass the instance via props.
   *
   * #### Example:
   * ```jsx
   * <UIRouterConsumer>
   *  {router => <MyComponent router={router} />}
   * </UIRouterConsumer>
   * ```
   */
  Consumer: UIRouterConsumer,
} = React.createContext();

export interface UIRouterProps {
  plugins?: any[]; // should fix type
  states?: ReactStateDeclaration[];
  config?: (router: UIRouterReact) => void;
  router?: UIRouterReact;
}

export interface UIRouterState {
  id?: number;
  loaded?: boolean;
  component?: string;
  props?: any;
}

/** @hidden */
export const InstanceOrPluginsMissingError = new Error(`Router instance or plugins missing.
You must either provide a location plugin via the plugins prop:

<UIRouter plugins={[pushStateLocationPlugin]} states={[···]}>
  <UIView />
</UIRouter>

or initialize the router yourself and pass the instance via props:

const router = new UIRouterReact();
router.plugin(pushStateLocationPlugin);
···
<UIRouter router={router}>
  <UIView />
</UIRouter>
`);

/** @hidden */
export const UIRouterInstanceUndefinedError = new Error(
  `UIRouter instance is undefined. Did you forget to include the <UIRouter> as root component?`,
);

export class UIRouter extends Component<UIRouterProps, UIRouterState> {
  static propTypes = {
    plugins: PropTypes.arrayOf(PropTypes.func),
    states: PropTypes.arrayOf(PropTypes.object),
    config: PropTypes.func,
    children: PropTypes.element.isRequired,
    router: PropTypes.object,
  };

  router: UIRouterReact;

  constructor(props, context) {
    super(props, context);
    // check if a router instance is provided
    if (props.router) {
      this.router = props.router;
    } else if (props.plugins) {
      this.router = new UIRouterReact();
      this.router.plugin(servicesPlugin);
      props.plugins.forEach(plugin => this.router.plugin(plugin));
      if (props.config) props.config(this.router);
      (props.states || []).forEach(state => this.router.stateRegistry.register(state));
    } else {
      throw InstanceOrPluginsMissingError;
    }
    this.router.start();
  }

  render() {
    return <UIRouterProvider value={this.router}>{this.props.children}</UIRouterProvider>;
  }
}
