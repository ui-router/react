import {trace, UIRouter, PathNode} from 'ui-router-core';
import './justjs';
import {ReactViewConfig, reactViewsBuilder} from "./ui-router-react"
import {ReactViewDeclaration, ReactStateDeclaration} from "./interface"
import {UiView} from "./components/UiView";
import {UiSref} from "./components/UiSref";
import {UiSrefActive} from "./components/UiSrefActive";

// Set up view config factory
let viewConfigFactory = (node: [PathNode], config: ReactViewDeclaration) =>
  new ReactViewConfig(node, config);

export default class UIRouterReact extends UIRouter {
  static instance;
  constructor() {
    super();
    this.viewService.viewConfigFactory('react', viewConfigFactory);
    this.stateRegistry.decorator("views", reactViewsBuilder);
    this.stateRegistry.stateQueue.autoFlush(this.stateService);
    UIRouterReact.instance = this;
  }
}

export {
    UiView,
    UiSref,
    UiSrefActive,
    ReactStateDeclaration
}