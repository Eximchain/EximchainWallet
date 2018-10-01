import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router';

import translate from 'translations';
import TabSection from 'containers/TabSection';
import SubTabs from 'components/SubTabs';
import { RouteNotFound } from 'components/RouteNotFound';
import SignMessage from './components/SignMessage';
import VerifyMessage from './components/VerifyMessage';

interface State {
  activeTab: 'sign' | 'verify';
}

export default class SignAndVerifyMessage extends Component<RouteComponentProps<{}>, State> {
  public state: State = {
    activeTab: 'sign'
  };

  public changeTab = (activeTab: State['activeTab']) => () => this.setState({ activeTab });

  public render() {
    const { match, location, history } = this.props;
    const currentPath = match.url;

    const tabs = [
      {
        path: 'sign',
        name: translate('NAV_SIGNMSG')
      },
      {
        path: 'verify',
        name: translate('MSG_VERIFY')
      }
    ];

    return (
      <TabSection>
        <div className="ContractSection-topsection">
          <h1 className="ContractSection-topsection-title">
            {translate('GENERATE_SIGNANDVERIFY_TITLE')}
          </h1>
          <p className="ContractSection-topsection-subtitle">
            {translate('GENERATE_SIGNANDVERIFY_DESC')}
          </p>
        </div>
        <section className="Tab-content SignAndVerifyMsg">
          <SubTabs tabs={tabs} match={match} location={location} history={history} />
          <Switch>
            <Route
              exact={true}
              path={currentPath}
              render={() => <Redirect from={`${currentPath}`} to={`${currentPath}/sign`} />}
            />
            <Route exact={true} path={`${currentPath}/sign`} component={SignMessage} />
            <Route exact={true} path={`${currentPath}/verify`} component={VerifyMessage} />
            <RouteNotFound />
          </Switch>
        </section>
      </TabSection>
    );
  }
}
