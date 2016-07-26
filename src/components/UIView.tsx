import {Component, PropTypes, ValidationMap, createElement} from 'react';
import {ActiveUIView, ViewContext, ViewConfig, Transition, ResolveContext} from "ui-router-core";
import UIRouterReact from "../index";
import {ReactViewConfig} from "../ui-router-react";

let id = 0;

let uiViewContexts: {
    [key: string]: {
        fqn: string;
        context: ViewContext;
    }
} = {};

export class UIView extends Component<any,any> {
    el;

    viewContext: ViewContext;
    fqn: string;

    uiViewData: ActiveUIView;
    deregister: Function;

    static childContextTypes: ValidationMap<any> = {
        uiViewId: PropTypes.number
    }

    static contextTypes: ValidationMap<any> = {
        uiViewId: PropTypes.number
    }

    constructor() {
        super();
        this.state = {
            component: 'div',
            props: {}
        }
    }

    render() {
        let { component, props } = this.state;
        let child = createElement(component, props);
        return child;
    }

    getChildContext() {
        return {
            uiViewId: (this.state && this.state.id) || 0
        }
    }

    componentDidMount() {
        let router = UIRouterReact.instance;

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

        this.deregister = router.viewService.registerUIView(this.uiViewData);
        this.setState({ id: uiViewData.id });
    }

    componentWillUnmount() {
        this.deregister();
        delete uiViewContexts[this.uiViewData.id];
    }

    viewConfigUpdated(newConfig: ReactViewConfig) {
        this.uiViewData.config = newConfig;
        let newComponent = newConfig && newConfig.viewDecl && newConfig.viewDecl.component;
        let resolves = {};
        if (newConfig) {
            let ctx = new ResolveContext(newConfig.path);
            var trans = ctx.getResolvable(Transition).data;
            let resolvables = newConfig.path[0].resolvables;
            newConfig.path.forEach(pathNode => {
                pathNode.resolvables.forEach(resolvable => {
                    if (typeof resolvable.token === 'string')
                    resolves[resolvable.token] = resolvable.data;
                });
            });
        }
        let props = {resolves: resolves, transition: trans};
        this.setState({ component: newComponent || 'div', props: newComponent ? props : {} })
    }
}