import {UIRouter, PathNode, services} from 'ui-router-core';
import {ReactViewDeclaration, ReactStateDeclaration} from "./interface"
import {ReactViewConfig, reactViewsBuilder} from "./reactViews";

// Set up view config factory
let viewConfigFactory = (node: [PathNode], config: ReactViewDeclaration) =>
  new ReactViewConfig(node, config);

export class UIRouterReact extends UIRouter {
  constructor() {
    super();
    this.viewService._pluginapi._viewConfigFactory('react', viewConfigFactory);
    this.stateRegistry.decorator("views", reactViewsBuilder);
  }
  start(): void {
    this.urlMatcherFactory.$get();
    this.stateRegistry.stateQueue.autoFlush(this.stateService);
    this.urlRouter.listen();
    this.urlRouter.sync();
  }
}