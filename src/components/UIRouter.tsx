import * as React from 'react';
import {Component, PropTypes, Children} from 'react';
import {UIRouterReact, ReactStateDeclaration} from '../index';
import {UIRouterPlugin} from 'ui-router-core';
import {servicesPlugin} from 'ui-router-core/lib/vanilla';

export interface IProps {
  plugins?: any[]; // should fix type
  states?: ReactStateDeclaration[];
  config?: (router: UIRouterReact) => void;
  router?: UIRouterReact;
}

export interface IState {
  id?: number;
  loaded?: boolean;
  component?: string;
  props?: any;
}

const InstanceOrPluginsMissingError =  new Error(`Router instance or plugins missing.
You must either provide a location plugin via the plugins prop:

<UIRouter plugins={[pushStateLocationPlugin]}>
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

export class UIRouter extends Component<IProps, IState> {
  static propTypes = {
    plugins: PropTypes.arrayOf(PropTypes.func),
    states: PropTypes.arrayOf(PropTypes.object),
    config: PropTypes.func,
    children: PropTypes.element.isRequired,
    router: PropTypes.object,
  }

  static childContextTypes = {
    router: PropTypes.object.isRequired
  }

  router: UIRouterReact;

  constructor (props, context) {
    super(props, context);
    // check if a router instance is provided
    if (props.router) {
      this.router = props.router;
    } else if (props.plugins) {
      this.router = new UIRouterReact();
      this.router.plugin(servicesPlugin);
      props.plugins.forEach(plugin => this.router.plugin(plugin));
      props.states.forEach(state => this.router.stateRegistry.register(state));
      if (props.config) props.config(this.router);
    } else {
      throw InstanceOrPluginsMissingError;
    }
    this.router.start();
  }

  getChildContext() {
    return { router: this.router }
  }

  render() {
    return Children.only(this.props.children);
  }
}