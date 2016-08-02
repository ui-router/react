# [0.2.1] (2016-08-02)
### Fix
- **UISref**: doesn't need to be nested inside a UIView in order to work [(3c00270)](https://github.com/ui-router/react/commit/3c00270928c1fc2d98821e95903e73d96b5ec967)

# [0.2.0] (2016-08-02)
### Changed
- Exported default value is now the `UIRouterReact` class instead of an instance.
- The class takes now care of setting up the `viewConfigFactory` and `reactViewBuilder` so user doesn't need to.
- Renamed all symbols to UI* from Ui* for consistency with `ui-router-core`.
- `UISref` only accepts a single valid element as child.
- `UISrefActive` properly track multiple descendants `UISref` component and track their specified states for applying the active class.

### Added
- `UISref` and `UISrefActive` properly copy over all props and class names of thir children, adding more flexibility for the user.
- `UIView` rendered component exposes two props from the router: `resolves` and `transition`. They act as an injected dependecy of the state-component, and are used to interact with the router itself.
- `UIView` registers as `onBefore` hook the `uiCanExit` method of the component instance it renders.
- `UISrefActive`: by passing a `extact={true}` props it will only activate when the exact target state used in the `UISref` is active.
- `html5Mode` added to UIRouterReact class for using `pushStateLocation` instead of `hashLocation` as history strategy (WARNING: This is a temporary api and will likely change in the future)


# [0.1.2] (2016-07-18)
### Fix
- Removed file extension preventing compiled code to work properly.


# [0.1.1] (2016-07-18)
### Added
- Typings are specified by `typings.json` file and must be installed using typings CLI.
- Added `es6-shim` for Promises.


# [0.1.0] (2016-07-14)
### First Release
- First alpha release of `ui-router-react`