import React, { Component } from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';

import translate from 'translations';
import TabSection from 'containers/TabSection';
import SubTabs from 'components/SubTabs';
import { RouteNotFound } from 'components/RouteNotFound';
import { Interact } from './components/Interact';
import { Deploy } from './components/Deploy';

import './index.scss';
enum FunctionCallName {
  VOTE = 'vote',
  CLAIM = 'claim',
  COLLECT = 'collect'
}
interface FunctionCallDesc {
  icon?: string;
  description?: string;
  example: string;
}
type FunctionCall = { [key in FunctionCallName]: FunctionCallDesc };
class Governance extends Component<RouteComponentProps<{}>> {
  public FUNCTIONCALLS: FunctionCall = {
    [FunctionCallName.VOTE]: {
      example: 'Vote or nominate an address'
    },
    [FunctionCallName.CLAIM]: {
      example: 'Claim your tokens'
    },
    [FunctionCallName.COLLECT]: {
      example: 'Collect your tokens'
    }
  };
  public buildFunctionOptions() {
    return (
      <div className="WalletDecrypt-wallets-row">
        {this.FUNCTIONCALLS.map((functionCall: FunctionCalls) => {})}
      </div>
    );
  }
  public render() {
    const { match, location, history } = this.props;
    const currentPath = match.url;

    return (
      <TabSection>
        <section className="Tab-content">
          <div class="WalletButton" tabindex="0" aria-disabled="false">
            button1
          </div>
          <div class="WalletButton" tabindex="0" aria-disabled="false">
            button2
          </div>
          <div class="WalletButton" tabindex="0" aria-disabled="false">
            button3
          </div>
        </section>
      </TabSection>
    );
  }
}

export default connect(null, {})(Governance);
