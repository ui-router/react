
declare var jest, describe, it, expect, beforeEach, afterEach;

import * as React from "react";
import { shallow, mount, render } from "enzyme";
import * as sinon from "sinon";

import UIRouterReact, {UIView, UISref, ReactStateDeclaration} from "../index";
import {services, UrlMatcher} from 'ui-router-core';

describe('Location service', () => {

  let router;
  let stub;
  let sandbox;
  let makeMatcher;

  beforeEach(() => {
    router = new UIRouterReact();
    sandbox = sinon.sandbox.create();
    makeMatcher = (url, config?) => {
      return new UrlMatcher(url, router.urlMatcherFactory.paramTypes, config)
    }
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('with hashLocation', () => {

    let locationProvider = services.location;
    beforeEach(() => {
      router = new UIRouterReact();
      router.stateRegistry.register({
        url: '/path/:urlParam?queryParam',
        name: 'path'
      });
      router.start();
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

  describe('with pushStateLocation', () => {

    let locationProvider = services.location;
    beforeEach(() => {
      router.html5Mode(true);
      router.stateRegistry.register({
        url: '/path/:urlParam?queryParam',
        name: 'path'
      });
      router.start();
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
});