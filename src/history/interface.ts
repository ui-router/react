import {LocationConfig, LocationServices} from 'ui-router-core';

export interface HistoryImplementation {
  service: LocationServices;
  configuration: LocationConfig;
}