<div align="center">
  <img src="https://rawgit.com/ui-router/react/master/logo/logo.png" height="150"/>
  <h1>UI-Router-React</h1>
  <a href="https://travis-ci.org/ui-router/react">
    <img src="https://img.shields.io/travis/ui-router/react/master.svg?style=flat-square">
  </a>
  <a href="https://www.npmjs.org/package/@uirouter/react">
    <img src="https://img.shields.io/npm/v/@uirouter/react.svg?style=flat-square">
  </a>
</div>

UI-Router provides extremely flexible, state based routing to the [React](https://facebook.github.io/react/) ecosystem.

Routing frameworks for SPAs update the browser's URL as the user navigates through the app.  Conversely, this allows changes to the browser's URL to drive navigation through the app, thus allowing the user to create a bookmark to a location deep within the SPA.

UI-Router applications are modeled as a hierarchical tree of states. UI-Router provides a [*state machine*](https://en.wikipedia.org/wiki/Finite-state_machine) to manage the transitions between those application states in a transaction-like manner.

## Docs & Resources

- [Tutorials and Docs](/docs)
- [UI-Router website](https://ui-router.github.io/)
- [Changelog](/CHANGELOG.md)
- [Upgrading from `0.3.x` to `0.4.x`](/docs/upgrading-from-0.3.x-to-0.4.x.md)

## Getting started
The UI-Router package is distributed using [npm](https://www.npmjs.com/), the node package manager.

```
npm install --save ui-router-react
```

Import `UIRouter` into your project, define some states and you're good to go!

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {UIRouter, UIView, pushStateLocationPlugin} from 'ui-router-react';
import Home from './components/Home';

// define your states
const states = [{
  name: 'home',
  url: '/home',
  component: Home
}];

// select your plugins
const plugins = [
  pushStateLocationPlugin
];

ReactDOM.render(
  <UIRouter plugins={plugins} states={states}>
    <UIView/>
  </UIRouter>,
  document.getElementById('root')
);
```
