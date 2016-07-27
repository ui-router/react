import {Component, PropTypes, createElement, cloneElement, isValidElement, ValidationMap} from 'react';
import * as classNames from 'classnames';
import UIRouterReact from '../index';
import {extend} from 'ui-router-core';

export class UISref extends Component<any,any> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        to: PropTypes.string.isRequired,
        params: PropTypes.object,
        options: PropTypes.object,
        className: PropTypes.string
    }

    static contextTypes: ValidationMap<any> = {
        uiViewId: PropTypes.number
    }

    constructor (props) {
        super(props);
    }

    getOptions = () => {
        let parent = UIRouterReact.instance.globals.$current.parent.name;
        let defOpts = { relative: parent, inherit: true };
        return extend(defOpts, this.props.options || {});
    }

    handleClick = (e) => {
        e.preventDefault();
        let params = this.props.params || {};
        let to = this.props.to;
        let options = this.getOptions();
        UIRouterReact.instance.stateService.go(to, params, options);
    }

    render () {
        let childrenProps = this.props.children.props;
        let props = Object.assign({}, childrenProps, {
            onClick: this.handleClick,
            className: classNames(this.props.className, childrenProps.className)
        });
        return cloneElement(this.props.children, props);
    }
}