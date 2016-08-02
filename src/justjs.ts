/**
 * Naive, pure JS implementation of core ui-router services
 *
 * @module justjs
 */ /** */
import {services} from "ui-router-core";
import {isDefined, isFunction, isArray, isObject, isInjectable} from "ui-router-core";
import {extend, assertPredicate, forEach, applyPairs} from "ui-router-core";

/** $q-like promise api */
services.$q = (executor: (resolve, reject) => void) => new Promise(executor);
services.$q.when = (val) => new Promise((resolve, reject) => resolve(val));
services.$q.reject = (val) => new Promise((resolve, reject) => { reject(val); });
services.$q.defer = function() {
  let deferred: any = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
};

services.$q.all = function (promises: { [key: string]: Promise<any> } | Promise<any>[]) {
  if (isArray(promises)) {
    return new Promise((resolve, reject) => {
      let results = [];
      promises.reduce((wait4, promise) => wait4.then(() => promise.then(val => results.push(val))), services.$q.when())
          .then(() => { resolve(results); }, reject);
    });
  }

  if (isObject(promises)) {
    // console.log("$q.all({}) Input:", promises);

    // Convert promises map to promises array.
    // When each promise resolves, map it to a tuple { key: key, val: val }
    let chain = Object.keys(promises)
        .map(key => promises[key].then(val => ({key, val})));
    // Then wait for all promises to resolve, and convert them back to an object
    return services.$q.all(chain).then(values => {
      let value = values.reduce((acc, tuple) => { acc[tuple.key] = tuple.val; return acc; }, {});

      // console.log("$q.all({}) Output:", value);
      return value;
    });
  }
};





// angular1-like injector api

// globally available injectables
let globals = { };
services.$injector = { };

services.$injector.get = name => globals[name];
services.$injector.has = (name) => services.$injector.get(name) != null;
services.$injector.invoke = function(fn, context?, locals?) {
  let all = extend({}, globals, locals || {});
  let params = services.$injector.annotate(fn);
  let ensureExist = assertPredicate(key => all.hasOwnProperty(key), key => `DI can't find injectable: '${key}'`);
  let args = params.filter(ensureExist).map(x => all[x]);
  if (isFunction(fn)) return fn.apply(context, args);
  return fn.slice(-1)[0].apply(context, args);
};

let STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
let ARGUMENT_NAMES = /([^\s,]+)/g;
// http://stackoverflow.com/questions/1007981
services.$injector.annotate = function(fn) {
  if (!isInjectable(fn)) throw new Error(`Not an injectable function: ${fn}`);
  if (fn && fn.$inject) return fn.$inject;
  if (isArray(fn)) return fn.slice(0, -1);
  let fnStr = fn.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  return result || [];
};

let loc = <any> services.location;
let hashPrefix: string = '';
let baseHref: string = "";

let locCfg = <any> services.locationConfig;

locCfg.port = () => location.port;
locCfg.protocol = () => location.protocol;
locCfg.host = () => location.host;
locCfg.baseHref = (newBaseHref: string): string => {
  if(isDefined(newBaseHref)) {
    baseHref = newBaseHref;
  }
  return baseHref;
};
locCfg.html5Mode = () => false;
locCfg.hashPrefix = (newprefix: string): string => {
  if(isDefined(newprefix)) {
    hashPrefix = newprefix;
  }
  return hashPrefix;
};










const beforeAfterSubstr = char => str => {
  if (!str) return ["", ""];
  let idx = str.indexOf(char);
  if (idx === -1) return [str, ""];
  return [str.substr(0, idx), str.substr(idx + 1)];
};

const splitHash = beforeAfterSubstr("#");
const splitQuery = beforeAfterSubstr("?");
const splitEqual = beforeAfterSubstr("=");
const trimHashVal = (str) => str ? str.replace(/^#/, "") : "";

const keyValsToObjectR = (accum, [key, val]) => {
  if (!accum.hasOwnProperty(key)) {
    accum[key] = val;
  } else if (isArray(accum[key])) {
    accum[key].push(val);
  } else {
    accum[key] = [accum[key], val]
  }

  return accum;
};

const getParams = (queryString) => queryString.split("&").map(splitEqual).reduce(keyValsToObjectR, {});

// Location: hash mode or pushstate mode
export let hashLocation = {
  hash: () =>
      splitHash(trimHashVal(location.hash))[1],
  path: () =>
      splitHash(splitQuery(trimHashVal(location.hash))[0])[0],
  search: () =>
    getParams(splitQuery(splitHash(trimHashVal(location.hash))[1])[1]),
  url: (url) => {
    if(isDefined(url)) {
      location.hash = url;
    }
    return loc.path();
  },
  replace: () => console.log(new Error('$location.replace() not impl')),
  onChange: (cb) => window.addEventListener("hashchange", cb, false)
};



export let pushStateLocation = {
  hash: () =>
      trimHashVal(location.hash),
  path: () => {
    let base = locCfg.baseHref()
    let path = location.pathname;
    let idx = path.indexOf(base);
    if (idx !== 0) throw new Error(`current url: ${path} does not start with <base> tag ${base}`);
    return path.substr(base.length);
  },
  search: () =>
    getParams(splitQuery(location.search)[1]),
  url: (url) => {
    if (isDefined(url) && url !== loc.url()) {
      history.pushState(null, null, locCfg.baseHref() + url);
    }
    let hash = loc.hash();
    return loc.path() + (hash ? "#" + hash : "");
  },
  replace: () => console.log(new Error('$location.replace() not impl')),
  onChange: (cb) => window.addEventListener("popstate", cb, false)
};

Object.assign(loc, hashLocation);
