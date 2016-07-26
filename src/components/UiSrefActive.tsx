import {Component, PropTypes, cloneElement} from 'react';
import UIRouterReact, { UISref } from '../index';
import {find} from '../utils';

export class UISrefActive extends Component<any,any> {
    uiSref;

    static propTypes = {
        class: PropTypes.string.isRequired,
        children: PropTypes.element.isRequired
    }

    constructor (props) {
        super(props);
    }

    componentDidMount () {
        const child = this.props.children;
        this.uiSref = find(child, component => {
            return typeof component.type === 'function' && component.type.name === 'UISref';
        });
    }

    isActive = () => {
        let currentState = UIRouterReact.instance.globals.current.name;
        return this.uiSref && this.uiSref.props.to === currentState;
    }

    render () {
        let isActive = this.isActive();
        return (
            !isActive
                ? this.props.children
                : cloneElement(this.props.children, { className: this.props.class })
        );
    }
}