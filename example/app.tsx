import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, registerStates, UiView } from '../src/index';

import {Home} from './home';
import {Child} from './child';
import {Nest} from './nest';
import {Header} from './header';

let home = { name: 'home', component: Home, url: '/home?foo' };
let child = { name: 'home.child', component: Child, url: '/child' };
let nest = { name: 'home.child.nest', views: { $default: Nest, "header@home": Header }, url: '/nest' };
registerStates([home, child, nest]);

Router.urlRouterProvider.otherwise(() => Router.stateService.go("home.child"));
Router.urlRouter.listen();
Router.urlRouter.sync();

var el = document.getElementById("react-app");
console.log(el);
ReactDOM.render(<UiView/>, el);