import { trace, UIRouter, Node } from 'ui-router-core';
import './justjs.ts';
import {ReactViewConfig, reactViewsBuilder} from "./ui-router-react"
import {ReactViewDeclaration, ReactStateDeclaration} from "./interface"
import {UiView} from "./components/UiView";
import {UiSref} from "./components/UiSref";
import {UiSrefActive} from "./components/UiSrefActive";

// create router instance 
let Router = new UIRouter();
(UIRouter as any).instance = Router;

// Set up view config factory
let viewConfigFactory = (node: Node, config: ReactViewDeclaration) =>
    new ReactViewConfig(node, config);    
Router.viewService.viewConfigFactory('react', viewConfigFactory)

Router.stateRegistry.decorator("views", reactViewsBuilder);
Router.stateRegistry.stateQueue.autoFlush(Router.stateService);

const registerStates = (states) => {
    states.forEach(state => {
        Router.stateRegistry.register(state);
    });
}

export {
    Router,
    UiView,
    UiSref,
    UiSrefActive,
    registerStates,
    ReactStateDeclaration
}