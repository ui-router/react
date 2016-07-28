import {Component, PropTypes, cloneElement, ValidationMap} from 'react';
import * as classNames from 'classnames';
import UIRouterReact, { UISref } from '../index';
import {UIViewAddress} from "./UIView";
import {find} from '../utils';

export interface IProps {
    class?: string;
    children?: any;
}

export class UISrefActive extends Component<IProps,any> {
    uiSref;

    static propTypes = {
        class: PropTypes.string.isRequired,
        children: PropTypes.element.isRequired
    }

    static contextTypes: ValidationMap<any> = {
        parentUIViewAddress: PropTypes.object
    }

    componentWillMount () {
        const child = this.props.children;
        this.uiSref = find(child, component => {
            return typeof component.type === 'function' && component.type.name === 'UISref';
        });
    }

    isActive = () => {
        let parentUIViewAddress: UIViewAddress = this.context['parentUIViewAddress'];
        let {to, params} = this.uiSref.props, {stateService} = UIRouterReact.instance;
        let state = stateService.get(to, parentUIViewAddress.context) || { name: to };
        return this.uiSref && (stateService.is(state.name, params) || stateService.includes(state.name, params));
    }

    render () {
        let isActive = this.isActive();
        return (
            !isActive
                ? this.props.children
                : cloneElement(this.props.children, Object.assign({}, this.props.children.props, {
                    className: classNames(this.props.children.props.className, this.props.class)
                }))
        );
    }
}