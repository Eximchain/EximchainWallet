import React from 'react';
import { ContractFuncNames } from '..';
import { translateRaw } from 'translations';
import './ResultScreen.scss';
import { Button } from './Button';
import illustration from 'assets/images/vote-or-nominate.svg';

interface Props {
  isPromotion: boolean;
  txHash: string;
  backToGovernance: () => void;
  governanceCallName: ContractFuncNames;
}

interface State {}

class ResultScreen extends React.Component<Props, State> {
  render() {
    const { isPromotion, txHash } = this.props;
    return (
      <div className="mainResultScreenFlexContainer">
        <div style={{ flex: 1 }} />
        <div style={{ flex: 2 }}>
          <div className="mainResultScreenBody">
            <div className="resultFlexRow">
              <div className="resultImgCol">
                <img
                  src={illustration}
                  style={{ flexBasis: '256px', minWidth: '128px', maxWidth: '256px' }}
                />
              </div>
              <div className="resultContentCol">
                <h2>{isPromotion ? 'Promotion' : 'Demotion'} Ballot Entry Cast</h2>
                <p>
                  Your transaction has been sent and may take 3+ hours to confirm. You can use the
                  Verify and Check buttons below to check up on it.
                </p>
                <br />
                <dl>
                  <dt>Tx Hash</dt>
                  <dd>{txHash}</dd>
                </dl>
                <div className="resultFlexRow btnRow">
                  <a
                    className="resultScreenBtnLink resultScreenBtnLink-main"
                    target={'_blank'}
                    href={`https://eximchain.explorer.epirus.blk.io/transaction/${
                      this.props.txHash
                    }`}
                  >
                    Verify on blk.io
                  </a>
                  <a
                    className="resultScreenBtnLink resultScreenBtnLink-main"
                    href={`tx-status?txHash=${this.props.txHash}`}
                  >
                    Check transaction status
                  </a>
                </div>
              </div>
            </div>
            <br />
            <div className="resultFlexRow">
              <a
                className="resultScreenBtnLink resultScreenBtnLink-back"
                onClick={this.props.backToGovernance}
              >
                Back to Governance
              </a>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>
    );
  }
}

export default ResultScreen;
