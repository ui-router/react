declare var jest, describe, it, expect, beforeEach;

import * as React from "react";
import { shallow, mount, render } from "enzyme";
import * as sinon from "sinon";

import UIRouterReact, {UIView, UISref, ReactStateDeclaration} from "../index";
import {services} from 'ui-router-core';

describe("UIRouterReact class", () => {

  let router;
  let stub;
  beforeEach(() => {
    router = new UIRouterReact();
  });

  it('creates a new instance correctly', () => { 
    expect(router).toEqual(UIRouterReact.instance);
  });

  it('starts the router with start() method', () => {
    let stub1 = sinon.stub(router.urlRouter, 'listen');
    let stub2 = sinon.stub(router.urlRouter, 'sync');
    router.start();
    expect(stub1.calledOnce).toBe(true);
    expect(stub2.calledOnce).toBe(true);
  });

  it('defaults to hashLocation history implementation', () => {
    stub = sinon.stub(window, 'addEventListener');
    router = new UIRouterReact();
    services.location.onChange(() => {});
    expect(stub.firstCall.args[0]).toBe('hashchange');
  });

  it('sets pushState history implementation in html5 mode', () => {
    router = new UIRouterReact();
    router.html5Mode(true);
    services.location.onChange(() => {});
    expect(stub.secondCall.args[0]).toBe('popstate');
  });

})