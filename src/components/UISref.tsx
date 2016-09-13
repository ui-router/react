import * as React from 'react';
import {Component, PropTypes, createElement, cloneElement, isValidElement, ValidationMap} from 'react';
import * as classNames from 'classnames';
import UIRouterReact from '../index';
import {extend, TransitionOptions} from 'ui-router-core';
import {UIViewAddress} from "./UIView";

export interface IProps {
  children?: any;
  to: string;
  params?: { [key: string]: any };
  options?: TransitionOptions;
  className?: string;
}
export class UISref extends Component<IProps,any> {
  // deregister function for parent UISrefActive
  deregister: Function;
  static propTypes = {
    children: PropTypes.element.isRequired,
    to: PropTypes.string.isRequired,
    params: PropTypes.object,
    options: PropTypes.object,
    className: PropTypes.string
  }

  static contextTypes: ValidationMap<any> = {
    parentUIViewAddress: PropTypes.object,
    parentUiSrefActiveAddStateInfo: PropTypes.func
  }

  componentWillMount () {
    const addStateInfo = this.context['parentUiSrefActiveAddStateInfo'];
    this.deregister = typeof addStateInfo === 'function'
      ? addStateInfo(this.props.to, this.props.params)
      : () => {};
  }

  componentWillUnmount () {
    this.deregister();
  }

  getOptions = () => {
    let parent: UIViewAddress = this.context['parentUIViewAddress'];
    let parentContext = parent && parent.context || UIRouterReact.instance.stateRegistry.root();
    let defOpts = { relative: parentContext, inherit: true };
    return extend(defOpts, this.props.options || {});
  }

  handleClick = (e) => {
    if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      let params = this.props.params || {};
      let to = this.props.to;
      let options = this.getOptions();
      UIRouterReact.instance.stateService.go(to, params, options);
    }
  }

  render () {
    let params = this.props.params || {}, to = this.props.to, options = this.getOptions();
    let childrenProps = this.props.children.props;
    let props = Object.assign({}, childrenProps, {
        onClick: this.handleClick,
        href: UIRouterReact.instance.stateService.href(to, params, options),
        className: classNames(this.props.className, childrenProps.className)
    });
    return cloneElement(this.props.children, props);
  }
}