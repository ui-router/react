import * as React from 'react';
import * as ReactDOM from 'react-dom';
import UIRouterReact, { UIView, UISrefActive, UISref, ReactStateDeclaration, trace, browserHistory } from '../src/index';

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
const Router = new UIRouterReact(browserHistory);
// register states
[home, child, nest].forEach(state => {
  Router.stateRegistry.register(state);
});


Router.urlRouterProvider.otherwise("/home");
trace.enable(1);
Router.start();

let el = document.getElementById("react-app");
let app = (
  <div>
    <UISrefActive class="active">
      <UISref to="home"><a>Home</a></UISref>
    </UISrefActive>
    <UIView><p>Content will load here</p></UIView>
  </div>
);
ReactDOM.render(app, el);