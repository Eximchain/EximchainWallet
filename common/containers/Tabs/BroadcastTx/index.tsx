import React, { Component } from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';
import { toBuffer, bufferToHex } from 'ethereumjs-util';
import EthTx from 'ethereumjs-tx';

import translate from 'translations';
import { computeIndexingHash, getTransactionFields, makeTransaction } from 'libs/transaction';
import { AppState } from 'features/reducers';
import * as selectors from 'features/selectors';
import { transactionSignActions } from 'features/transaction';
import { QRCode, Input, CodeBlock } from 'components/ui';
import { SendButton } from 'components/SendButton';
import './index.scss';

import TabSection from 'containers/TabSection';
import { RouteNotFound } from 'components/RouteNotFound';

interface StateProps {
  stateTransaction: AppState['transaction']['sign']['local']['signedTransaction'];
}
interface DispatchProps {
  signLocalTransactionSucceeded: transactionSignActions.TSignLocalTransactionSucceeded;
  signTransactionFailed: transactionSignActions.TSignTransactionFailed;
}
interface State {
  userInput: string;
}
const INITIAL_STATE: State = { userInput: '' };

type Props = DispatchProps & StateProps & RouteComponentProps<{}>;

const getStringifiedTx = (serializedTx: Buffer) =>
  JSON.stringify(getTransactionFields(makeTransaction(serializedTx)), null, 2);

class BroadcastTx extends Component<Props> {
  public state: State = INITIAL_STATE;

  public render() {
    const { userInput } = this.state;
    const { stateTransaction } = this.props;
    const currentPath = this.props.match.url;
    return (
      <TabSection isUnavailableOffline={true}>
        <div className="Tab-content-pane row block">
          <Switch>
            <Route
              exact={true}
              path={currentPath}
              render={() => (
                <div className="BroadcastTx-topsection">
                  <h1 className="BroadcastTx-topsection-title text-center">
                    {translate('BROADCAST_TX_TITLE')}
                  </h1>

                  <p className="BroadcastTx-topsection-help text-center">
                    {translate('BROADCAST_TX_DESCRIPTION')}
                  </p>

                  <div className="BroadcastTx-input input-group-wrapper InteractForm-interface">
                    <label className="input-group">
                      <div className="input-group-header">{translate('SEND_SIGNED')}</div>
                      <Input
                        type="text"
                        placeholder="0xf86b...f474"
                        isValid={!!stateTransaction}
                        value={userInput}
                        onChange={this.handleChange}
                      />
                    </label>
                  </div>

                  {stateTransaction && (
                    <React.Fragment>
                      <label>{translate('SEND_RAW')}</label>
                      <CodeBlock>{getStringifiedTx(stateTransaction)}</CodeBlock>
                    </React.Fragment>
                  )}

                  <SendButton className="Broadcast-Tx-form-group" />

                  <div className="BroadcastTx-qr">
                    {stateTransaction && <QRCode data={bufferToHex(stateTransaction)} />}
                  </div>
                </div>
              )}
            />
            <RouteNotFound />
          </Switch>
        </div>
      </TabSection>
    );
  }

  protected handleChange = ({ currentTarget }: React.FormEvent<HTMLInputElement>) => {
    const { value } = currentTarget;
    this.setState({ userInput: value });
    try {
      const bufferTransaction = toBuffer(value);
      const tx = new EthTx(bufferTransaction);
      if (!tx.verifySignature()) {
        throw Error();
      }
      const indexingHash = computeIndexingHash(bufferTransaction);
      this.props.signLocalTransactionSucceeded({
        signedTransaction: bufferTransaction,
        indexingHash,
        noVerify: true
      });
    } catch {
      this.props.signTransactionFailed();
    }
  };
}

export default connect(
  (state: AppState) => ({ stateTransaction: selectors.getSerializedTransaction(state) }),
  {
    signLocalTransactionSucceeded: transactionSignActions.signLocalTransactionSucceeded,
    signTransactionFailed: transactionSignActions.signTransactionFailed
  }
)(BroadcastTx);
