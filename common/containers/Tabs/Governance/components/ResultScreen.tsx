import React from 'react';
import { ContractFuncNames } from '..';
import { translateRaw } from 'translations';

interface Props {
  isPromotion: boolean;
  txHash: string;
  governanceCallName: ContractFuncNames;
}

interface State {}

class ResultScreen extends React.Component<Props, State> {
  render() {
    return (
      <div>
        <h1>Hello, World</h1>
        <ul>
          <li>My name is ResultScreen and you're looking at a result</li>
          <li>Was this a promotion? : {this.props.isPromotion}</li>
          <li>txHash: {this.props.txHash}</li>
          <li>Current Call: {this.props.governanceCallName} </li>
        </ul>
      </div>
    );
  }
}

export default ResultScreen;
