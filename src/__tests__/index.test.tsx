declare var jest, describe, it, expect, beforeEach, afterEach;

import * as React from "react";
import { shallow, mount, render } from "enzyme";
import * as sinon from "sinon";

import UIRouterReact, {UIView, UISref, ReactStateDeclaration} from "../index";
import {services, UrlMatcher} from 'ui-router-core';

describe("UIRouterReact class", () => {

  let router;
  let sandbox;

  beforeEach(() => {
    router = new UIRouterReact();
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('creates a new instance correctly', () => { 
    expect(router).toEqual(UIRouterReact.instance);
  });

  it('starts the router with start() method', () => {
    let stub1 = sandbox.stub(router.urlRouter, 'listen');
    let stub2 = sandbox.stub(router.urlRouter, 'sync');
    router.start();
    expect(stub1.calledOnce).toBe(true);
    expect(stub2.calledOnce).toBe(true);
  });

  it('defaults to hashLocation history implementation', () => {
    let stub = sandbox.stub(window, 'addEventListener');
    router = new UIRouterReact();
    services.location.onChange(() => {});
    expect(stub.firstCall.args[0]).toBe('hashchange');
  });

  it('sets pushState history implementation in html5 mode', () => {
    let stub = sandbox.stub(window, 'addEventListener');
    router = new UIRouterReact();
    router.html5Mode(true);
    services.location.onChange(() => {});
    expect(stub.firstCall.args[0]).toBe('popstate');
  });

});

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

  describe('in html5 mode', () => {

    beforeEach(() => {
      router.html5Mode(true);
      router.start();
    });

    it('uses history.pushState when setting a url', () => {
      let stub = sandbox.stub(history, 'pushState');
      router.urlRouter.push(makeMatcher('/hello/:name'), { name: 'world' });
      expect(stub.firstCall.args[2]).toBe('/hello/world');
    });

    it('uses history.replaceState when setting a url with replace', () => {
      let stub = sandbox.stub(history, 'replaceState');
      router.urlRouter.push(makeMatcher('/hello/:name'), { name: 'world' }, { replace: true });
      expect(stub.firstCall.args[2]).toBe('/hello/world');
    });
  });

});