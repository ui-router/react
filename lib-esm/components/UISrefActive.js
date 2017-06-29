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
import { Component, cloneElement } from 'react';
import * as PropTypes from 'prop-types';
import * as _classNames from 'classnames';
var classNames = _classNames;
var UISrefActive = (function (_super) {
    __extends(UISrefActive, _super);
    function UISrefActive() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // keep track of states to watch and their activeClasses
        _this.states = [];
        _this.activeClasses = {};
        _this.addStateInfo = function (stateName, stateParams) {
            var activeClass = _this.props.class;
            var deregister = _this.addState(stateName, stateParams, activeClass);
            _this.forceUpdate();
            return deregister;
        };
        _this.addState = function (stateName, stateParams, activeClass) {
            var stateService = _this.context['router'].stateService;
            var parent = _this.context['parentUIViewAddress'];
            var stateContext = parent && parent.context || _this.context['router'].stateRegistry.root();
            var state = stateService.get(stateName, stateContext);
            var stateHash = _this.createStateHash(stateName, stateParams);
            var stateInfo = {
                state: state || { name: stateName },
                params: stateParams,
                hash: stateHash
            };
            _this.states.push(stateInfo);
            _this.activeClasses[stateHash] = activeClass;
            return function () {
                var idx = _this.states.indexOf(stateInfo);
                if (idx !== -1)
                    _this.states.splice(idx, 1);
            };
        };
        _this.createStateHash = function (state, params) {
            if (typeof state !== 'string') {
                throw new Error('state should be a string');
            }
            return params && typeof params === 'object'
                ? state + JSON.stringify(params)
                : state;
        };
        _this.getActiveClasses = function () {
            var activeClasses = [];
            var stateService = _this.context['router'].stateService;
            var exact = _this.props.exact;
            _this.states.forEach(function (s) {
                var state = s.state, params = s.params, hash = s.hash;
                if (!exact && stateService.includes(state.name, params))
                    activeClasses.push(_this.activeClasses[hash]);
                if (exact && stateService.is(state.name, params))
                    activeClasses.push(_this.activeClasses[hash]);
            });
            return activeClasses;
        };
        return _this;
    }
    UISrefActive.prototype.getChildContext = function () {
        return {
            parentUiSrefActiveAddStateInfo: this.addStateInfo
        };
    };
    UISrefActive.prototype.componentWillMount = function () {
        var _this = this;
        var router = this.context['router'];
        if (typeof router === 'undefined') {
            throw new Error("UIRouter instance is undefined. Did you forget to include the <UIRouter> as root component?");
        }
        // register callback for state change
        this.deregister = this.context['router'].transitionService.onSuccess({}, function () { return _this.forceUpdate(); });
    };
    UISrefActive.prototype.componentWillUnmount = function () {
        this.deregister();
    };
    UISrefActive.prototype.render = function () {
        var activeClasses = this.getActiveClasses();
        return activeClasses.length > 0
            ? cloneElement(this.props.children, Object.assign({}, this.props.children.props, {
                className: classNames(this.props.children.props.className, activeClasses)
            }))
            : this.props.children;
    };
    UISrefActive.propTypes = {
        class: PropTypes.string.isRequired,
        children: PropTypes.element.isRequired
    };
    UISrefActive.contextTypes = {
        router: PropTypes.object,
        parentUIViewAddress: PropTypes.object
    };
    UISrefActive.childContextTypes = {
        parentUiSrefActiveAddStateInfo: PropTypes.func
    };
    return UISrefActive;
}(Component));
export { UISrefActive };
//# sourceMappingURL=UISrefActive.js.map