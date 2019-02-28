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
        <ul>
          <li>Was this a promotion? : {this.props.isPromotion}</li>
          <li>txHash: {this.props.txHash}</li>
        </ul>
      </div>
    );
  }
}
