import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  UIRouter,
  UIRouterReact,
  UIView,
  UISrefActive,
  UISref,
  ReactStateDeclaration,
  ReactViewDeclaration,
  trace,
  pushStateLocationPlugin,
} from '@uirouter/react';

import { Child } from './components/Child';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Nest } from './components/Nest';

let home: ReactStateDeclaration = {
  name: 'home',
  component: Home,
  url: '/home?foo',
};
let child: ReactStateDeclaration = {
  name: 'home.child',
  component: Child,
  url: '/child',
};
let nest: ReactStateDeclaration = {
  name: 'home.child.nest',
  views: {
    $default: Nest as ReactViewDeclaration,
    'header@home': Header as ReactViewDeclaration,
  },
  url: '/nest',
  resolve: [
    {
      token: 'foo',
      resolveFn: $transition$ => {
        return new Promise<string>((resolve, reject) => {
          setTimeout(() => {
            resolve('bar');
          }, 1000);
        });
      },
    },
  ],
};

const routerConfig = (router: UIRouterReact) => {
  router.urlRouter.otherwise('/home');
  trace.enable(1);
};

let el = document.getElementById('react-app');
let app = (
  <UIRouter plugins={[pushStateLocationPlugin]} states={[home, child, nest]} config={routerConfig}>
    <div>
      <UISrefActive class="active">
        <UISref to="home">
          <a>Home</a>
        </UISref>
      </UISrefActive>
      <UIView render={(Comp, props) => <Comp {...props} foo="bar" />}>
        <p>Content will load here</p>
      </UIView>
    </div>
  </UIRouter>
);
ReactDOM.render(app, el);
