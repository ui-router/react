import {trace, UIRouter, PathNode} from 'ui-router-core';
import './justjs';
import {ReactViewConfig, reactViewsBuilder} from "./ui-router-react"
import {ReactViewDeclaration, ReactStateDeclaration} from "./interface"
import {UIView} from "./components/UIView";
import {UISref} from "./components/UISref";
import {UISrefActive} from "./components/UISrefActive";

// Set up view config factory
let viewConfigFactory = (node: [PathNode], config: ReactViewDeclaration) =>
  new ReactViewConfig(node, config);

export default class UIRouterReact extends UIRouter {
  static instance;
  constructor() {
    super();
    this.viewService.viewConfigFactory('react', viewConfigFactory);
    this.stateRegistry.decorator("views", reactViewsBuilder);
    UIRouterReact.instance = this;
  }
  start() {
    this.stateRegistry.stateQueue.autoFlush(this.stateService);
    this.urlRouter.listen();
    this.urlRouter.sync();
  }
}

export {
    UIView,
    UISref,
    UISrefActive,
    ReactStateDeclaration,
    trace
}