import * as React from "react";
import {UIView} from "../src/index";

export class Child extends React.Component<any,any> {
  render() {
    return (
      <div>
        <h2>Child</h2>
        <UIView/> 
      </div>
    );
  }
}
