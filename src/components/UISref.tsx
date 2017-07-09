/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import {
  Component,
  createElement,
  cloneElement,
  isValidElement,
  ValidationMap,
} from 'react';
import * as PropTypes from 'prop-types';
import * as _classNames from 'classnames';

import {extend, TransitionOptions} from '@uirouter/core';

import {UIRouterReact} from '../index';
import {UIViewAddress} from './UIView';

let classNames = _classNames;

export interface UISrefProps {
  children?: any;
  to: string;
  params?: {[key: string]: any};
  options?: TransitionOptions;
  className?: string;
}

export class UISref extends Component<UISrefProps, any> {
  // deregister function for parent UISrefActive
  deregister: Function;
  static propTypes = {
    children: PropTypes.element.isRequired,
    to: PropTypes.string.isRequired,
    params: PropTypes.object,
    options: PropTypes.object,
    className: PropTypes.string,
  };

  static contextTypes: ValidationMap<any> = {
    router: PropTypes.object,
    parentUIViewAddress: PropTypes.object,
    parentUiSrefActiveAddStateInfo: PropTypes.func,
  };

  componentWillMount() {
    const addStateInfo = this.context['parentUiSrefActiveAddStateInfo'];
    this.deregister =
      typeof addStateInfo === 'function'
        ? addStateInfo(this.props.to, this.props.params)
        : () => {};
    let router = this.context['router'];
    if (typeof router === 'undefined') {
      throw new Error(
        `UIRouter instance is undefined. Did you forget to include the <UIRouter> as root component?`,
      );
    }
  }

  componentWillUnmount() {
    this.deregister();
  }

  getOptions = () => {
    let parent: UIViewAddress = this.context['parentUIViewAddress'];
    let parentContext =
      (parent && parent.context) || this.context['router'].stateRegistry.root();
    let defOpts = {relative: parentContext, inherit: true};
    return extend(defOpts, this.props.options || {});
  };

  handleClick = e => {
    if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      let params = this.props.params || {};
      let to = this.props.to;
      let options = this.getOptions();
      this.context['router'].stateService.go(to, params, options);
    }
  };

  render() {
    let params = this.props.params || {},
      to = this.props.to,
      options = this.getOptions();
    let childrenProps = this.props.children.props;
    let props = Object.assign({}, childrenProps, {
      onClick: this.handleClick,
      href: this.context['router'].stateService.href(to, params, options),
      className: classNames(this.props.className, childrenProps.className),
    });
    return cloneElement(this.props.children, props);
  }
}
