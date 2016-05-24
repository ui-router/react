import * as React from "react";
import {UiView} from "../src/index";

export class Child extends React.Component<any,any> {
  render() {
    return (
      <div>
        <h2>Child</h2>
        <UiView/> 
      </div>
    );
  }
}
