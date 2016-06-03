import * as React from "react";
import {UiView, UiSref, UiSrefActive} from "../src/index";

export class Home extends React.Component<any,any> {
  render() {
    return (
      <div>
        UI-Router + React proof of concept
        <UiView name="header"></UiView>
        <UiSrefActive class={'active'}>
          <UiSref to={'home'} params={{foo:'bar'}}>Home</UiSref>
        </UiSrefActive>{' '}
        <UiSrefActive class={'active'}>
          <UiSref to={'home.child'}>Child</UiSref>
        </UiSrefActive>{' '}
        <UiSrefActive class={'active'}>
          <UiSref to={'home.child.nest'}>Nest</UiSref>
        </UiSrefActive>{' '}
        <h2>Home</h2> 
        <UiView/>
      </div>
    );
  }
}
