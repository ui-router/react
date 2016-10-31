import {extend, assertPredicate, isFunction, isArray, isInjectable, $InjectorLike, IInjectable} from "ui-router-core";

/** angular1-like injector api */
// globally available injectables
let globals = { };
let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
let ARGUMENT_NAMES = /([^\s,]+)/g;

export const $injector = {
  get: name => globals[name],
  has: (name) => $injector.get(name) != null,
  invoke: (fn:IInjectable, context?, locals?) => {
    let all = extend({}, globals, locals || {});
    let params = $injector.annotate(fn);
    let ensureExist = assertPredicate(key => all.hasOwnProperty(key), key => `DI can't find injectable: '${key}'`);
    let args = params.filter(ensureExist).map(x => all[x]);
    if (isFunction(fn)) return fn.apply(context, args);
    else return (fn as any[]).slice(-1)[0].apply(context, args);
  },
  annotate: (fn:IInjectable): any[] => {
    if (!isInjectable(fn)) throw new Error(`Not an injectable function: ${fn}`);
    if (fn && (fn as any).$inject) return (fn as any).$inject;
    if (isArray(fn)) return fn.slice(0, -1);
    let fnStr = fn.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    return result || [];
  }
} as $InjectorLike;