import * as React from "react";
import {UiView} from "../src/index";

export class Nest extends React.Component<any,any> {
  constructor (props) {
    super(props);
  }
  render() {
    return (
        <div>
          <h2>Nested</h2>
          <p>Resolved foo is: {this.props.foo}</p>
        </div> 
    );
  }
}
