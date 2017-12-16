import * as React from 'react';
import { UIViewInjectedProps } from '@uirouter/react';

export class Nest extends React.Component<UIViewInjectedProps, any> {
  uiCanExit = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  render() {
    const { foo } = this.props.resolves;
    return (
      <div>
        <h2>Nested</h2>
        <p>Resolved foo is: {foo}</p>
      </div>
    );
  }
}
