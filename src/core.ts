import {UIRouter, PathNode, services} from 'ui-router-core';
import {ReactViewDeclaration, ReactStateDeclaration} from "./interface"
import {ReactViewConfig, reactViewsBuilder} from "./reactViews";
import {HistoryImplementation} from "./history/interface";
import {hashHistory} from './history/hashHistory';

// Set up view config factory
let viewConfigFactory = (node: [PathNode], config: ReactViewDeclaration) =>
  new ReactViewConfig(node, config);

export class UIRouterReact extends UIRouter {
  static instance;
  constructor(history: HistoryImplementation = hashHistory) {
    super();
    this.viewService.viewConfigFactory('react', viewConfigFactory);
    this.stateRegistry.decorator("views", reactViewsBuilder);
    UIRouterReact.instance = this;
    // Patch location service & config with history implementation
    Object.assign(services.location, history.service);
    Object.assign(services.locationConfig, history.configuration);
  }
  start(): void {
    this.stateRegistry.stateQueue.autoFlush(this.stateService);
    this.urlRouter.listen();
    this.urlRouter.sync();
  }
}