# API documentation

- [UIRouterReact](#uirouterreact)
    - [`globals`](#globals-uirouterglobals)
    - [`stateRegistry`](#stateregistry-stateregistry)
    - [`stateService`](#stateservice-stateservice)
    - [`transitionService`](#transitionservice-transitionservice)
    - [`urlMatcherFactory`](#urlmatcherfactory-urlmatcherfactory)
    - [`urlRouter`](#urlrouter-urlrouter)
    - [`urlRouterProvider`](#urlrouterprovider-urlrouterprovider) - *deprecated*
    - [`viewService`](#viewservice-viewservice)
    - [`start()`](#start-void)
    - [`plugin()`](#plugin-uirouterplugin)
    - [`html5mode()`](#html5modemode-boolean-void) - *deprecated*

- [State Declaration](#state-declaration)
    - [`abstract`](#abstract-boolean)
    - [`data`](#data-any)
    - [`name`](#name-string)
    - [`params`](#params-object)
    - [`parent`](#parent-string--statedeclaration)
    - [`redirectTo`](#redirectto-function)
    - [`onEnter`](#onenter-transitionstatehookfn)
    - [`onExit`](#onexit-transitionstatehookfn)
    - [`onRetain`](#onretain-transitionstatehookfn)
    - [`resolve`](#resolve-array--object)
    - [`resolvePolicy`](#resolvepolicy-resolvepolicy)
    - [`url`](#url-string)
    - [`views`](#views-object)

- [Components](#components)
    - [`<UIRouter>`](#uirouter)
    - [`<UIView>`](#uiview)
    - [`<UISref>`](#uisref)
    - [`<UISrefActive>`](#uisrefactive)

- [State Components](#state-components)

- [Transitions](#transitions)

- [Plugins](#plugins)
    - [`pushStateLocationPlugin`](#pushStateLocationPlugin)
    - [`hashLocationPlugin`](#hashLocationPlugin)
    - [`memoryLocationPlugin`](#memoryLocationPlugin)

- [Utilities](#utilities)
    - [`trace`](#trace)

## UIRouterReact
The `UIRouterReact` is the main library class. It is used to create an instance of the router as well as interacting with it.

It extends the core [`UIRouter`](https://ui-router.github.io/docs/latest/classes/core.uirouter.html) class.

UI-Router React, as well as its core, is written in TypeScript.
Typings definitions are available in the project.

```jsx
import UIRouterReact from 'ui-router-react';

const router = new UIRouterReact();

router.start();
```

The `UIRouterReact` instance will have the following properties and methods:

### Properties

#### `globals`: UIRouterGlobals
This is where we hold the global mutable state such as current state, current params, current transition, etc.

Take a look at the [UIRouterGlobals](https://ui-router.github.io/docs/latest/interfaces/core.uirouterglobals.html) for more info.

#### `stateRegistry`: StateRegistry
The `stateRegistry` is a registry for the application states.

Take a look at the [StateRegistry Class](https://ui-router.github.io/docs/latest/classes/state.stateregistry.html) for more info.

#### `stateService`: StateService
The `stateService` is a services used handling application states and navigating through them.

Take a look at the [StateService](https://ui-router.github.io/docs/latest/classes/state.stateservice.html) for more info.

#### `transitionService`: TransitionService
This class provides services related to Transitions.

- Most importantly, it allows global Transition Hooks to be registered.
- It allows the default transition error handler to be set.
- It also has a factory function for creating new Transition objects, (used internally by the StateService).

Take a look at the [TransitionService Class](https://ui-router.github.io/docs/latest/classes/transition.transitionservice.html) for more info.

#### `urlMatcherFactory`: UrlMatcherFactory
Factory for UrlMatcher instances. They are used for matching URLs against patterns and extracts named parameters from the path or the search part of the URL.

Take a look at [UrlMatcherFactory](https://ui-router.github.io/docs/latest/classes/url.urlmatcherfactory.html) and [UrlMatcher Class](https://ui-router.github.io/docs/latest/classes/url.urlmatcher.html) for more info.

#### `urlRouter`: UrlRouter
Internal class for handling the URL inside the router.

Take a look at [UrlRouter Class](https://ui-router.github.io/docs/latest/classes/url.urlrouter.html) for more info.

#### `urlRouterProvider`: UrlRouterProvider

**Deprecated in 0.4.0:** `urlRouterProvider` has been merged with `urlRouter`.

This class manages the router rules for what to do when the URL changes.

Take a look at [UrlRouterProvider](https://ui-router.github.io/docs/latest/classes/url.urlrouterprovider.html) for more info.

#### `viewService`: ViewService
This class manages the views for the router.

Take a look at the [ViewService Class](https://ui-router.github.io/docs/latest/classes/view.viewservice.html) for more info.

### Methods

#### `start()`: void
Starts the router. It tells the router to listen for state changes and to sync the url accordingly.

#### `plugin()`: UIRouterPlugin
Register a plugin in the router instance, the plugin is returned by the function.

#### `html5mode(mode: boolean)`: void

**Deprecated in 0.4.0!**

By default UI-Router works with a `HashLocation` history implementation.
If `mode` is true, the HTML5 `PushStateLocation` will be used instead.

## State Declaration
A state declaration object is used to register a new state. It is registered via the `stateRegistry`.

```jsx
// StateDeclaration object
const folderState = {
  name: 'folders',
  url: '/folders',
  component: Folders,
  resolve: [
    { token: 'allFolders', resolveFn: () => FolderService.list() }
  ]
}
```

#### Properties
##### `abstract`: boolean
An abstract state can never be directly activated. Use an abstract state to provide inherited properties (url, resolve, data, etc) to children states.

##### `data`: any
This is a spot for you to store inherited state metadata. Child states' `data` object will prototypally inherit from their parent state.

This is a good spot to put metadata such as `requiresAuth`.

Note: because prototypal inheritance is used, changes to parent `data` objects reflect in the child `data` objects.
Care should be taken if you are using `hasOwnProperty` on the `data` object.
Properties from parent objects will return false for `hasOwnProperty`.

##### `name`: string
A unique state name, e.g. `"home"`, `"about"`, `"contacts"`. To create a parent/child state use a dot, e.g. `"about.sales"`, `"home.newest"`.

Note: States require unique names.

##### `params`: object
An object which optionally configures parameters declared in the url, or defines additional non-url parameters. For each parameter being configured, add a [ParamDeclaration](https://ui-router.github.io/docs/latest/interfaces/params.paramdeclaration.html) keyed to the name of the parameter.

```jsx
params: {
  param1: {
   type: "int",
   array: true,
   value: []
  },
  param2: {
    value: "index"
  }
}
```

##### `parent`: string | StateDeclaration
Normally, a state's parent is implied from the state's name, e.g., `"parentstate.childstate"`.
Alternatively, you can explicitly set the parent state using this property.

```jsx
var parentstate = {
  name: 'parentstate'
}
var childstate = {
  name: 'childstate',
  parent: 'parentstate'
  // or use a JS var which is the parent StateDeclaration, i.e.:
  // parent: parentstate
}
```

##### `redirectTo`: function
Synchronously or asynchronously redirects Transitions to a different state/params
If this property is defined, a Transition directly to this state will be redirected based on the property's value.

- If the value is a `string`, the Transition is redirected to the state named by the string.
- If the property is an object with a `state` and/or `params` property, the Transition is redirected to the named `state` and/or `params`.
- If the value is a [TargetState](https://ui-router.github.io/docs/latest/classes/state.targetstate.html) the Transition is redirected to the `TargetState`
- If the property is a function:
  - The function is called with one parameter:
    - The current [Transition](https://ui-router.github.io/docs/latest/classes/transition.transition-1.html). An injector can be used to get dependencies using `transition.injector().get()`
  - The return value is processed using the previously mentioned rules.
  - If the return value is a promise, the promise is waited for, then the resolved async value is processed using the same rules.

```js
// a string
.state('A', {
  redirectTo: 'A.B'
})
// a {state, params} object
.state('C', {
  redirectTo: { state: 'C.D', params: { foo: 'index' } }
})
// a fn
.state('E', {
  redirectTo: () => "A"
})
// a fn conditionally returning a {state, params}
.state('F', {
  redirectTo: (trans) => {
  if (trans.params().foo < 10)
    return { state: 'F', params: { foo: 10 } };
  }
})
// a fn returning a promise for a redirect
.state('G', {
  redirectTo: (trans) => {
    let svc = trans.injector().get('SomeAsyncService')
    let promise = svc.getAsyncRedirectTo(trans.params.foo);
    return promise;
  }
})
```

##### `onEnter`: TransitionStateHookFn
A Transition Hook function called with the state is being entered. See: [`IHookRegistry.onEnter`](https://ui-router.github.io/docs/latest/interfaces/transition.ihookregistry.html#onenter).

```jsx
const state = {
  name: 'mystate',
  onEnter: (trans, state) => {
    console.log("Entering " state.name);
  }
}
```

Note: The above `onEnter` on the state declaration is effectively sugar for:
```jsx
router.transitionService.onEnter({ entering: 'mystate' }, (trans, state) => {
  console.log("Entering " + state.name); }
);
```

##### `onExit`: TransitionStateHookFn
A Transition Hook called with the state is being exited. See: [`IHookRegistry.onExit`](https://ui-router.github.io/docs/latest/interfaces/transition.ihookregistry.html#onexit)

```jsx
const state = {
  name: 'mystate',
  onExit: (trans, state) => {
    console.log("Leaving " + state.name);
  }
}
```

Note: The above `onExit` on the state declaration is effectively sugar for:
```jsx
router.transitionService.onExit({ exiting: 'mystate' }, (trans, state) => {
  console.log("Leaving " + state.name);
});
```

##### `onRetain`: TransitionStateHookFn
A Transition Hook called with the state is being retained/kept. See: [`IHookRegistry.onRetain`](https://ui-router.github.io/docs/latest/interfaces/transition.ihookregistry.html#onretain)

```jsx
const state = {
  name: 'mystate',
  onRetain: (trans, state) => {
    console.log(state.name + " is still active!");
  }
}
```

Note: The above `onRetain` on the state declaration is effectively sugar for:
```jsx
router.transitionService.onRetain({ retained: 'mystate' }, (trans, state) => {
  console.log(state.name + " is still active!");
});
```

##### `resolve`: Array<Resolvable | ResolvableLiteral | ProviderLike> | object
The `resolve:` property defines data (or other dependencies) to be fetched asynchronously when the state is being entered.
After the data is fetched, it can be used in views, transition hooks or other resolves that belong to this state, or to any views or resolves that belong to nested states.

###### As array
Each array element should either be a [ResolvableLiteral](https://ui-router.github.io/docs/latest/interfaces/resolve.resolvableliteral.html) object (a plain old javascript object),

```js
...
resolve: [{
  // `myStateDependency` will be injected into the component props as "abc"
  token: 'myStateDependency',
  resolveFn: () => 'abc'
}]
```

###### As an object
- The key (string) is the name of the dependency.
- The value (function) is an injectable function which returns the dependency, or a promise for the dependency.

```jsx
resolve: {
  // `myStateDependency` will be injected into the component props as "abc"
  myStateDependency: () => 'abc'
}
```

###### Lifecycle
Since a resolve function can return a promise, the router will delay entering the state until the  promises are ready.
If any of the promises are rejected, the Transition is aborted with an Error.

By default, resolves for a state are fetched just before that state is entered.
Note that only states which are being *entered* have their resolves fetched.
States that are "retained" do not have their resolves re-fetched.
If you are currently in a parent state `A` and are transitioning to a child state `A.B`, the previously resolved data for state `A` can be injected into `A.B` without delay.

Any resolved data for `A.B` is retained until `A.B` is exited, e.g., by transitioning back to the parent state `A`.

Because of this, resolves are a great place to fetch your application's primary data.

###### Injecting resolves
Resolves are automatically injected in State Component via `props`.
Resolves can be injected into other resolves.

Since resolve functions are injected, a common pattern is to inject a custom service such as `userService` and delegate to a custom service method, such as `userService.list()`;

You can use the `resolve` machanism to inject services in other `resolves` and components.

```js
const userService = new UserService();
...
// Injecting a resolve into another resolve
resolve: [
  // Define a resolve userService
  { token: 'userService', resolveFn: () => userService }
  // Define a resolve 'allusers' which delegates to the UserService.list()
  // which returns a promise (async) for all the users
  { token: 'allusers', resolveFn: (userService) => userService.list(), deps: [userService] },
  // Define a resolve 'user' which depends on the allusers resolve.
  // This resolve function is not called until 'allusers' is ready.
  { token: 'user', resolveFn: (allusers, trans) => _.find(allusers, trans.params().userId, deps: ['allusers', '$transition$'] }
}
```

##### `resolvePolicy`: ResolvePolicy
This should be an ResolvePolicy object.

It can contain the following optional keys/values:

- `when`: (optional) defines when the resolve is fetched. Accepted values: "LAZY" or "EAGER"
- `async`: (optional) if the transition waits for the resolve. Accepted values: "WAIT", "NOWAIT", "RXWAIT"

See [ResolvePolicy](https://ui-router.github.io/docs/latest/interfaces/resolve.resolvepolicy.html) for more details.

##### `url`: string
A URL fragment (with optional parameters) which is used to match the browser location with this state.

This fragment will be appended to the parent state's URL in order to build up the overall URL for this state. See [UrlMatcher](https://ui-router.github.io/docs/latest/classes/url.urlmatcher.html) for details on acceptable patterns.

```js
url: "/home"
// Define a parameter named 'userid'
url: "/users/:userid"
// param 'bookid' has a custom regexp
url: "/books/{bookid:[a-zA-Z_-]}"
// param 'categoryid' is of type 'int'
url: "/books/{categoryid:int}"
// two parameters for this state
url: "/books/{publishername:string}/{categoryid:int}"
// Query parameters
url: "/messages?before&after"
// Query parameters of type 'date'
url: "/messages?{before:date}&{after:date}"
// Path and query parameters
url: "/messages/:mailboxid?{before:date}&{after:date}"
```

##### `views`: object
An optional object which defines multiple views, or explicitly targets specific named `<UIViews>`.

```js
views: {
  header: Header,
  body: Body,
  footer: Footer
}
```

```js
// Targets named <UIView name="header"> from ancestor state 'top''s template, and
// named <UIView name="body"> from parent state's template.
views: {
  'header@top': MsgHeader,
  'body': Messages
}
```

## Components

### `<UIRouter>`

Main router component that handles router instance and initialization.

```jsx
render(
  <UIRouter plugins={[•••]} states={[•••]}>
    <UIView />
  </UIRouter>,
  document.getElementById('root')
);
```

#### Props

##### `children`: element

You may define a single child element. Descendants of this component will have access to the router instance via React context.

##### `plugins`: array

Plugins to apply to the router instance. By default, the component applies the `servicesPlugin` which is in charge of handling the DI mechanism as well as the promises implementation.

In order for the router to work, you need to specify a location plugin.
The library by default provides three location implementation plugins: `hash`, `pushState` and `memory`.

There are other plugins that extend the router base functionalities and you can also write your own plugin.

##### `states`: array

You may provide an array of state definition that are registered right after the router is initialized.

##### `config`: function

THe config prop accepts a function that will be called with the newly router instance as argument.
You can use this function to configure the router:

```jsx
const configRouter = router => {
  router.urlRouter.otherwise("/home");
}

render(
  <UIRouter plugins={[•••]} states={[•••]} config={configRouter}>
    <UIView />
  </UIRouter>,
  document.getElementById('root')
);
```

##### `router`: UIRouterReact

Since UI-Router is framework agnostic, you can set-up the router manually in "vanilla" ui-router, and pass the instance to the component.
This way the component will skip the previous props and just use the provided instance.

```jsx
import {UIRouterReact, UIRouter, UIView, servicesPlugin, pushStateLocationPlugin} from 'ui-router-react';

const someState = { name: 'some', url: '', component: SomeComponent };
// create instance
const router = new UIRouterReact();
// activate plugins
router.plugin(servicesPlugin);
router.plugin(pushStateLocationPlugin);
// register states
router.stateRegistry.register(someState);
// start the router
router.start();

ReactDOM.render(
  <UIRouter router={router}>
    <UIView />
  </UIRouter>,
  document.getElementById("root")
);
```

> NB: since you are manually bootstrapping the router, you must register the `servicesPlugin` as well as the location plugin of your choice (in this example the `pushStateLocationPlugin`).

### `<UIView>`

The view component renders your state components when a state is active. It must be a descendant of `<UIRouter>` component in order to work.

```jsx
render(
  <UIRouter {•••}>
    <UIView/>
  </UIRouter>,
  document.getElementById('root')
);
```

#### Props

##### `children`: element
You may define a single child element that will be rendered while the view is not activated by a state.

```jsx
<UIView>
  <div>Loading...</div>
</UIView>
```

If no child is provided it renders an empty `<div></div>`.

##### `name`: string
A view name. The name should be unique amongst the other views in the same state.
You can have views of the same name that live in different states.

##### `className`: string
If a `className` is provided il will be passed as `prop` to the rendered component (ot the empty `<div></div>` when inactive).

##### `style`: object
Just like `className`, when defining a `style`, the object is passed down as `prop` to the rendered component.


### `<UISref>`
This component binds its child component to a state.
If the state has an associated URL, it will automatically generate and update the `href`.
Clicking the child component will trigger a state transition with optional parameters.

```jsx
// state definition
const state = {
  name: 'catalog',
  url: '/shop/catalog?productId',
  component: Catalog
}

// UISref component
<UISref to="catalog" params={{productId:103}}>
  <a>Product 103</a>
</UISref>

// rendered dom
<a href="#/shop/catalog?productId=103">Product 103</a>
```

#### Props

#### `children`: component
You have to define a single child that will receive the `onClick` event handler and the `href` attribute (if present). The child component can be anything.

#### `to`: string (required)
Any valid absolute or relative state name.

#### `params`: object
Optional state parameters for the transition.

#### `options`: object
[Transition options](https://ui-router.github.io/docs/latest/interfaces/transition.transitionoptions.html) object.

#### `className`: string
The `className` string will be properly merged into its child `className` prop.


### `<UISrefActive>`
A component working alongside the `<UISref>` to add classes to its child element when one of the included `<UISref>`'s state is active, and removing them when it is inactive.

The primary use-case is to simplify the special appearance of navigation menus relying on `<UISref>`, by having the "active" state's menu button appear different, distinguishing it from the inactive menu items.

It will register **every** nested `<UISref>` and add the class to its child every time one of the states is active.

```jsx
<UISrefActive class="active-item">
  <UISref to="homestate"><a class="menu-item">Home</a></UISref>
</UISrefActive>

// rendered when state is inactive
<a href="/path/to/homestate" class="menu-item">Home</a>

// rendered when state is active
<a href="/path/to/homestate" class="menu-item active-item">Home</a>
```

#### Props

##### `class`: string (required)
The class string to append when the state is active (i.e. `"active menu-item-active"`)

#### `children`: element (required)
The element on which to add the active class. Since `<UISref>` passes the `className` prop down to its child, having a single `<UISref>` as child works as expected.

## State Components
State components are rendered by the `<UIView>` component(s) when the state is active. `<UIView>` will inject the following props:

#### Injected Props

##### `resolves`: object
The resolves injected by the DI system. Any `resolve` value of the state (and its ancestors) will be rendered as attribute.

UI-Router React automatically injects a special resolve `$transition$` object.

##### `transition`: Transition
The [transition](https://ui-router.github.io/docs/latest/classes/transition.transition-1.html) of the active state. Same as `$transition$` resolve.

##### `className`: string
If a `className` is specified provided for the `<UIView>` will be injected.

##### `style`: object
If a `style` is specified provided for the `<UIView>` will be injected.

## Transitions
Represents a transition between two states.

When navigating to a state, we are transitioning from the current state to the new state.

This object contains all contextual information about the to/from states, parameters, resolves. It has information about all states being entered and exited as a result of the transition.

The transitions are always inject in the state components via the `transition` prop.

Take a look at the [Transition Class](https://ui-router.github.io/docs/latest/classes/transition.transition-1.html) for more info.

## Plugins

Plugins are a handy way to extend UI-Router functionalities. The router internally uses a DI mechanism as well as a Promise implementation.
Both are implemented as the `servicesPlugin`.

Location implementation are also implemented as plugins:

### `pushStateLocationPlugin`

Location strategy via html5 `pushState` API.

### `hashLocationPlugin`

Location strategy via url hash portion (i.e. `myurl.com/#/home`).

### `memoryLocationPlugin`

Location strategy via in-memory object, useful for environments where a location is not present (server-side code for SSR).

## Utilities

### `trace`
Prints UI-Router Transition trace information to the console.

```jsx
// enable transition trace
trace.enable("TRANSITION");

// check if trace is enabled
trace.enabled("TRANSITION"); // returns true

// disable transition trace
trace.disable("TRANSITION");
```

#### Methods
##### `enable(...categories: Category[])`: void
Enables a trace. If `categories` is omitted, all categories are enabled.
Also takes strings (category name) or ordinal (category position)

```
RESOLVE = 0,
TRANSITION = 1,
HOOK = 2,
UIVIEW = 3,
VIEWCONFIG = 4,
```

##### `disable(...categories: Category[])`: void
Disables a trace. If `categories` is omitted, all categories are disabled. Also takes strings (category name) or ordinal (category position).

##### `enabled(category: Category)`: boolean
Retrieves the enabled status of a Category.
