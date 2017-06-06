/// <reference types="react" />
import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
export interface UISrefActiveProps {
    class?: string;
    exact?: Boolean;
    children?: any;
}
export interface UISrefActiveState {
    state: {
        name: string;
        [key: string]: any;
    };
    params: Object;
    hash: string;
}
export declare class UISrefActive extends Component<UISrefActiveProps, any> {
    states: Array<UISrefActiveState>;
    activeClasses: {
        [key: string]: string;
    };
    deregister: Function;
    static propTypes: {
        class: PropTypes.Validator<any>;
        children: PropTypes.Validator<any>;
    };
    static contextTypes: ValidationMap<any>;
    static childContextTypes: ValidationMap<any>;
    getChildContext(): {
        parentUiSrefActiveAddStateInfo: (stateName: any, stateParams: any) => () => void;
    };
    componentWillMount(): void;
    componentWillUnmount(): void;
    addStateInfo: (stateName: any, stateParams: any) => () => void;
    addState: (stateName: any, stateParams: any, activeClass: any) => () => void;
    createStateHash: (state: string, params: Object) => string;
    getActiveClasses: () => any[];
    render(): any;
}
