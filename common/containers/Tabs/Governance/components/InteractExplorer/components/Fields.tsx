import React, { Component } from 'react';

import { SendButton, TXMetaDataPanel } from 'components';
import WalletDecrypt, { DISABLE_WALLETS } from 'components/WalletDecrypt';
import { FullWalletOnly } from 'components/renderCbs';
import translate from 'translations';

interface OwnProps {
  button: React.ReactElement<any>;
}

export class Fields extends Component<OwnProps> {
  public render() {
    const makeContent = () => (
      <React.Fragment>
        <div className="GovernanceSection-form-write">
          <h2 className="FormInput-title">{translate('GovernanceTransactionFee')}</h2>
          <p className="FormInput-subtitle">{translate('GovernanceTransactionFeeDescription')}</p>
        </div>
        <div className="GovernanceSection-transaction-screen">
          <TXMetaDataPanel
            className="form-group"
            initialState="advanced"
            disableToggle={true}
            advancedGasOptions={{ dataField: true }}
            shouldTransactionReset={false}
            autoGenGasLimit={false}
          />
          {this.props.button}
          <SendButton />
        </div>
      </React.Fragment>
    );

    const makeDecrypt = () => (
      <React.Fragment>
        <div className="GovernanceSection-form-write">
          <h2 className="FormInput-title">{translate('UnlockWallet')}</h2>
          <p className="FormInput-subtitle">{translate('UnlockWalletDescription')}</p>
        </div>
        <WalletDecrypt disabledWallets={DISABLE_WALLETS.READ_ONLY} shouldTransactionReset={false} />
      </React.Fragment>
    );

    return (
      <React.Fragment>
        <FullWalletOnly withFullWallet={makeContent} withoutFullWallet={makeDecrypt} />
      </React.Fragment>
    );
  }
}
