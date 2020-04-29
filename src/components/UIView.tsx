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
  applyPairs,
  UIRouter,
  PortalContent,
} from '@uirouter/core';
import { useStableCallback } from '../hooks';
import { useMountStatusRef } from '../hooks/useMountStatusRef';
import { useRouter } from '../hooks/useRouter';
import { ReactViewConfig } from '../reactViews';

/** @internal */
let viewIdCounter = 0;

/** @internal */
export interface UIViewAddress {
  context: ViewContext;
  fqn: string;
}

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
 * @internal
 */
export type RenderPropCallback = (Component: ComponentType<any>, Props: any) => JSX.Element | null;

export interface UIViewInjectedProps {
  transition?: Transition;
  resolves?: UIViewResolves;
  className?: string;
  style?: Object;
}

/** React Props for the [[UIView]] component */
export interface UIViewProps {
  /** default content that will be rendered when no child component is loaded into the UIView viewport */
  children?: ReactNode;
  /**
   * The name of the [[UIView]].
   *
   * Assigns a name to this [[UIView]] Portal.
   * see: [Multiple Named Views](https://ui-router.github.io/guide/views#multiple-named-uiviews)
   */
  name?: string;
  /** This prop will be applied to the routed component. */
  className?: string;
  /** This prop will be applied to the routed component. */
  style?: Object;
  /** This render prop can be used to customize the rendering of  routed components. */
  render?: RenderPropCallback;
}

export const TransitionPropCollisionError =
  '`transition` cannot be used as resolve token. ' +
  'Please rename your resolve to avoid conflicts with the router transition.';

/** @internal */
export const ViewIdContext = createContext<string>(undefined);

/** @hidden */
function useResolvesWithStringTokens(resolveContext: ResolveContext, injector: UIInjector) {
  return useMemo(() => {
    if (resolveContext && injector) {
      const stringTokens: string[] = resolveContext.getTokens().filter((x) => typeof x === 'string');
      if (stringTokens.indexOf('transition') !== -1) {
        throw new Error(TransitionPropCollisionError);
      }
      return stringTokens.map((token) => [token, injector.get(token)]).reduce(applyPairs, {});
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

interface ReactViewState {
  portalContent: PortalContent;
  contentComponent: React.ComponentType;
  viewConfig: ReactViewConfig;
}

/** @hidden */
function useViewConfig(DefaultContentComponent: React.ComponentType) {
  const initialViewState: ReactViewState = {
    portalContent: 'DEFAULT_CONTENT',
    contentComponent: DefaultContentComponent,
    viewConfig: null,
  };

  const mountedStatusRef = useMountStatusRef();
  const [reactViewState, setReactViewState] = useState(initialViewState);

  const renderContentCallback = useStableCallback((portalContent: PortalContent, newConfig?: ViewConfig) => {
    if (mountedStatusRef.current === 'UNMOUNTED') {
      return;
    }

    if (portalContent === 'ROUTED_COMPONENT') {
      const viewConfig = newConfig as ReactViewConfig;
      setReactViewState({ portalContent, viewConfig, contentComponent: viewConfig.viewDecl.component });
    } else if (portalContent === 'DEFAULT_CONTENT') {
      setReactViewState({ portalContent, viewConfig: null, contentComponent: DefaultContentComponent });
    } else if (portalContent === 'INTEROP_DIV') {
      let InteropDivComponent: React.ComponentType = () => null;
      const refPromise = new Promise<HTMLDivElement>(resolve => {
        InteropDivComponent = () => <div ref={resolve} />;
      });
      setReactViewState({ portalContent, viewConfig: null, contentComponent: InteropDivComponent });
      return refPromise;
    } else {
      throw new Error(`React UIView does not support the requested PortalContent: ${status}`);
    }
  });

  return { reactViewState, renderContentCallback };
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

  const DefaultContentComponent: React.ComponentType = useStableCallback(() => {
    return isValidElement(children) ? cloneElement(children, childProps) : createElement('div', childProps);
  });
  const { reactViewState, renderContentCallback } = useViewConfig(DefaultContentComponent);
  const { contentComponent, viewConfig } = reactViewState;
  const idRef = useRef(null as string);

  // Register/deregister any time the uiViewData changes
  useEffect(() => {
    idRef.current = router.viewService.registerView('react', parentId, name, renderContentCallback);

    return () => {
      if (idRef.current) {
        router.viewService.deregisterView(idRef.current);
      }
    };
  }, [name, parentId, renderContentCallback]);

  const stateName: string = viewConfig?.viewDecl?.$context?.name;
  const resolveContext = useMemo(() => (viewConfig ? new ResolveContext(viewConfig.path) : undefined), [viewConfig]);
  const injector = useMemo(() => resolveContext?.injector(), [resolveContext]);
  const transition = useMemo(() => injector?.get(Transition), [injector]);
  const resolves = useResolvesWithStringTokens(resolveContext, injector);

  const childProps = useRoutedComponentProps(
    router,
    stateName,
    viewConfig,
    contentComponent,
    resolves,
    className,
    style,
    transition
  );

  if (!idRef.current) {
    return null;
  }

  return (
    <ViewIdContext.Provider value={idRef.current}>
      {typeof render === 'function'
        ? render(contentComponent, childProps)
        : createElement(contentComponent, childProps)}
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

/**
 * UIView Viewport
 *
 * The UIView component is a viewport for a routed components.
 * Routed components will be rendered inside the UIView viewport.
 *
 * ### Example
 * ```
 * function MyApp() {
 *   return (
 *     <div className="MyApp">
 *       <UIView />
 *     </div>
 *   );
 * }
 * ```
 *
 * See [[UIViewProps]] for details on the props this component takes.
 *
 * @noInheritDoc
 */
export class UIView extends Component<UIViewProps> {
  /** @internal */
  static displayName = 'UIView';
  /** @internal */
  static propTypes = View.propTypes;
  /** @internal */
  static __internalViewComponent: ComponentType<UIViewProps> = View;
  /** @internal */
  render() {
    return <View {...this.props} />;
  }
}
