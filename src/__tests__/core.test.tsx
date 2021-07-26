import { servicesPlugin, memoryLocationPlugin } from '@uirouter/core';

import { UIRouterReact, StartMethodCalledMoreThanOnceError } from '../index';

describe('UIRouterReact class', () => {
  let router: UIRouterReact;

  beforeEach(() => {
    router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(memoryLocationPlugin);
  });

  it('starts the router with start() method', () => {
    let urlRouterListenSpy = jest.spyOn(router.urlService, 'listen');
    let urlRouterSyncSpy = jest.spyOn(router.urlService, 'sync');
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
