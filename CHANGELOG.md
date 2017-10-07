## 0.5.3 (2017-10-07)
[Compare `@uirouter/react` versions 0.5.2 and 0.5.3](https://github.com/ui-router/react/compare/0.5.2...0.5.3)


## Updates `@uirouter/core` from 5.0.7 to 5.0.10 (2017-10-07)
[Compare `@uirouter/core` versions 5.0.7 and 5.0.10](https://github.com/ui-router/core/compare/5.0.7...5.0.10)

### Bug Fixes

* **angular/cli:** Use package.json fields: 'typings', 'main', 'jsnext:main' ([74143d9](https://github.com/ui-router/core/commit/74143d9))
* **bundle:** Rollup: Do not warn on THIS_IS_UNDEFINED ([a4581b1](https://github.com/ui-router/core/commit/a4581b1))
* **isomorphic:** Remove use of CustomEvent. Detect root scope (global/window/self) for nodejs, browser, or web-worker. ([2d206ba](https://github.com/ui-router/core/commit/2d206ba))
* **redirectTo:** Fix typings for redirectTo. Allow a function that returns a target state or a promise for one. ([3904487](https://github.com/ui-router/core/commit/3904487))
* **typings:** Use StateObject for parameter to hook criteria functions ([5b58566](https://github.com/ui-router/core/commit/5b58566))


### Features

* **TargetState:** Add builder methods .withState, .withParams, and .withOptions ([6b93142](https://github.com/ui-router/core/commit/6b93142))
* **TransitionHook:** Add hook registration option `invokeLimit` to limit the number of times a hook is invoked before being auto-deregistered. ([2cb17ef](https://github.com/ui-router/core/commit/2cb17ef))



## `@uirouter/react` 0.5.2 (2017-09-23)
[Compare `@uirouter/react` versions 0.5.1 and 0.5.2](https://github.com/ui-router/react/compare/0.5.1...0.5.2)

### Bug Fixes

* **sourcemaps:** Embed sources in sourcemaps ([62d84ea](https://github.com/ui-router/react/commit/62d84ea))


Changes to `@uirouter/core`:
[Compare `@uirouter/core` versions 5.0.5 and 5.0.7](https://github.com/ui-router/core/compare/5.0.5...5.0.7)

### Bug Fixes

* **globals:** Use shallow copy to update the globals.params / $state.params object ([e883afc](https://github.com/ui-router/core/commit/e883afc))
* **Injector:** When getting tokens from native injector, only throw on undefined (not on falsey values) ([ada9ca2](https://github.com/ui-router/core/commit/ada9ca2))
* **sourceMaps:** Embed typescript sources in sourcemaps ([10558a3](https://github.com/ui-router/core/commit/10558a3))
* **trace:** Fall back to console.log if .table is unavailable (IE) ([c8110fc](https://github.com/ui-router/core/commit/c8110fc))
* **trace:** Support tracing of object-parameters with circular references ([2f1ae9a](https://github.com/ui-router/core/commit/2f1ae9a))
* **typescript:** Fix strictNullCheck type error ([0ae585e](https://github.com/ui-router/core/commit/0ae585e))
* **url:** Add CustomEvent polyfill for IE ([a50db21](https://github.com/ui-router/core/commit/a50db21))
* **urlRouter:** Fix absolute 'href' generation by using location.hostname (not location.host) ([a28b68a](https://github.com/ui-router/core/commit/a28b68a))
* **urlService:** Fix priority sorting of URL rules ([73a1fe0](https://github.com/ui-router/core/commit/73a1fe0))
* **vanilla:** fix base path handling for vanilla push state ([ad61d74](https://github.com/ui-router/core/commit/ad61d74))
* **vanilla:** Use `self` instead of `window` for webworker compat ([a4629ee](https://github.com/ui-router/core/commit/a4629ee))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/ui-router/react/compare/0.5.0...v0.5.1) (2017-07-03)

This release updates `@uirouter/core` from 5.0.3 to 5.0.5

## Changes in `@uirouter/core` between versions [5.0.3 and 5.0.5](https://github.com/ui-router/core/compare/5.0.3...5.0.5) (2017-07-03)

### Bug Fixes

* **future:** Allow future states to specify a `parent:` ([828fe1b](https://github.com/ui-router/core/commit/828fe1b))
* **typescript:** Update to typescript 2.4 ([ce1669b](https://github.com/ui-router/core/commit/ce1669b))
* **view:** only sync views which are of the same name *and type* ([c48da4a](https://github.com/ui-router/core/commit/c48da4a))


### Features

* **invalidTransition:** Better error messaging when param values are invalid ([2a15d1a](https://github.com/ui-router/core/commit/2a15d1a))
* **Resolvable:** Add `.value()`: returns value (WAIT) or promise (NOWAIT) ([8769449](https://github.com/ui-router/core/commit/8769449))
* **trace:** Trace view synchronization. Allow trace.enable(...string) ([284392d](https://github.com/ui-router/core/commit/284392d))
* **urlMatcher:** add support for multiline urls ([5b11ce0](https://github.com/ui-router/core/commit/5b11ce0))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ui-router/react/compare/0.4.0...v0.5.0) (2017-05-24)


### Bug Fixes

* **UIRouter:** Apply config before registering states ([75f169a](https://github.com/ui-router/react/commit/75f169a))
* **rollup:** Allow rollup to process 'import * as classNames' ([8434883](https://github.com/ui-router/react/commit/8434883)), closes [#33](https://github.com/ui-router/react/issues/33)


### Features

* export everything from core alongside the react stuff ([6d0b49b](https://github.com/ui-router/react/commit/6d0b49b)), closes [#41](https://github.com/ui-router/react/issues/41)
* **UIView:** add render prop API ([1047b84](https://github.com/ui-router/react/commit/1047b84)), closes [#35](https://github.com/ui-router/react/issues/35) [#26](https://github.com/ui-router/react/issues/26) [#13](https://github.com/ui-router/react/issues/13)


### BREAKING CHANGES

* UIView: Rename `Resolves` interface to `UIViewResolves` for
consistency.
* UIView: Rename `InjectedProps` interface to `UIViewResolves`
for consistency.



### @uirouter/core changes
## [5.0.3](https://github.com/ui-router/core/compare/3.1.0...5.0.3) (2017-05-24)


### Bug Fixes

* **BrowserLocationConfig:** fixed protocol + port value ([#38](https://github.com/ui-router/core/issues/38)) ([5559382](https://github.com/ui-router/core/commit/5559382))
* **TransitionHook:** Transition hooks no longer expose the internal StateObject ([2b0e48b](https://github.com/ui-router/core/commit/2b0e48b))
* **common:** Fix implementation of 'pick' -- use hasOwnProperty ([09848a4](https://github.com/ui-router/core/commit/09848a4))
* **common:** Re-fix implementation of 'pick' using for .. in ([f2da7f4](https://github.com/ui-router/core/commit/f2da7f4))
* **lazyLoad:** Allow `lazyLoad` stateBuilder: Get lazyLoad fn from internal State object, not StateDeclaration ([9313880](https://github.com/ui-router/core/commit/9313880))
* **lazyLoad:** Wait for future state to be replaced before registering lazy children ([4bdce47](https://github.com/ui-router/core/commit/4bdce47))
* **noImplicitAny:** Fix noimplicitany compliance ([1a6cdfc](https://github.com/ui-router/core/commit/1a6cdfc))
* **pushStateLocation:** call listeners in url() ([#24](https://github.com/ui-router/core/issues/24)) ([7c90911](https://github.com/ui-router/core/commit/7c90911)), closes [#23](https://github.com/ui-router/core/issues/23)
* **redirect:** Do not update URL after redirect with { location: false } ([652a760](https://github.com/ui-router/core/commit/652a760))
* **resolve:** Allow resolve's state context to be injected as `$state$` ([a06948b](https://github.com/ui-router/core/commit/a06948b))
* **tfs:** Rename $q.ts and $injector.ts files, removing leading dollar signs ([cb653ee](https://github.com/ui-router/core/commit/cb653ee))
* **trace:** Re-add transitionStart trace ([b019036](https://github.com/ui-router/core/commit/b019036))
* **transition:** Do not ignore transitions which have states being entered or exited ([175717e](https://github.com/ui-router/core/commit/175717e))
* **transitionHook:** Do not process transition hooks after router has been disposed. ([666c6d7](https://github.com/ui-router/core/commit/666c6d7))
* **typings:** Allow strictNullChecks for HookMatchCriteria ([d92d4d5](https://github.com/ui-router/core/commit/d92d4d5))
* **ui-sref:** Improve performance of generating hrefs ([c3967bd](https://github.com/ui-router/core/commit/c3967bd))
* **view:** Do not throw when uiView doesn't have a state context ([f76ee2a](https://github.com/ui-router/core/commit/f76ee2a))
* **view:** Update views in order of ui-view depth and also by state depth ([46dea2b](https://github.com/ui-router/core/commit/46dea2b))


### Features

* **Globals:** implement Disposable and delete global transition data ([a794018](https://github.com/ui-router/core/commit/a794018))
* **Rejection:** Add $id to ease debugging of transition rejections ([d456d54](https://github.com/ui-router/core/commit/d456d54))
* **State:** Support registration of ES6 state classes (as opposed to object literals) ([3a5d055](https://github.com/ui-router/core/commit/3a5d055))
* **State:** Switch Internal State Object to prototypally inherit from the State Declaration ([027c995](https://github.com/ui-router/core/commit/027c995)), closes [#34](https://github.com/ui-router/core/issues/34)
* **StateObject:** Rename internal `State` object to `StateObject` ([feceaf9](https://github.com/ui-router/core/commit/feceaf9))
* **StateRegistry:** improve perf for: `.register()` and `StateMatcher.find()` misses ([fdb3ab9](https://github.com/ui-router/core/commit/fdb3ab9))
* **Transition:** Normalize all transition errors to a Rejection. ([a7464bb](https://github.com/ui-router/core/commit/a7464bb))
* **Transition:** deprecate `Transition.is()` which was never implemented ([1edff4b](https://github.com/ui-router/core/commit/1edff4b))
* **UIRouter:** Add `trace` global to the `UIRouter` object ([48c5af6](https://github.com/ui-router/core/commit/48c5af6))
* **UrlService:** (`UrlRouter`) improve perf of registering Url Rules and sorting Url Rules ([64fbfff](https://github.com/ui-router/core/commit/64fbfff))
* **UrlService:** Add `rules.initial("/home")` to config initial state (like otherwise) ([bbe4209](https://github.com/ui-router/core/commit/bbe4209))
* **View:** Allow targeting views on own state using `viewname@.` (normalizeUIViewTarget) ([7078216](https://github.com/ui-router/core/commit/7078216)), closes [#25](https://github.com/ui-router/core/issues/25)
* **abort:** Add API to manually abort/cancel a transition ([39f8a53](https://github.com/ui-router/core/commit/39f8a53))
* **build:** Build and distribute UMD bundles ([0a8da85](https://github.com/ui-router/core/commit/0a8da85))
* **common:** Perf improvements in hot functions: ([4193244](https://github.com/ui-router/core/commit/4193244))
* **core:** Export all vanilla.* code from `ui-router-core` ([f3392d1](https://github.com/ui-router/core/commit/f3392d1))
* **core:** Switch to [@uirouter](https://github.com/uirouter)/core npm module ([e3f389f](https://github.com/ui-router/core/commit/e3f389f))
* **decorators:** Add state, resolve and resolve data decorators ([642df0b](https://github.com/ui-router/core/commit/642df0b))
* **defaultErrorHandler:** Do not invoke default error handler for ABORTED transitions ([b07a24b](https://github.com/ui-router/core/commit/b07a24b))
* **globals:** Removed `UIRouterGlobals` interface. Renamed `Globals` class to `UIRouterGlobals` ([8719334](https://github.com/ui-router/core/commit/8719334))
* **onBefore:** Run onBefore hooks asynchronously. ([30b82aa](https://github.com/ui-router/core/commit/30b82aa))
* **onEnter/Exit/Retain:** Use onExit/onEnter/onRetain from 56955state(), not state.self ([bc1f554](https://github.com/ui-router/core/commit/bc1f554))
* **transition:** Ignore duplicate transitions (double clicks) ([bd1bd0b](https://github.com/ui-router/core/commit/bd1bd0b))
* **transition:** Improve supersede logic: Do not supersede if the new trans is aborted before onStart ([3141a8f](https://github.com/ui-router/core/commit/3141a8f))
* **transition:** Run hooks synchronously in current stack, when possible ([953e618](https://github.com/ui-router/core/commit/953e618))


### BREAKING CHANGES

### **TransitionHook:** Transition hooks no longer expose the internal `State` object (now named `StateObject`)

#### Before:

```js
import { State } from "ui-router-core";
const match = { to: (state: State) => state.data.auth };
transitionsvc.onEnter(match, (trans: Transition, state: State) => {
  // state is the internal State object
  if (state.includes["foo"]) { // internal ui-router API
    return false;
  }
}
```

#### Now:

```js
import { StateDeclaration } from "@uirouter/react";
const match = { to: (state: StateDeclaration) => state.data.auth };
transitionsvc.onEnter(match, (trans: Transition, state: StateDeclaration) => {
  // state === the state object you registered
  // Access internal ui-router API using $$state()
  if (state.$$state().includes["foo"]) {
    return false;
  }
}
```

#### Motivation:

The `State` object (now named `StateObject`) is an internal API and should not be exposed via any public APIs.
If you depend on the internal APIs, you can still access the internal object by calling `state.$$state()`.

### **StateObject:** Renamed internal API `State` object to `StateObject`

#### Before:

```js
import {State} from "ui-router-core";
```

#### Now:

```js
import {StateObject} from "@uirouter/react";
```

#### Motivation:

We'd like to use the `State` name/symbol as a public API.  It will be an
ES7/TS decorator for ES6/TS state definition classes, i.e:

```js
@State("foo")
export class FooState implements StateDeclaration {
  url = "/foo";
  component = FooComponent;

  @Resolve({ deps: [FooService] })
  fooData(fooService) {
    return fooService.getFoos();
  }
}
```

### **Transition:** All Transition errors are now wrapped in a Rejection object.

#### Before:

Previously, if a transition hook returned a rejected promise:
```js
.onStart({}, () => Promise.reject('reject transition'));
```

In `onError` or `transtion.promise.catch()`, the raw rejection was returned:
```js
.onError({}, (trans, err) => err === 'reject transition')
```

#### Now:

Now, the error is wrapped in a Rejection object.

- The detail (thrown error or rejected value) is still available as `.detail`.

```js
.onError({}, (trans, err) =>
    err instanceof Rejection && err.detail === 'reject transition')
```

- The Rejection object indicates the `.type` of transition rejection (ABORTED, ERROR, SUPERSEDED and/or redirection).
```js
.onError({}, (trans, err) => {
  err.type === RejectType.ABORTED === 3
});
```

#### Motivation:

Errors *thrown from* a hook and rejection values *returned from* a hook can now be processed in the same way.

### **onBefore:** `onBefore` hooks are now run asynchronously like all the other hooks.

#### Old behavior

Previously, the `onBefore` hooks were run in the same stackframe as `transitionTo`.
If they threw an error, it could be caught using try/catch.

```js
transitionService.onBefore({ to: 'foo' }), () => { throw new Error('doh'); });
try {
  stateService.go('foo');
} catch (error) {
  // handle error
}
```

#### New behavior

Now, `onBefore` hooks are processed asynchronously.
To handle errors, use any of the async error handling paradigms:

- Chain off the promise
  ```js
  transitionService.onBefore({ to: 'foo' }), () => { throw new Error('doh'); });
  stateService.go('foo').catch(error => { //handle error });
  ```
- Define an error handler
  ```js
  transitionService.onBefore({ to: 'foo' }), () => { throw new Error('doh'); });
  transitionService.onError({ to: 'foo' }), () => { // handle error });
  stateService.go('foo');
  ```
- Use the global defaultErrorHandler
  ```js
  transitionService.onBefore({ to: 'foo' }), () => { throw new Error('doh'); });
  stateService.go('foo');
  stateService.defaultErrorHandler(error => { // global error handler });
  ```

#### Motivation

Why introduce a BC?

- No subtle behavior differences by hook type
- Simpler code and mental model
- Fewer edge cases to account for

### **defaultErrorHandler:** ABORTED transitions do not invoke the `defaultErrorHandler`

Returning `false` from a transition hook will abort the transition.

#### Old behavior

Previously, this case was considered an error and was logged by
`defaultErrorHandler`.
After your feedback, we agree that this is not typically an error.

#### New behavior

Now, aborted transitions do not trigger the `defaultErrorHandler`

#### Motivation

Most users do not consider ABORT to be an error.  The default error
handler should match this assumption.

# [0.4.0](https://github.com/ui-router/react/releases/tag/0.4.0) (2017-01-10)
Version 0.4.0 is based on ui-router-ore 3.1.0 and as such introduced a lot of new features/fixes alongside some breaking changes.

[[full ui-router-core 3.0.0 changelog]](https://github.com/ui-router/core/blob/master/CHANGELOG.md#300-2017-01-08)

### Breaking Changes
- **html5Mode()**: deprecated in favor of `pushStateLocationPlugin`.

### Changed
- **ui-router-core**: Updated to version `3.1.0` [(91661b1)](https://github.com/ui-router/react/commit/91661b19e8dbd9ba5fb9420c1e51c9af25598185).

### Add
- **UIRouter**: Add new `UIRouter` component for handling router instance and declarative bootstrapping [(9b59d68)](https://github.com/ui-router/react/commit/9b59d68b742478de98c011ad87435cc67f82ce7c).

[Take a look at the guide for upgrading from `0.3.0` to `0.4.0`](https://github.com/ui-router/react/blob/master/docs/upgrading-from-0.3.x-to-0.4.x.md)

# [0.3.0](https://github.com/ui-router/react/releases/tag/0.3.0) (2016-09-19)
### Breaking Changes
1) State Glob patterns have been changed slightly.

    Previously, a single wildcard `foo.*` could match "missing segments" on the end of a state name.
    For example, `foo.*` would match the state `foo`.
    Likewise, `foo.*.*.*` would also match the `foo` state.

    Now, a single wildcard matches exactly one segment. 
    `foo.*` will match `foo.bar` and `foo.baz`, but neither `foo` nor `foo.bar.baz`.

    If you previously relied on the single wildcard to match missing segments, use a double wildcard, `foo.**`.

    Double wildcards match 0 or more segments.

    [Read more about Glob matching](https://ui-router.github.io/docs/latest/classes/common.glob.html)

2) (obscure) Renamed `Transition.previous()` to `Transition.redirectedFrom()`
3) (obscure) Location provider: remove `url(url)` and `replace()` in favor of `setUrl(url, replace)`.

[[full ui-router-core 1.0.0-beta.2 changelog]](https://github.com/angular-ui/ui-router/blob/master/CHANGELOG.md#100-beta2-2016-09-09).

### Changed
- **ui-router-core**: Updated to version `1.0.0-beta.2` [(9ad732e)](https://github.com/ui-router/react/commit/9ad732ef1c47cbdf4d5feae3b378ec571bef6685)
- **UMD**: The UMD build is exported as `window.UIRouterReact` instead of `window.ui-router-react`. [(68ebd4c)](https://github.com/ui-router/react/commit/68ebd4c62839680204c7c009ee0e9917b3af01b8)

### Fix
- **uiCanExit**: Remove `uiCanExit` hook `setTimeout` wrapper that prevents hook from being called when state is entered and exited synchronously [(82bad02)](https://github.com/ui-router/react/commit/82bad02e4bab7b44b682294401e4df36f35b5610).
- **UISref**:
    - Fix right-click / meta+click behaviour (open in a new tab) on UISref tags [(9a45de1)](https://github.com/ui-router/react/commit/9a45de18aa079356eab4d4b08644da38fbf5e425).
    - Add call to deregister function when component is unmounted [(0740825)](https://github.com/ui-router/react/commit/0740825e53a04462dd6a049d6a33fcf9945c987b).
- **UISrefActive**: Fix state info deregister function [(b6c93b5)](https://github.com/ui-router/react/commit/b6c93b569f2d96067dc5e65c809c6cb74ac4274e).
- **UMD**: The UMD build now looks react as `window.React` instead of `window.react`. [(68ebd4c)](https://github.com/ui-router/react/commit/68ebd4c62839680204c7c009ee0e9917b3af01b8)

# [0.2.3](https://github.com/ui-router/react/releases/tag/0.2.3) (2016-08-23)
### Added
- **UIView**: Pass down to rendered element/component `className` and `style` props (if defined) [(52e4132)](https://github.com/ui-router/react/commit/52e41325041439c68daa42cc5b4449734d289788).

# [0.2.2](https://github.com/ui-router/react/releases/tag/0.2.2) (2016-08-03)
### Fix
- **UISrefActive**: register stateChange callback for proper rendering [(634e9d1)](https://github.com/ui-router/react/commit/634e9d174f0186db9a1fa6b0c3468395d3c846f5)
- **UISref**: doesn't need to be nested inside a UIView in order to work [(3c00270)](https://github.com/ui-router/react/commit/3c00270928c1fc2d98821e95903e73d96b5ec967)

# [0.2.0](https://github.com/ui-router/react/releases/tag/0.2.0) (2016-08-02)
### Changed
- Module default export is now the `UIRouterReact` class. It takes now care of setting up the `viewConfigFactory` and `reactViewBuilder` so user doesn't need to.
- Renamed all symbols to UI* from Ui* for consistency with `ui-router-core`.
- `UISref` only accepts a single valid element as child.
- `UISrefActive` properly track multiple descendants `UISref` component and track their specified states for applying the active class.

### Added
- `UISref` and `UISrefActive` properly copy over all props and class names of thir children, adding more flexibility for the user.
- `UIView` rendered component exposes two props from the router: `resolves` and `transition`. They act as an injected dependecy of the state-component, and are used to interact with the router itself.
- `UIView` registers as `onBefore` hook the `uiCanExit` method of the component instance it renders.
- `UISrefActive`: by passing a `extact={true}` props it will only activate when the exact target state used in the `UISref` is active.
- `html5Mode` added to UIRouterReact class for using `pushStateLocation` instead of `hashLocation` as history strategy (WARNING: This is a temporary api and will likely change in the future)


# [0.1.2]() (2016-07-18)
### Fix
- Removed file extension preventing compiled code to work properly.


# [0.1.1]() (2016-07-18)
### Added
- Typings are specified by `typings.json` file and must be installed using typings CLI.
- Added `es6-shim` for Promises.


# [0.1.0]() (2016-07-14)
### First Release
- First alpha release of `ui-router-react`
