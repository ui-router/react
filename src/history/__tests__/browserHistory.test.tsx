declare var jest, describe, it, expect, beforeEach, afterEach;

import * as React from "react";
import { shallow, mount, render } from "enzyme";
import * as sinon from "sinon";

import UIRouterReact, {UIView, UISref, ReactStateDeclaration, browserHistory} from "../../index";
import {services, UrlMatcher} from 'ui-router-core';

describe('browserHistory implementation', () => {

  let router;
  let stub;
  let sandbox;
  let makeMatcher;
  let locationProvider = services.location;

  beforeEach(() => {
    router = new UIRouterReact(browserHistory);
    sandbox = sinon.sandbox.create();
    makeMatcher = (url, config?) => {
      return new UrlMatcher(url, router.urlMatcherFactory.paramTypes, config)
    }
    router.stateRegistry.register({
        url: '/path/:urlParam?queryParam',
        name: 'path'
      });
      router.start();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('uses history.pushState when setting a url', () => {
    expect(services.locationConfig.html5Mode()).toBe(true);
    let stub = sandbox.stub(history, 'pushState');
    router.urlRouter.push(makeMatcher('/hello/:name'), { name: 'world' });
    expect(stub.firstCall.args[2]).toBe('/hello/world');
  });

  it('uses history.replaceState when setting a url with replace', () => {
    let stub = sandbox.stub(history, 'replaceState');
    router.urlRouter.push(makeMatcher('/hello/:name'), { name: 'world' }, { replace: true });
    expect(stub.firstCall.args[2]).toBe('/hello/world');
  });

  it('returns the correct url query', () => {
    expect(services.locationConfig.html5Mode()).toBe(true);
    return router.stateService.go('path', {urlParam: 'bar'}).then(() => {
      expect(window.location.toString().includes('/path/bar')).toBe(true);
      expect(window.location.toString().includes('/#/path/bar')).toBe(false);
      expect(locationProvider.path()).toBe('/path/bar');
      expect(locationProvider.search()).toEqual({'':''});
      return router.stateService.go('path', {urlParam: 'bar', queryParam: 'query'});
    }).then(() => {
      expect(window.location.toString().includes('/path/bar?queryParam=query')).toBe(true);
      expect(window.location.toString().includes('/#/path/bar?queryParam=query')).toBe(false);
      expect(locationProvider.path()).toBe('/path/bar');
      expect(locationProvider.search()).toEqual({queryParam:'query'});
    });
  });

});