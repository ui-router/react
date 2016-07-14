import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, registerStates, UiView } from '../src/index';

import {Home} from './home';
import {Child} from './child';
import {Nest} from './nest';
import {Header} from './header';

let home = { name: 'home', component: Home, url: '/home?foo' };
let child = { name: 'home.child', component: Child, url: '/child' };
let nest = {
	name: 'home.child.nest',
	views: {
		$default: Nest,
		"header@home": Header
	},
	url: '/nest',
	resolve: {
		foo: ($transition$) => {
			return new Promise<string>((resolve, reject) => {
				setTimeout(() => {
					resolve('bar');
				}, 1000);
			});
		}
	}
};
registerStates([home, child, nest]);

Router.urlRouterProvider.otherwise(() => "/home");
Router.urlRouter.listen();
Router.urlRouter.sync();

var el = document.getElementById("react-app");
ReactDOM.render(<UiView/>, el);