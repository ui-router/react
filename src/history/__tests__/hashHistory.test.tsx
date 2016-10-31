declare var jest, describe, it, expect, beforeEach, afterEach;

import * as React from "react";
import { shallow, mount, render } from "enzyme";
import * as sinon from "sinon";

import UIRouterReact, {UIView, UISref, ReactStateDeclaration, hashHistory} from "../../index";
import {services, UrlMatcher} from 'ui-router-core';

describe('hashHistory implementation', () => {

  let router;
  let stub;
  let sandbox;
  let makeMatcher;
  let locationProvider = services.location;

  beforeEach(() => {
    router = new UIRouterReact(hashHistory);
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

  it('defaults to hashLocation history implementation', () => {
    let stub = sandbox.stub(window, 'addEventListener');
    router = new UIRouterReact();
    services.location.onChange(() => {});
    expect(stub.firstCall.args[0]).toBe('hashchange');
  });

  it('returns the correct url query', () => {
    expect(services.locationConfig.html5Mode()).toBe(false);
    return router.stateService.go('path', {urlParam: 'bar'}).then(() => {
      expect(window.location.toString().includes('/#/path/bar')).toBe(true);
      expect(locationProvider.path()).toBe('/path/bar');
      expect(locationProvider.search()).toEqual({'':''});
      return router.stateService.go('path', {urlParam: 'bar', queryParam: 'query'});
    }).then(() => {
      expect(window.location.toString().includes('/#/path/bar?queryParam=query')).toBe(true);
      expect(locationProvider.path()).toBe('/path/bar');
      expect(locationProvider.search()).toEqual({queryParam:'query'});
    });
  });

});