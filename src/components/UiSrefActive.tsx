import * as React from 'react';
import {Router, UiSref} from '../index';
import {find} from '../utils';

export class UiSrefActive extends React.Component<any,any> {
    uiSref;

    static propTypes = {
        class: React.PropTypes.string.isRequired,
        children: React.PropTypes.element.isRequired
    }

    constructor (props) {
        super(props);
    }

    componentDidMount () {
        const child = this.props.children;
        this.uiSref = find(child, component => {
            return typeof component.type === 'function' && component.type.name === 'UiSref';
        });
    }

    isActive = () => {
        let currentState = Router.globals.current.name;
        return this.uiSref && this.uiSref.props.to === currentState;
    }

    render () {
        let isActive = this.isActive();
        return (
            !isActive
                ? this.props.children
                : React.cloneElement(this.props.children, { className: this.props.class })
        );
    }
}