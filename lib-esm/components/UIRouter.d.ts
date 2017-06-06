/// <reference types="react" />
/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import { Component } from 'react';
import * as PropTypes from 'prop-types';
import { UIRouterReact, ReactStateDeclaration } from '../index';
export interface UIRouterProps {
    plugins?: any[];
    states?: ReactStateDeclaration[];
    config?: (router: UIRouterReact) => void;
    router?: UIRouterReact;
}
export interface UIRouterState {
    id?: number;
    loaded?: boolean;
    component?: string;
    props?: any;
}
export declare class UIRouter extends Component<UIRouterProps, UIRouterState> {
    static propTypes: {
        plugins: PropTypes.Requireable<any>;
        states: PropTypes.Requireable<any>;
        config: PropTypes.Requireable<any>;
        children: PropTypes.Validator<any>;
        router: PropTypes.Requireable<any>;
    };
    static childContextTypes: {
        router: PropTypes.Validator<any>;
    };
    router: UIRouterReact;
    constructor(props: any, context: any);
    getChildContext(): {
        router: UIRouterReact;
    };
    render(): React.ReactElement<any>;
}
