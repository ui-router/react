import {services, isDefined} from 'ui-router-core';
import {LocationConfig, LocationServices} from 'ui-router-core';
import {HistoryImplementation} from './interface';
import {splitHash, splitQuery, trimHashVal, getParams} from './utils';

let hashPrefix: string = '';
let baseHref: string = '';

const locationServiceConfig: LocationConfig = {
  port: () =>
    parseInt(location.port),
  protocol: () =>
    location.protocol,
  host: () =>
    location.host,
  baseHref: () =>
    baseHref,
  html5Mode: () =>
    false,
  hashPrefix: (newprefix?: string): string => {
    if(isDefined(newprefix)) {
      hashPrefix = newprefix;
    }
    return hashPrefix;
  }
}

const locationService: LocationServices = {
  hash: () =>
      splitHash(trimHashVal(location.hash))[1],
  path: () =>
      splitHash(splitQuery(trimHashVal(location.hash))[0])[0],
  search: () =>
    getParams(splitQuery(splitHash(trimHashVal(location.hash))[0])[1]),
  setUrl: (url: string, replace: boolean = true) => {
    if (url) location.hash = url;
  },
  url: () => {
    return services.location.path();
  },
  onChange: (cb: EventListener) => window.addEventListener("hashchange", cb, false) as any
}

export const hashHistory: HistoryImplementation = {
  service: locationService,
  configuration: locationServiceConfig
}