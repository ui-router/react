import * as React from 'react';
import { UIViewInjectedProps } from '@uirouter/react';

interface NextInjectedProps extends UIViewInjectedProps {
  foo: string;
}

export class Nest extends React.Component<NextInjectedProps, any> {
  uiCanExit = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  render() {
    const { foo } = this.props;
    return (
      <div>
        <h2>Nested</h2>
        <p>Resolved foo is: {foo}</p>
      </div>
    );
  }
}
