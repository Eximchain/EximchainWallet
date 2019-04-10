import React, { Component } from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';

import translate from 'translations';
import { FreeContractCallScreen } from './components/FreeContractCallScreen';
import { CostlyContractCallScreen } from './components/CostlyContractCallScreen';
import GovernanceClass from 'index';

import './index.scss';

const tabs = [
  {
    path: 'landingpage',
    name: translate('LANDING_PAGE')
  },
  {
    path: 'freeinteract',
    name: translate('FREE_INTERACTION')
  },
  {
    path: 'costlyinteract',
    name: translate('COSTLY_INTERACTION')
  }
];

class Governance extends Component<RouteComponentProps<{}>> {
  public render() {
    const { match, location, history } = this.props;
    const currentPath = match.url;

    return (
      <Switch>
        <Route
          exact={true}
          path={currentPath}
          render={() => <Redirect from={`${currentPath}`} to={`${currentPath}`} />}
        />
        <Route exact={true} path={`${currentPath}`} component={GovernanceClass} />
      </Switch>
    );
  }
}

export default connect(null, {})(Governance);
