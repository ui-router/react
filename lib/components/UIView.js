"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PropTypes = require("prop-types");
var core_1 = require("@uirouter/core");
/** @internalapi */
var id = 0;
var UIView = (function (_super) {
    __extends(UIView, _super);
    function UIView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            loaded: false,
            component: 'div',
            props: {}
        };
        return _this;
    }
    UIView.prototype.render = function () {
        var _this = this;
        var _a = this.props, children = _a.children, render = _a.render;
        var _b = this.state, component = _b.component, props = _b.props, loaded = _b.loaded;
        // register reference of child component
        // register new hook right after component has been rendered
        var stateName = this.uiViewAddress && this.uiViewAddress.context && this.uiViewAddress.context.name;
        props.ref = function (c) {
            _this.componentInstance = c;
            _this.registerUiCanExitHook(stateName);
        };
        var child = !loaded && react_1.isValidElement(children)
            ? react_1.cloneElement(children, props)
            : react_1.createElement(component, props);
        // if a render function is passed use that,
        // otherwise render the component normally
        return typeof render !== 'undefined' && loaded
            ? render(component, props)
            : child;
    };
    UIView.prototype.getChildContext = function () {
        return {
            parentUIViewAddress: this.uiViewAddress
        };
    };
    UIView.prototype.componentWillMount = function () {
        var router = this.context['router'];
        if (typeof router === 'undefined') {
            throw new Error("UIRouter instance is undefined. Did you forget to include the <UIRouter> as root component?");
        }
        // Check the context for the parent UIView's fqn and State
        var parent = this.context['parentUIViewAddress'];
        // Not found in context, this is a root UIView
        parent = parent || { fqn: "", context: router.stateRegistry.root() };
        var name = this.props.name || "$default";
        this.uiViewData = {
            $type: 'react',
            id: ++id,
            name: name,
            fqn: parent.fqn ? parent.fqn + "." + name : name,
            creationContext: parent.context,
            configUpdated: this.viewConfigUpdated.bind(this),
            config: undefined
        };
        this.uiViewAddress = { fqn: this.uiViewData.fqn, context: undefined };
        this.deregister = router.viewService.registerUIView(this.uiViewData);
        this.setState({ id: this.uiViewData.id });
    };
    UIView.prototype.componentWillUnmount = function () {
        this.deregister();
    };
    /**
     * View config updated callback
     *
     * This is called by UI-Router when a state was activated, and one of its views targets this `UIView`
     */
    UIView.prototype.viewConfigUpdated = function (newConfig) {
        var newComponent = newConfig && newConfig.viewDecl && newConfig.viewDecl.component;
        var trans = undefined, resolves = {};
        if (newConfig) {
            var context = newConfig.viewDecl && newConfig.viewDecl.$context;
            this.uiViewAddress = { fqn: this.uiViewAddress.fqn, context: context };
            var ctx = new core_1.ResolveContext(newConfig.path);
            trans = ctx.getResolvable(core_1.Transition).data;
            var stringTokens = trans.getResolveTokens().filter(function (x) { return typeof x === 'string'; });
            resolves = stringTokens.map(function (token) { return [token, trans.injector().get(token)]; }).reduce(core_1.applyPairs, {});
        }
        this.uiViewData.config = newConfig;
        var props = { resolves: resolves, transition: trans };
        // attach any style or className to the rendered component
        // specified on the UIView itself
        var styleProps = {};
        if (this.props.className)
            styleProps.className = this.props.className;
        if (this.props.className)
            styleProps.style = this.props.style;
        this.setState({
            component: newComponent || 'div',
            props: newComponent ? core_1.extend(props, styleProps) : styleProps,
            loaded: newComponent ? true : false
        });
    };
    UIView.prototype.registerUiCanExitHook = function (stateName) {
        typeof this.removeHook === 'function' && this.removeHook();
        var criteria = { exiting: stateName };
        var callback = this.componentInstance && typeof this.componentInstance.uiCanExit === 'function' && this.componentInstance.uiCanExit;
        if (stateName && callback) {
            var transitions = this.context['router'].transitionService;
            this.removeHook = transitions.onBefore(criteria, callback, {});
        }
    };
    return UIView;
}(react_1.Component));
UIView.propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    render: PropTypes.func
};
UIView.childContextTypes = {
    parentUIViewAddress: PropTypes.object
};
UIView.contextTypes = {
    router: PropTypes.object,
    parentUIViewAddress: PropTypes.object
};
exports.UIView = UIView;
//# sourceMappingURL=UIView.js.map