import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { UIRouter, UIRouterReact, UIView, UISrefActive, UISref, ReactStateDeclaration, trace, pushStateLocationPlugin } from '../src/index';

import {Home} from './home';
import {Child} from './child';
import {Nest} from './nest';
import {Header} from './header';

let home:ReactStateDeclaration = { name: 'home', component: Home, url: '/home?foo' };
let child:ReactStateDeclaration = { name: 'home.child', component: Child, url: '/child' };
let nest:ReactStateDeclaration = {
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
};


const routerConfig = (router: UIRouterReact) => {
  router.urlRouter.otherwise("/home");
  trace.enable(1);
}

let el = document.getElementById("react-app");
let app = (
  <UIRouter plugins={[pushStateLocationPlugin]} states={[home, child, nest]} config={routerConfig}>
    <div>
      <UISrefActive class="active">
        <UISref to="home"><a>Home</a></UISref>
      </UISrefActive>
      <UIView render={(Comp, props) => <Comp {...props} foo="bar" />}><p>Content will load here</p></UIView>
    </div>
  </UIRouter>
);
ReactDOM.render(app, el);