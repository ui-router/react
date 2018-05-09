import * as React from 'react';
import { UIView, UIViewInjectedProps } from '@uirouter/react';

export class Child extends React.Component<UIViewInjectedProps, any> {
  uiCanExit = () => {
    return Promise.resolve();
  };
  componentDidMount() {
    console.log('mounted');
  }
  handleClick = () => {
    this.props.transition.router.stateService.reload();
  };
  render() {
    return (
      <div>
        <h2>Child</h2>
        <UIView />
        <button onClick={this.handleClick}>remount</button>
      </div>
    );
  }
}
