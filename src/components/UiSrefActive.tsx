import {Component, PropTypes, cloneElement} from 'react';
import {Router, UiSref} from '../index';
import {find} from '../utils';

export class UiSrefActive extends Component<any,any> {
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
                : cloneElement(this.props.children, { className: this.props.class })
        );
    }
}