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

    constructor (props, context) {
        super(props);
        const addStateInfo = context['parentUiSrefActiveAddStateInfo'];
        typeof addStateInfo === 'function' && addStateInfo(props.to, props.params);
    }

    getOptions = () => {
        let parent: UIViewAddress = this.context['parentUIViewAddress'];
        let defOpts = { relative: parent.context, inherit: true };
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