/// <reference types="react" />
/**
 * @reactapi
 * @module components
 */ /** */
import * as React from 'react';
import { Component, ValidationMap } from 'react';
import * as PropTypes from 'prop-types';
import { TransitionOptions } from '@uirouter/core';
export interface UISrefProps {
    children?: any;
    to: string;
    params?: {
        [key: string]: any;
    };
    options?: TransitionOptions;
    className?: string;
}
export declare class UISref extends Component<UISrefProps, any> {
    deregister: Function;
    static propTypes: {
        children: PropTypes.Validator<any>;
        to: PropTypes.Validator<any>;
        params: PropTypes.Requireable<any>;
        options: PropTypes.Requireable<any>;
        className: PropTypes.Requireable<any>;
    };
    static contextTypes: ValidationMap<any>;
    componentWillMount(): void;
    componentWillUnmount(): void;
    getOptions: () => {
        relative: any;
        inherit: boolean;
    } & TransitionOptions;
    handleClick: (e: any) => void;
    render(): React.DOMElement<any, Element>;
}
