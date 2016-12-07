import * as React from 'react';
import {Component, PropTypes, Children} from 'react';
import {UIRouterReact, ReactStateDeclaration} from '../index';
import {HistoryImplementation} from "../history/interface";

export interface IProps {
  history?: HistoryImplementation;
  states?: ReactStateDeclaration[];
  config?: (router: UIRouterReact) => void;
}

export interface IState {
  id?: number;
  loaded?: boolean;
  component?: string;
  props?: any;
}

export class UIRouter extends Component<IProps, IState> {
  static propTypes = {
    history: PropTypes.object.isRequired,
    states: PropTypes.arrayOf(PropTypes.object).isRequired,
    config: PropTypes.func,
    children: PropTypes.element.isRequired
  }

  static childContextTypes = {
    router: PropTypes.object.isRequired
  }

  router: UIRouterReact;

  constructor (props, context) {
    super(props, context);
    this.router = new UIRouterReact(props.history);
    props.states.forEach(state => {
      this.router.stateRegistry.register(state);
    });
    if (props.config) {
      props.config(this.router)
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