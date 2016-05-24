import * as React from 'react';
import {Router} from '../index';
import {extend} from 'ui-router-core';

export class UiSref extends React.Component<any,any> {
    static propTypes = {
        to: React.PropTypes.string.isRequired,
        params: React.PropTypes.object,
        options: React.PropTypes.object,
        className: React.PropTypes.string
    }
    
    constructor (props) {
        super(props);
    }
    
    getOptions = () => {
        let parent = Router.globals.$current.parent.name;
        let defOpts = { relative: parent, inherit: true };
        return extend(defOpts, this.props.options || {});
    }
    
    handleClick = (e) => {
        e.preventDefault();
        let params = this.props.params || {};
        let to = this.props.to;
        let options = this.getOptions();
        Router.stateService.go(to, params, options);
    }
    
    render () {
        return (
            <a href="#" onClick={this.handleClick} className={this.props.className}>{this.props.children}</a>
        );
    }
}