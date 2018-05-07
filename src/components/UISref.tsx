/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import { Component, createElement, cloneElement, isValidElement, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import * as _classNames from 'classnames';

import { extend, TransitionOptions } from '@uirouter/core';

import { UIRouterReact, UIRouterConsumer } from '../index';
import { UIViewAddress, UIViewConsumer } from './UIView';
import { UIRouterInstanceUndefinedError } from './UIRouter';
import { UISrefActive, UISrefActiveConsumer } from './UISrefActive';

let classNames = _classNames;

export interface UISrefProps {
  router: UIRouterReact;
  addStateInfoToParentActive: Function;
  parentUIView: UIViewAddress;
  children?: any;
  to: string;
  params?: { [key: string]: any };
  options?: TransitionOptions;
  className?: string;
}

class Sref extends Component<UISrefProps, any> {
  // deregister function for parent UISrefActive
  deregister: Function;
  static propTypes = {
    router: PropTypes.object.isRequired,
    parentUIView: PropTypes.object,
    addStateInfoToParentActive: PropTypes.func,
    children: PropTypes.element.isRequired,
    to: PropTypes.string.isRequired,
    params: PropTypes.object,
    options: PropTypes.object,
    className: PropTypes.string,
  };

  componentWillMount() {
    const addStateInfo = this.props.addStateInfoToParentActive;
    this.deregister = typeof addStateInfo === 'function' ? addStateInfo(this.props.to, this.props.params) : () => {};
    const router = this.props.router;
    if (typeof router === 'undefined') {
      throw UIRouterInstanceUndefinedError;
    }
  }

  componentWillUnmount() {
    this.deregister();
  }

  getOptions = () => {
    let parent = this.props.parentUIView;
    let parentContext = (parent && parent.context) || this.props.router.stateRegistry.root();
    let defOpts = { relative: parentContext, inherit: true };
    return extend(defOpts, this.props.options || {});
  };

  handleClick = e => {
    if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      let params = this.props.params || {};
      let to = this.props.to;
      let options = this.getOptions();
      this.props.router.stateService.go(to, params, options);
    }
  };

  render() {
    let params = this.props.params || {},
      to = this.props.to,
      options = this.getOptions();
    let childrenProps = this.props.children.props;
    let props = Object.assign({}, childrenProps, {
      onClick: this.handleClick,
      href: this.props.router.stateService.href(to, params, options),
      className: classNames(this.props.className, childrenProps.className),
    });
    return cloneElement(this.props.children, props);
  }
}

export const UISref = props => (
  <UIRouterConsumer>
    {router => (
      <UIViewConsumer>
        {parentUIView => (
          <UISrefActiveConsumer>
            {addStateInfo => (
              <Sref {...props} router={router} parentUIView={parentUIView} addStateInfoToParentActive={addStateInfo} />
            )}
          </UISrefActiveConsumer>
        )}
      </UIViewConsumer>
    )}
  </UIRouterConsumer>
);

(UISref as any).displayName = 'UISref';
