/** @packageDocumentation @reactapi @module components */
import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  ComponentType,
  ReactNode,
  ValidationMap,
  cloneElement,
  createContext,
  createElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  Component,
  forwardRef,
  useRef,
  useContext,
} from 'react';
import {
  ResolveContext,
  StateParams,
  Transition,
  TypedMap,
  UIInjector,
  ViewConfig,
  ViewContext,
  applyPairs,
  UIRouter,
  StateObject,
} from '@uirouter/core';
import { useStableCallback } from '../hooks';
import { useIsMountedRef } from '../hooks/useIsMountedRef';
import { useRouter } from '../hooks/useRouter';
import { ReactViewConfig } from '../reactViews';

/**
 * Interface for [[InjectedProps.resolves]]
 *
 * This Typescript interface shows what fields are available on the `resolves` field.
 */
export interface UIViewResolves {
  /**
   * Any key/value pair defined by a state's resolve
   *
   * If a state defines any [[ReactStateDeclaration.resolve]]s, they will be found on this object.
   */
  [key: string]: any;
  /**
   * The `StateParams` for the `Transition` that activated the component
   *
   * This is an alias for:
   * ```js
   * let $stateParams = $transition$.params("to");
   * ```
   */
  $stateParams: StateParams;
  /** The `Transition` that activated the component */
  $transition$: Transition;
}

/**
 * Function type for [[UIViewProps.render]]
 *
 * If the `render` function prop is provided, the `UIView` will use it instead of rendering the component by itself.
 * @internalapi
 */
export type RenderPropCallback = (Component: ComponentType<any>, Props: any) => JSX.Element | null;

export interface UIViewInjectedProps {
  transition?: Transition;
  resolves?: UIViewResolves;
  className?: string;
  style?: Object;
}

/** Component Props for `UIView` */
export interface UIViewProps {
  children?: ReactNode;
  name?: string;
  className?: string;
  style?: Object;
  render?: RenderPropCallback;
}

export const TransitionPropCollisionError =
  '`transition` cannot be used as resolve token. ' +
  'Please rename your resolve to avoid conflicts with the router transition.';

/** @internalapi */
export const ViewIdContext = createContext<string>(undefined);

/** @hidden */
function useResolvesWithStringTokens(resolveContext: ResolveContext, injector: UIInjector) {
  return useMemo(() => {
    if (resolveContext && injector) {
      const stringTokens: string[] = resolveContext.getTokens().filter(x => typeof x === 'string');
      if (stringTokens.indexOf('transition') !== -1) {
        throw new Error(TransitionPropCollisionError);
      }
      return stringTokens.map(token => [token, injector.get(token)]).reduce(applyPairs, {});
    } else {
      return {};
    }
  }, [resolveContext, injector]);
}

/* @hidden These are the props are passed to the routed component. */
function useRoutedComponentProps(
  router: UIRouter,
  stateName: string,
  viewConfig: ViewConfig,
  component: React.FunctionComponent<any> | React.ComponentClass<any> | React.ClassicComponentClass<any>,
  resolves: TypedMap<any> | {},
  className: string,
  style: Object,
  transition: any
): UIViewInjectedProps & { key: string } {
  const keyCounterRef = useRef(0);
  // Always re-mount if the viewConfig changes
  const key = useMemo(() => (++keyCounterRef.current).toString(), [viewConfig]);

  const baseChildProps = useMemo(
    () => ({
      // spread each string resolve as a separate prop
      ...resolves,
      // if a className prop was passed to the UIView, forward it
      className,
      // if a style prop was passed to the UIView, forward it
      style,
      // the transition
      transition,
      // this key updates whenever the state is reloaded, causing the component to remount
      key,
    }),
    [component, resolves, className, style, transition, key]
  );

  const maybeRefProp = useUiCanExitClassComponentHook(router, stateName, component);

  return useMemo(() => ({ ...baseChildProps, ...maybeRefProp }), [baseChildProps, maybeRefProp]);
}

/** @hidden */
function useViewConfig() {
  const isMountedRef = useIsMountedRef();
  const [viewConfig, setViewConfig] = useState<ReactViewConfig>();

  const updateConfig = useStableCallback((newConfig: ViewConfig) => {
    if (viewConfig !== newConfig && isMountedRef.current) {
      setViewConfig(newConfig as ReactViewConfig);
    }
  });

  return { viewConfig, updateConfig };
}

/**
 * If a class component is being rendered, wire up its uiCanExit method
 * Return a { ref: Ref<ClassComponentInstance> } if passed a component class
 * Return an empty object {} if passed anything else
 * The returned object should be spread as props onto the child component
 * @hidden
 */
function useUiCanExitClassComponentHook(router: UIRouter, stateName: string, maybeComponentClass: any) {
  // Use refs and run the callback outside of any render pass
  const componentInstanceRef = useRef<any>();
  const deregisterRef = useRef<Function>(() => undefined);

  function callbackRef(componentInstance) {
    // Use refs
    const previous = componentInstanceRef.current;
    const deregisterPreviousTransitionHook = deregisterRef.current;

    if (previous !== componentInstance) {
      componentInstanceRef.current = componentInstance;
      deregisterPreviousTransitionHook();

      const uiCanExit = componentInstance?.uiCanExit;
      if (uiCanExit) {
        const boundCallback = uiCanExit.bind(componentInstance);
        deregisterRef.current = router.transitionService.onBefore({ exiting: stateName }, boundCallback);
      } else {
        deregisterRef.current = () => undefined;
      }
    }
  }

  return useMemo(() => {
    const isComponentClass = maybeComponentClass?.prototype?.render || maybeComponentClass?.render;
    return isComponentClass ? { ref: callbackRef } : undefined;
  }, [maybeComponentClass]);
}

const View = forwardRef(function View(props: UIViewProps, forwardedRef) {
  const { children, render, className, style } = props;

  const router = useRouter();
  const parentId = useContext(ViewIdContext);
  const name = props.name || '$default';
  const { viewConfig, updateConfig } = useViewConfig();
  const component = useMemo(() => viewConfig?.viewDecl?.component, [viewConfig]);
  const idRef = useRef(null as string);

  // Register/deregister any time the uiViewData changes
  useEffect(() => {
    if (idRef.current) {
      router.viewService.deregisterView(idRef.current);
    }
    idRef.current = router.viewService.registerView('react', parentId, name, updateConfig);
  }, [name, parentId, updateConfig]);

  // Deregister on unmount
  useEffect(() => {
    return () => {
      if (idRef.current) {
        router.viewService.deregisterView(idRef.current);
      }
    };
  }, []);

  const stateName: string = viewConfig?.viewDecl?.$context?.name;
  const resolveContext = useMemo(() => (viewConfig ? new ResolveContext(viewConfig.path) : undefined), [viewConfig]);
  const injector = useMemo(() => resolveContext?.injector(), [resolveContext]);
  const transition = useMemo(() => injector?.get(Transition), [injector]);
  const resolves = useResolvesWithStringTokens(resolveContext, injector);

  const childProps = useRoutedComponentProps(
    router,
    stateName,
    viewConfig,
    component,
    resolves,
    className,
    style,
    transition
  );

  const childElement =
    !component && isValidElement(children)
      ? cloneElement(children, childProps)
      : createElement(component || 'div', childProps);

  // if a render function is passed, use that. otherwise render the component normally
  const ChildOrRenderFunction =
    typeof render !== 'undefined' && component ? render(component, childProps) : childElement;

  return (
    <ViewIdContext.Provider value={idRef.current}>
      {idRef.current ? ChildOrRenderFunction : null}
    </ViewIdContext.Provider>
  );
});

View.displayName = 'UIView';
View.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  render: PropTypes.func,
} as ValidationMap<UIViewProps>;

// A wrapper class for react-hybrid to monkey patch
export class UIView extends Component<UIViewProps> {
  static displayName = 'UIView';
  static propTypes = View.propTypes;
  static __internalViewComponent: ComponentType<UIViewProps> = View;
  render() {
    return <View {...this.props} />;
  }
}
