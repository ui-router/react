> Warning! This project is a WIP and it is actively developed. This should NOT be considered production ready in any way.
> Feel free to try it out and please provide feedbacks by filing an issue or opening a PR.

# UI-Router-React
UI-Router provides extremely flexible, state based routing to the [React](https://facebook.github.io/react/) ecosystem.

Routing frameworks for SPAs update the browser's URL as the user navigates through the app.  Conversely, this allows
changes to the browser's URL to drive navigation through the app, thus allowing the user to create a bookmark to a 
location deep within the SPA.

UI-Router applications are modeled as a hierarchical tree of states. UI-Router provides a
[*state machine*](https://en.wikipedia.org/wiki/Finite-state_machine) to manage the transitions between those
application states in a transaction-like manner.

## Getting started
The UI-Router package is distributed using [npm](https://www.npmjs.com/), the node package manager.

```
npm install --save ui-router-react
```

Import the `UIRouterReact` into your project, create a new instance and start the router!
```javascript
import UIRouterReact from 'ui-router-react';
import Home from './components/Home';

// Create a new instance of the Router
const router = new UIRouterReact();

// Register state
router.stateRegistry.register({
	name: 'home',
	url: '/home',
	component: Home
});

// Start the router
router.start();
```