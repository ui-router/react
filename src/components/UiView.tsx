import * as React from 'react';
import {UIRouter, ActiveUIView, ViewContext, ViewConfig} from "ui-router-core";
import {ReactViewConfig} from "../ui-router-react";

let id = 0;

let uiViewContexts: {
    [key: string]: { 
        fqn: string;
        context: ViewContext;
    }
} = {};

export class UiView extends React.Component<any,any> {
    el;
    
    viewContext: ViewContext;
    fqn: string;
    
    uiViewData: ActiveUIView;
    deregister: Function;
    
    static childContextTypes: React.ValidationMap<any> = {
        uiViewId: React.PropTypes.number
    }
    
    static contextTypes: React.ValidationMap<any> = {
        uiViewId: React.PropTypes.number
    }
  
    constructor() {
        super();
    }
    
    render() {
        let child = React.createElement(this.state && this.state.component || "h3"); 
        return child;
    }
    
    getChildContext() {
        return {
            uiViewId: (this.state && this.state.id) || 0
        }
    }

    componentDidMount() {
        let router = (UIRouter as any).instance as UIRouter;
        
        let parentFqn: string;
        let creationContext: ViewContext;
        let parentId: number = (this.context as any).uiViewId || 0;
        
        if (parentId === 0) {
            parentFqn = "";
            creationContext = router.stateRegistry.root();
        } else {
            parentFqn = uiViewContexts[parentId].fqn;
            creationContext = uiViewContexts[parentId].context;
        }

        let name = this.props.name || "$default";
        var uiViewData = this.uiViewData = {
            $type: 'react',
            id: ++id,
            name: name,
            fqn: parentFqn ? parentFqn + "." + name : name,
            creationContext: creationContext,
            configUpdated: this.viewConfigUpdated.bind(this),
            config: undefined
        } as ActiveUIView;
                        
        uiViewContexts[uiViewData.id] = {
            get fqn() { return uiViewData.fqn; },
            get context() { return uiViewData.config && uiViewData.config.viewDecl.$context; } 
        }
        
        this.deregister = router.viewService.registerUiView(this.uiViewData);
        this.setState({ id: uiViewData.id });
    }
    
    componentWillUnmount() {
        this.deregister();
        delete uiViewContexts[this.uiViewData.id];
    }
    
    viewConfigUpdated(newConfig: ReactViewConfig) {
        this.uiViewData.config = newConfig;
        let newComponent = newConfig && newConfig.viewDecl && newConfig.viewDecl.component;
        this.setState({ component: newComponent })
    }
}