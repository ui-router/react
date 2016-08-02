import * as React from 'react';
import * as ReactDOM from 'react-dom';
import UIRouterReact, { UIView, ReactStateDeclaration, trace } from '../src/index';

import {Home} from './home';
import {Child} from './child';
import {Nest} from './nest';
import {Header} from './header';

let home = { name: 'home', component: Home, url: '/home?foo' };
let child = { name: 'home.child', component: Child, url: '/child' };
let nest = {
  name: 'home.child.nest',
  views: {
    $default: Nest,
    "header@home": Header
  },
  url: '/nest',
  resolve: [{
    token: 'foo',
    resolveFn: ($transition$) => {
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          resolve('bar');
        }, 1000);
      });
    }
  }]
} as ReactStateDeclaration;

// create new instance of UIRouterReact
const Router = new UIRouterReact();
// set up html5Mode
Router.html5Mode(true);
// register states
[home, child, nest].forEach(state => {
  Router.stateRegistry.register(state);
});


Router.urlRouterProvider.otherwise("/home");
trace.enable(1);
Router.start();

var el = document.getElementById("react-app");
ReactDOM.render(<UIView/>, el);