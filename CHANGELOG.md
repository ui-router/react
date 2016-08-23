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