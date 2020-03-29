import React from 'react';
import { render } from 'react-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
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

const FadeTransition = props => <CSSTransition {...props} classNames="example" timeout={{ enter: 500, exit: 300 }} />;

const App = () => (
  <UIRouter plugins={[hashLocationPlugin]} states={states} config={config}>
    <div>
      <Menu />
      <UIView
        render={(RoutedComponent, props) => (
          <TransitionGroup>
            <FadeTransition key={props.transition}>
              <RoutedComponent {...props} />
            </FadeTransition>
          </TransitionGroup>
        )}
      />
    </div>
  </UIRouter>
);

render(<App />, document.getElementById('root'));
