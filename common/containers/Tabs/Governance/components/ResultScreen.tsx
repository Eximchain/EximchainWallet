import React from 'react';
import { CostlyContractCallName } from '..';
import { translateRaw } from 'translations';
import './ResultScreen.scss';
import { Button } from './Button';
import voteIllustration from 'assets/images/vote-or-nominate.svg';
import claimIllustration from 'assets/images/claim-tokens.svg';
import collectIllustration from 'assets/images/collect-tokens.svg';

interface Props {
  isPromotion: boolean;
  txHash: string;
  backToGovernance: () => void;
  governanceCallName: CostlyContractCallName;
}

interface State {}

class ResultScreen extends React.Component<Props, State> {
  render() {
    const { isPromotion, txHash, governanceCallName } = this.props;
    let illustration, heading;
    switch (governanceCallName) {
      case CostlyContractCallName.VOTE:
        heading = `${isPromotion ? 'Promotion' : 'Demotion'} Ballot Entry Cast!`;
        illustration = voteIllustration;
        break;
      case CostlyContractCallName.CLAIM:
        heading = 'Tokens Claimed';
        illustration = claimIllustration;
        break;
      case CostlyContractCallName.COLLECT:
        heading = 'Tokens Collected';
        illustration = collectIllustration;
    }
    return (
      <div className="mainResultScreenFlexContainer">
        <div style={{ flex: 1 }} />
        <div style={{ flex: 2 }}>
          <div className="mainResultScreenBody">
            <div className="resultFlexRow">
              <div className="resultImgCol">
                <img
                  src={illustration}
                  style={{ flexBasis: '256px', minWidth: '160px', maxWidth: '256px' }}
                />
              </div>
              <div className="resultContentCol">
                <h2 className="resultContent-header">{heading}</h2>
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
                    className="resultScreenBtnLink btn btn-default resultScreenBtnLink-main"
                    target={'_blank'}
                    href={`https://eximchain.explorer.epirus.blk.io/transaction/${
                      this.props.txHash
                    }`}
                  >
                    Verify on blk.io
                  </a>
                  <a
                    className="resultScreenBtnLink btn btn-default resultScreenBtnLink-main"
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
                className="resultScreenBtnLink btn btn-primary resultScreenBtnLink-back"
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
