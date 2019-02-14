import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { ContractFuncNames } from '..';
import TabSection from 'containers/TabSection';
import { Button } from './Button';

interface Props {
  contractFxnName: ContractFuncNames | null;
  goBack: () => void;
}

export class FreeContractCallScreen extends Component<Props> {
  render() {
    return (
      <TabSection isUnavailableOffline={true}>
        {this.props.contractFxnName}
        <Button key="Back" name="Back Button" onClick={this.props.goBack} description="go back" />
      </TabSection>
    );
  }
}

export default connect(null, {})(FreeContractCallScreen);
