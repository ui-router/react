import {trace, UIRouter, PathNode, services} from 'ui-router-core';
import './justjs';
import {hashLocation, pushStateLocation} from './justjs';
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
  start(): void {
    this.stateRegistry.stateQueue.autoFlush(this.stateService);
    this.urlRouter.listen();
    this.urlRouter.sync();
  }
  html5Mode (mode: Boolean): void {
    if (mode === true) {
      let loc = <any> services.location;
      let locCfg = <any> services.locationConfig;
      locCfg.html5Mode = () => true;
      Object.assign(loc, pushStateLocation);
    }
  }
}

export {
    UIView,
    UISref,
    UISrefActive,
    ReactStateDeclaration,
    trace
}