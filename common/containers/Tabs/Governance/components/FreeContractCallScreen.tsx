import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { ContractCall } from '..';
import translate, { translateRaw } from 'translations';

import TabSection from 'containers/TabSection';
import { Button } from './Button';

interface Props {
  contractCall: ContractCall;
  goBack: () => void;
}

export class FreeContractCallScreen extends Component<Props> {
  render() {
    return (
      <div>
        {translate(this.props.contractCall.name)}
        <Button key="Back" name="Back Button" onClick={this.props.goBack} description="go back" />
      </div>
    );
  }
}

export default connect(null, {})(FreeContractCallScreen);
