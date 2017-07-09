declare var jest, describe, it, expect, beforeEach, afterEach;

import * as React from 'react';
import {shallow, mount, render} from 'enzyme';
import * as sinon from 'sinon';

import {UIRouterReact, UIView, UISref, ReactStateDeclaration} from '../index';
import {services, UrlMatcher} from 'ui-router-core';

describe('UIRouterReact class', () => {
  let router;
  let sandbox;

  beforeEach(() => {
    router = new UIRouterReact();
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('starts the router with start() method', () => {
    let stub1 = sandbox.stub(router.urlRouter, 'listen');
    let stub2 = sandbox.stub(router.urlRouter, 'sync');
    router.start();
    expect(stub1.calledOnce).toBe(true);
    expect(stub2.calledOnce).toBe(true);
  });
});
