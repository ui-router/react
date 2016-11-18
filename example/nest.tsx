import * as React from "react";
import {InjectedProps} from '../src';

export class Nest extends React.Component<InjectedProps,any> {
  uiCanExit = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  render() {
    const {foo} = this.props.resolves;
    return (
        <div>
          <h2>Nested</h2>
          <p>Resolved foo is: {foo}</p>
        </div> 
    );
  }
}
