import {services} from "ui-router-core";

import {$q} from './$q';
import {$injector} from './$injector';

services.$q = $q;
services.$injector = $injector;