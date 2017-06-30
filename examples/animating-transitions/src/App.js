import React, { Component } from 'react';
import {UIRouter, UIView, UISref, pushStateLocationPlugin} from '@uirouter/react';
import { CSSTransitionGroup } from 'react-transition-group';

import logo from './logo.svg';
import './App.css';

// define your states
const states = [{
  name: 'home',
  url: '/',
  component: () => (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Welcome to React</h2>
      </div>
      <p className="App-intro">
        To get started, edit <code>src/App.js</code> and save to reload.<br />
        <UISref to="about"><a>Go to about page</a></UISref>
      </p>
    </div>
  )
}, {
  name: 'about',
  url: '/about',
  component: () => (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>About</h2>
      </div>
      <p className="App-intro">
        This is the about page<br />
        <UISref to="home"><a>Go to homepage</a></UISref>
      </p>
    </div>
  )
}];

// select your plugins
const plugins = [
  pushStateLocationPlugin
];

class App extends Component {
  render() {
    return (
      <UIRouter plugins={plugins} states={states}>
        <UIView render={(Comp, props) =>
          <CSSTransitionGroup
            transitionName="example"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            <Comp {...props} key={props.transition} />
          </CSSTransitionGroup>
        }/>
      </UIRouter>
    );
  }
}

export default App;
