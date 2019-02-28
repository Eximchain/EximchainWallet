import React from 'react';

import { translateRaw } from 'translations';

interface Props {
  isPromotion: boolean;
  txHash: string;
}

interface State {}

export class ResultScreen extends React.Component<Props, State> {
  render() {
    return (
      <div>
        <h1>Hello, World</h1>
        <ul>
          <li>My name is ResultScreen and you're looking at a result</li>
          <li>Was this a promotion? : {this.props.isPromotion}</li>
          <li>txHash: {this.props.txHash}</li>
        </ul>
      </div>
    );
  }
}
