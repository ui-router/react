/**
 * @reactapi
 * @module react
 */ /** */
import { StatelessComponent, ComponentClass, ClassicComponentClass } from 'react';

import { StateDeclaration, _ViewDeclaration, Transition } from '@uirouter/core';

/**
 * The StateDeclaration object is used to define a state or nested state.
 * It should be registered with the [[StateRegistry]].
 *
 * #### Example:
 * ```js
 * import {FoldersComponent} from "./folders";
 *
 * // StateDeclaration object
 * var foldersState = {
 *   name: 'folders',
 *   url: '/folders',
 *   component: FoldersComponent,
 *   resolve: {
 *     allfolders: function(FolderService) {
 *       return FolderService.list();
 *     }
 *   }
 * }
 * ```
 */
export interface ReactStateDeclaration extends StateDeclaration, ReactViewDeclaration {
  /**
   * An optional object used to define multiple named views.
   *
   * Each key is the name of a view, and each value is a [[Ng2ViewDeclaration]].
   * Unnamed views are internally renamed to `$default`.
   *
   * A view's name is used to match an active `<ui-view>` directive in the DOM.  When the state
   * is entered, the state's views are activated and then matched with active `<ui-view>` directives:
   *
   * - The view's name is processed into a ui-view target:
   *   - ui-view address: an address to a ui-view
   *   - state anchor: the state to anchor the address to
   *
   *  Examples:
   *
   *  Targets three named ui-views in the parent state's template
   *
   * #### Example:
   * ```js
   * views: {
   *   header: HeaderComponent,
   *   body: BodyComponent,
   *   footer: FooterComponent
   * }
   * ```
   *
   * #### Example:
   * ```js
   * // Targets named ui-view="header" in the template of the ancestor state 'top'
   * // and the named `ui-view="body" from the parent state's template.
   * views: {
   *   'header@top': MsgHeaderComponent,
   *   'body': MessagesComponent
   * }
   * ```
   *
   * ## View targeting details
   *
   * There are a few styles of view addressing/targeting.  The most common is a simple `ui-view` name
   *
   *
   * #### Simple ui-view name
   *
   * Addresses without an `@` are anchored to the parent state.
   *
   * #### Example:
   * ```js
   * // target the `<div ui-view='foo'></div>` created in the parent state's view
   * views: { foo: {...} }
   * ```
   *
   * #### View name anchored to a state
   *
   * You can anchor the `ui-view` name to a specific state by including an `@`
   *
   * #### Example:
   * ```js
   *
   * // target the `<div ui-view='foo'></div>` which was created in a
   * // view owned by the state `bar.baz`
   * views: { 'foo@bar.baz': {...} }
   * ```
   *
   * #### Absolute addressing
   *
   * You can address a `ui-view` absolutely, using dotted notation, by prefixing the address with a `!`.  Dotted
   * addresses map to the hierarchy of `ui-view`s active in the DOM:
   *
   * #### Example:
   * ```js
   * // absolutely target the `<div ui-view='nested'></div>`... which was created
   * // in the unnamed/$default root `<ui-view></ui-view>`
   * views: { '!$default.nested': {...} }
   * ```
   *
   * #### Relative addressing
   *
   * Absolute addressing is actually relative addressing, only anchored to the unnamed root state.  You can also use
   * relative addressing anchored to any state, in order to target a target deeply nested `ui-views`:
   *
   * #### Example:
   * ```js
   * // target the `<div ui-view='bar'></div>`... which was created inside the
   * // `<div ui-view='bar'></div>`... which was created inside the parent state's template.
   * views: { 'foo.bar': {...} }
   * ```
   *
   * #### Example:
   * ```js
   * // target the `<div ui-view='bar'></div>`...  which was created in
   * // `<div ui-view='foo'></div>`... which was created in a template crom the state `baz.qux`
   * views: { 'foo.bar@baz.qux': {...} }
   *
   * ---
   *
   * ## State `component:` and `views:` incompatiblity
   *
   * If a state has a `views` object, the state-level `component:` property is ignored.  Therefore,
   * if _any view_ for a state is declared in the `views` object, then _all of the state's views_ must be defined in
   * the `views` object.
   */
  views?: { [key: string]: ReactViewDeclaration };
}

/**
 * Declares a view on some state
 */
export interface ReactViewDeclaration extends _ViewDeclaration {
  /**
   * The React `Component` to use for this view.
   *
   * A property of [[ReactStateDeclaration]] or [[ReactViewDeclaration]]:
   *
   * The React Component which will be used for this view.
   *
   * Resolve data can be provided to the component using props.
   *
   * TODO: document react shorthand, like ng1's shorthand: inside a "views:" block, a bare string `"foo"` is shorthand for `{ component: "foo" }`
   *
   * #### Example:
   * ```js
   * .state('profile', {
   *   // Use the <my-profile></my-profile> component for the Unnamed view
   *   component: MyProfileComponent,
   * }
   *
   * .state('messages', {
   *   // use the <nav-bar></nav-bar> component for the view named 'header'
   *   // use the <message-list></message-list> component for the view named 'content'
   *   views: {
   *     header: { component: NavBar },
   *     content: { component: MessageList }
   *   }
   * }
   *
   * .state('contacts', {
   *   // Inside a "views:" block, supplying only a Component class is shorthand for { component: NavBar }
   *   // use the <nav-bar></nav-bar> component for the view named 'header'
   *   // use the <contact-list></contact-list> component for the view named 'content'
   *   views: {
   *     header: NavBar,
   *     content: ContactList
   *   }
   * }
   * ```
   */
  component?: StatelessComponent<any> | ComponentClass<any> | ClassicComponentClass<any>;

  /**
   * @hidden
   *
   * An object which maps `resolve`s to [[component]] `bindings`.
   *
   * A property of [[Ng2StateDeclaration]] or [[Ng2ViewDeclaration]]:
   *
   * When using a [[component]] declaration (`component: 'myComponent'`), each input binding for the component is supplied
   * data from a resolve of the same name, by default.  You may supply data from a different resolve name by mapping it here.
   *
   * Each key in this object is the name of one of the component's input bindings.
   * Each value is the name of the resolve that should be provided to that binding.
   *
   * Any component bindings that are omitted from this map get the default behavior of mapping to a resolve of the
   * same name.
   *
   * #### Example:
   * ```js
   * $stateProvider.state('foo', {
   *   resolve: {
   *     foo: function(FooService) { return FooService.get(); },
   *     bar: function(BarService) { return BarService.get(); }
   *   },
   *   component: 'Baz',
   *   // The component's `baz` binding gets data from the `bar` resolve
   *   // The component's `foo` binding gets data from the `foo` resolve (default behavior)
   *   bindings: {
   *     baz: 'bar'
   *   }
   * });
   *
   * app.component('Baz', {
   *   templateUrl: 'baz.html',
   *   controller: 'BazController',
   *   bindings: {
   *     foo: '<', // foo binding
   *     baz: '<'  // baz binding
   *   }
   * });
   * ```
   *
   */
  // bindings?: { [key: string]: string };
}

/**
 * The shape of a controller for a view (and/or component), defining the controller callbacks.
 *
 * A view in UI-Router is comprised of either a `component` ([[Ng2ViewDeclaration.component]]) or a combination of a
 * `template` (or `templateProvider`) and a `controller` (or `controllerProvider`).
 *
 * The `controller` object (or the `component`'s controller object) can define component-level controller callbacks,
 * which UI-Router will call at the appropriate times.  These callbacks are similar to Transition Hooks
 * ([[IHookRegistry]]), but are only called if the view is currently active.
 *
 * This interface defines the UI-Router component callbacks.
 *
 * TODO: this should extend the ng2 Component interface
 */
export interface ReactComponent {
  /**
   * This callback is called when parameter values have changed.
   *
   * This callback can be used to respond to changing parameter values in the current state, or in parent/child states.
   * This callback is especially handy when using dynamic parameters ([[ParamDeclaration.dynamic]])
   *
   * Called when:
   * - The view is still active
   * - A new transition has completed successfully
   * - The state for the view (controller) was not reloaded
   * - At least one parameter value was changed
   *
   * Called with:
   * @param newValues an object containing the changed parameter values
   * @param $transition$ the new Transition which triggered this callback
   *
   * #### Example:
   * ```js
   * angular.module('foo').controller('FancyCtrl', function() {
   *   this.uiOnParamsChanged = function(newParams) {
   *     console.log("new params: ", newParams);
   *   }
   * });
   * ```
   */
  uiOnParamsChanged(newValues: any, $transition$: Transition);

  /**
   * This callback is called when the view's state is about to be exited.
   *
   * This callback is used to inform a view that it is about to be exited, due to a new [[Transition]].
   * The callback can ask for user confirmation, and cancel or alter the new Transition.  The callback should
   * return a value, or a promise for a value.  If a promise is returned, the new Transition waits until the
   * promise settles.
   *
   *
   * Called when:
   * - The view is still active
   * - A new Transition is about to run
   * - The new Transition will exit the view's state
   *
   * Called with:
   * - This callback is injected in the new Transition's context
   *
   * Relevant return Values:
   * - `false`: The transition is cancelled.
   * - A rejected promise: The transition is cancelled.
   * - [[TargetState]]: The transition is redirected to the new target state.
   * - Anything else: the transition will continue normally (the state and view will be deactivated)
   *
   * @return a value, or a promise for a value.
   */
  uiCanExit();
}
