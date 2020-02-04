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
} from 'react';
import {
  ActiveUIView,
  ResolveContext,
  StateParams,
  Transition,
  TypedMap,
  UIInjector,
  ViewConfig,
  ViewContext,
  applyPairs,
} from '@uirouter/core';
import { useParentView } from '../hooks/useParentView';
import { useRouter } from '../hooks/useRouter';
import { useTransitionHook } from '../hooks/useTransitionHook';
import { ReactViewConfig } from '../reactViews';

/** @internalapi */
let id = 0;
/** @hidden */
let keyCounter = 0;

/** @internalapi */
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
export const UIViewContext = createContext<UIViewAddress>(undefined);
/** @deprecated use [[useParentView]] or React.useContext(UIViewContext) */
export const UIViewConsumer = UIViewContext.Consumer;

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
function useChildProps(
  component: React.FunctionComponent<any> | React.ComponentClass<any> | React.ClassicComponentClass<any>,
  resolves: TypedMap<any> | {},
  className: string,
  style: Object,
  transition: any,
  key: string,
  setComponentInstance: (instance: any) => void
): UIViewInjectedProps {
  return useMemo(() => {
    const componentProps: UIViewInjectedProps & { key: string } = {
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
    };

    const maybeComponent = component as any;
    if (maybeComponent?.prototype?.render || !!maybeComponent?.render) {
      // for class components, add a ref to grab the component instance
      return { ...componentProps, ref: setComponentInstance };
    } else {
      setComponentInstance(undefined);
      return componentProps;
    }
  }, [component, resolves, className, style, transition, key]);
}

export function UIView(props: UIViewProps) {
  const { children, render, className, style } = props;

  const router = useRouter();
  const parent = useParentView();

  // If a class component is being rendered, this is the component instance
  const [componentInstance, setComponentInstance] = useState();
  const [viewConfig, setViewConfig] = useState<ReactViewConfig>();
  const component = useMemo(() => viewConfig?.viewDecl?.component, [viewConfig]);

  const name = props.name || '$default';

  // This object contains all the metadata for this UIView
  const uiViewData: ActiveUIView = useMemo(() => {
    return {
      $type: 'react',
      id: ++id,
      name,
      fqn: parent.fqn ? parent.fqn + '.' + name : name,
      creationContext: parent.context,
      configUpdated: config => setViewConfig(config as ReactViewConfig),
      config: viewConfig as ViewConfig,
    };
  }, [name, parent, viewConfig]);

  const viewContext: ViewContext = uiViewData?.config?.viewDecl?.$context;
  const uiViewAddress: UIViewAddress = { fqn: uiViewData.fqn, context: viewContext };
  const stateName: string = uiViewAddress?.context?.name;
  const resolveContext = useMemo(() => (viewConfig ? new ResolveContext(viewConfig.path) : undefined), [viewConfig]);
  const injector = useMemo(() => resolveContext?.injector(), [resolveContext]);
  const transition = useMemo(() => injector?.get(Transition), [injector]);
  const resolves = useResolvesWithStringTokens(resolveContext, injector);
  const key = useMemo(() => (++keyCounter).toString(), [viewConfig]);
  const childProps = useChildProps(component, resolves, className, style, transition, key, setComponentInstance);

  // Register/deregister any time the uiViewData changes
  useEffect(() => router.viewService.registerUIView(uiViewData), [uiViewData]);

  // Handle component class with a 'uiCanExit()' method
  const canExitCallback = componentInstance?.uiCanExit;
  const hookMatchCriteria = canExitCallback ? { exiting: stateName } : undefined;
  useTransitionHook('onBefore', hookMatchCriteria, canExitCallback);

  const childElement =
    !component && isValidElement(children)
      ? cloneElement(children, childProps)
      : createElement(component || 'div', childProps);

  // if a render function is passed, use that. otherwise render the component normally
  const ChildOrRenderFunction =
    typeof render !== 'undefined' && component ? render(component, childProps) : childElement;
  return <UIViewContext.Provider value={uiViewAddress}>{ChildOrRenderFunction}</UIViewContext.Provider>;
}

UIView.displayName = 'UIView';
UIView.__internalViewComponent = UIView;
UIView.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  render: PropTypes.func,
} as ValidationMap<UIViewProps>;
