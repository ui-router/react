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
var _classNames = require("classnames");
var core_1 = require("@uirouter/core");
var classNames = _classNames;
var UISref = (function (_super) {
    __extends(UISref, _super);
    function UISref() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getOptions = function () {
            var parent = _this.context['parentUIViewAddress'];
            var parentContext = parent && parent.context || _this.context['router'].stateRegistry.root();
            var defOpts = { relative: parentContext, inherit: true };
            return core_1.extend(defOpts, _this.props.options || {});
        };
        _this.handleClick = function (e) {
            if (!e.defaultPrevented && !(e.button == 1 || e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                var params = _this.props.params || {};
                var to = _this.props.to;
                var options = _this.getOptions();
                _this.context['router'].stateService.go(to, params, options);
            }
        };
        return _this;
    }
    UISref.prototype.componentWillMount = function () {
        var addStateInfo = this.context['parentUiSrefActiveAddStateInfo'];
        this.deregister = typeof addStateInfo === 'function'
            ? addStateInfo(this.props.to, this.props.params)
            : function () { };
        var router = this.context['router'];
        if (typeof router === 'undefined') {
            throw new Error("UIRouter instance is undefined. Did you forget to include the <UIRouter> as root component?");
        }
    };
    UISref.prototype.componentWillUnmount = function () {
        this.deregister();
    };
    UISref.prototype.render = function () {
        var params = this.props.params || {}, to = this.props.to, options = this.getOptions();
        var childrenProps = this.props.children.props;
        var props = Object.assign({}, childrenProps, {
            onClick: this.handleClick,
            href: this.context['router'].stateService.href(to, params, options),
            className: classNames(this.props.className, childrenProps.className)
        });
        return react_1.cloneElement(this.props.children, props);
    };
    return UISref;
}(react_1.Component));
UISref.propTypes = {
    children: PropTypes.element.isRequired,
    to: PropTypes.string.isRequired,
    params: PropTypes.object,
    options: PropTypes.object,
    className: PropTypes.string
};
UISref.contextTypes = {
    router: PropTypes.object,
    parentUIViewAddress: PropTypes.object,
    parentUiSrefActiveAddStateInfo: PropTypes.func
};
exports.UISref = UISref;
//# sourceMappingURL=UISref.js.map