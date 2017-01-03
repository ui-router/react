# Upgrading from `0.3.x` to `0.4.x`

- [Bootstrapping](#bootstrapping)
- [Plugins](#plugins)
- [Lazy-loading](#lazy-loading)
- [`onCreate` hook](#oncreate-hook)

## Bootstrapping

### New `UIRouter` component

In order to provide a simpler API the new `<UIRouter>` component is introduced in version `0.4.0`.

In the previous versions you needed to initialize UI-Router manually, by creating a new instance, register your states and start the router.

The new `UIRouter` component takes care of initializing the router for you, as well as provide some useful props to define your states and plugins.

**before:**

```jsx
import UIRouterReact, {UIView} from 'ui-router-react';

const someState = { name: 'some', url: '', component: SomeComponent };
const router = new UIRouterReact();
router.stateRegistry.register(someState);
router.html5Mode(true);
router.start();

ReactDOM.render(
  <UIView />,
  document.getElementById("root")
);
```

**after:**

```jsx
import {UIRouter, UIView, pushStateLocationPlugin} from 'ui-router-react';

const someState = { name: 'some', url: '', component: SomeComponent };

ReactDOM.render(
  <UIRouter plugins={[pushStateLocationPlugin]} states={[someState]}>
    <UIView />
  </UIRouter>,
  document.getElementById("root")
);
```

### Manual Bootstrapping

While the new `UIRouter` component adds a cleaner and simpler API, you may want to bootstrap the router manually.

In order to do that you can create a router instance just as before and pass the instance to the component via prop:

```jsx
import {UIRouterReact, UIRouter, UIView, servicesPlugin, pushStateLocationPlugin} from 'ui-router-react';

const someState = { name: 'some', url: '', component: SomeComponent };
const router = new UIRouterReact();
router.plugin(servicesPlugin);
router.plugin(pushStateLocationPlugin);
router.stateRegistry.register(someState);
router.start();

ReactDOM.render(
  <UIRouter router={router}>
    <UIView />
  </UIRouter>,
  document.getElementById("root")
);
```

> NB: since you are manually bootstrapping the router, you must register the `servicesPlugin` as well as the location plugin of your choice (in this example the `pushStateLocationPlugin`).

## Plugins

UI-Router Core 2.0 introduced the `plugin` APIs for easily extend the router functionalities.
The core services as well as the location strategy has been implemented as plugins.

The `ui-router-react` package exports by default the following plugins:

|Name|Description|
|----|-----------|
|`hashLocationPlugin`|Location strategy via url hash portion (i.e. `myurl.com/#/home`)|
|`pushStateLocationPlugin`|Location strategy via html5 `pushState` API (most common set-up)|
|`memoryLocationPlugin`|Location strategy via in-memory object, useful for environments where a location is not present (i.e. node)|
|`servicesPlugin`|Core services that implement the dependency injection mechanism as well as the promises functionality|

As the location strategies are implemented as plugin, the `.html5()` is now deprecated.

The router instance offers a `.plugin()` method in order to apply the plugins you need:

```jsx
const router = new UIRouterReact();
router.plugin(servicesPlugin);
router.plugin(pushStateLocationPlugin);
```

```jsx
<UIRouter plugins={[pushStateLocationPlugin]} states={[someState]}>
  <UIView />
</UIRouter>
```

> NB: as already mentioned, the `<UIRouter>` component applies the `servicesPlugin` for you, while you **need** to do it yourself in case of manual bootstrapping.

## Lazy-loading

Previously, a state with a `lazyLoad` function was considered a future state. Now, a state whose name ends with `.**` (i.e., a glob pattern which matches all children) is a future state.

**before:**

```js
{ name: 'future', url: '/future', lazyLoad: () => ... }
```

**after:**

```js
{ name: 'future.**', url: '/future', lazyLoad: () => ... }
```

## `onCreate` hook

Hook errors are all normalized to a "Rejection" type. To access the detail of the error thrown (`throw "Error 123"`), use `.detail`, i.e.:

**before:**

```js
router.stateService.go('foo').catch(err => { if (err === "Error 123") .. });
```

**after:**

```js
router.stateService.go('foo').catch(err => { if (err.detail === "Error 123") .. });
```

---

[Read more about the changes in ui-router-core 2.0.0](https://github.com/ui-router/core/blob/master/CHANGELOG.md#200-2016-12-09)