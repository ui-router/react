import React from 'react';
import { render } from 'react-dom';
import { CSSTransitionGroup } from 'react-transition-group';
import { UIRouter, UIView, hashLocationPlugin } from '@uirouter/react';

import './index.css';

import { Home, About, Menu } from './components';

const states = [
  {
    url: '/home',
    name: 'home',
    component: Home,
  },
  {
    url: '/about',
    name: 'about',
    component: About,
  },
];
const config = router => router.urlService.rules.initial({ state: 'home' });

const App = () => (
  <UIRouter plugins={[hashLocationPlugin]} states={states} config={config}>
    <div>
      <Menu />
      <UIView
        render={(RoutedComponent, props) => (
          <CSSTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            <RoutedComponent {...props} key={props.transition} />
          </CSSTransitionGroup>
        )}
      />
    </div>
  </UIRouter>
);

render(<App />, document.getElementById('root'));
