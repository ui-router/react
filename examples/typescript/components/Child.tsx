import * as React from 'react';
import { UIView } from '@uirouter/react';

export class Child extends React.Component<any, any> {
  uiCanExit = () => {
    return Promise.resolve();
  };
  render() {
    return (
      <div>
        <h2>Child</h2>
        <UIView />
      </div>
    );
  }
}
