import { servicesPlugin, memoryLocationPlugin } from '@uirouter/core';

import { UIRouterReact, StartMethodCalledMoreThanOnceError } from '../index';

describe('UIRouterReact class', () => {
  let router;
  let sandbox;

  beforeEach(() => {
    router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(memoryLocationPlugin);
  });

  it('starts the router with start() method', () => {
    let urlRouterListenSpy = jest.spyOn(router.urlRouter, 'listen');
    let urlRouterSyncSpy = jest.spyOn(router.urlRouter, 'sync');
    router.start();
    expect(urlRouterListenSpy).toHaveBeenCalled();
    expect(urlRouterSyncSpy).toHaveBeenCalled();
  });

  it('should throw if `start` is called more than once', () => {
    expect(() => {
      router.start();
      router.start();
    }).toThrow(StartMethodCalledMoreThanOnceError);
  });
});
