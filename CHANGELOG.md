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