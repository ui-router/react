import * as React from "react";
import {UiView, UiSref} from "../src/index";

export class Home extends React.Component<any,any> {
  render() {
    return (
      <div>
        UI-Router + React proof of concept
        <UiView name="header"></UiView>
        <UiSref to={'home'} params={{foo:'bar'}}>Home</UiSref>{' '}
        <UiSref to={'home.child'}>Child</UiSref> {' '}
        <a href="#/home/child/nest">Nest</a> {' '}
        <h2>Home</h2> 
        <UiView/>
      </div>
    );
  }
}
