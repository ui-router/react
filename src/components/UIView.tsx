import * as PropTypes from 'prop-types';
import * as React from 'react';
import {
  Component,
  ComponentType,
  ReactNode,
  ValidationMap,
  cloneElement,
  createContext,
  createElement,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ResolveContext,
  StateParams,
  Transition,
  UIInjector,
  UIRouter,
  UIViewPortalRenderCommand,
  applyPairs,
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

/**
 * Gets the props passed to the routed component.
 *
 * - [[Transition]] object as 'transition'
 * - Resolve data (resolves with string tokens only)
 * - classes/styles
 *
 * @internal
 */
function useContentComponentProps(
  cmd: UIViewPortalRenderCommand,
  router: UIRouter,
  component: React.ComponentType<any>,
  className: string,
  style: Object
): UIViewInjectedProps & { key: string } {
  const viewConfig = cmd.portalContentType === 'RENDER_ROUTED_VIEW' ? cmd.uiViewPortalRegistration.viewConfig : null;
  const stateName: string = viewConfig?.viewDecl?.$context?.name;
  const resolveContext = useMemo(() => (viewConfig ? new ResolveContext(viewConfig.path) : undefined), [viewConfig]);
  const injector = useMemo(() => resolveContext?.injector(), [resolveContext]);
  const transition = useMemo(() => injector?.get(Transition), [injector]);
  const resolves = useResolvesWithStringTokens(resolveContext, injector);

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
  uiViewPortalRenderCommand: UIViewPortalRenderCommand;
  ContentComponent: React.ComponentType;
}

/**
 * If a class component is being rendered, wire up its uiCanExit method
 * Return a { ref: Ref<ClassComponentInstance> } if passed a component class
 * Return an empty object {} if passed anything else
 * The returned object should be spread as props onto the child component
 * @internal
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
  const idRef = useRef(null as string);
  const parentId = useContext(ViewIdContext);
  const mountedStatusRef = useMountStatusRef();

  const DefaultContentComponent: React.ComponentType = useStableCallback(() => {
    return isValidElement(children) ? cloneElement(children, childProps) : createElement('div', childProps);
  });
  const initialViewState: ReactViewState = {
    uiViewPortalRenderCommand: { portalContentType: 'RENDER_DEFAULT_CONTENT', uiViewPortalRegistration: null },
    ContentComponent: DefaultContentComponent,
  };

  const [reactViewState, setReactViewState] = useState(initialViewState);
  const { ContentComponent, uiViewPortalRenderCommand } = reactViewState;

  const name = props.name || '$default';

  const renderContentCallback = useStableCallback(function (cmd: UIViewPortalRenderCommand) {
    if (mountedStatusRef.current === 'UNMOUNTED') {
      return;
    }

    function getContentComponent() {
      if (cmd.portalContentType === 'RENDER_ROUTED_VIEW') {
        return (cmd.uiViewPortalRegistration.viewConfig as ReactViewConfig).viewDecl.component;
      } else if (cmd.portalContentType === 'RENDER_DEFAULT_CONTENT') {
        return DefaultContentComponent;
      } else if (cmd.portalContentType === 'RENDER_INTEROP_DIV') {
        return () => <div ref={cmd.giveDiv} />;
      } else {
        throw new Error(`React UIView does not support the requested command: ${(cmd as any).command}`);
      }
    }

    setReactViewState({ uiViewPortalRenderCommand: cmd, ContentComponent: getContentComponent() });
  });

  // Register/deregister any time the uiViewData changes
  useEffect(() => {
    idRef.current = router.viewService._pluginapi._registerView('react', parentId, name, renderContentCallback);

    return () => {
      if (idRef.current) {
        router.viewService._pluginapi._deregisterView(idRef.current);
      }
    };
  }, [name, parentId, renderContentCallback]);

  const childProps = useContentComponentProps(uiViewPortalRenderCommand, router, ContentComponent, className, style);

  if (!idRef.current) {
    return null;
  }

  return (
    <ViewIdContext.Provider value={idRef.current}>
      {typeof render === 'function'
        ? render(ContentComponent, childProps)
        : createElement(ContentComponent, childProps)}
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
