import React, { Component } from 'react';

import { SendButton, TXMetaDataPanel } from 'components';
import WalletDecrypt, { DISABLE_WALLETS } from 'components/WalletDecrypt';
import { FullWalletOnly } from 'components/renderCbs';
import { AmountField } from './AmountField';

interface OwnProps {
  button: React.ReactElement<any>;
}

export class Fields extends Component<OwnProps> {
  public render() {
    const makeContent = () => (
      <React.Fragment>
        <div className="GovernanceSection-transaction-screen">
          <TXMetaDataPanel
            className="form-group"
            initialState="advanced"
            disableToggle={true}
            advancedGasOptions={{ dataField: true }}
            shouldTransactionReset={false}
          />
          {this.props.button}
        </div>
        <SendButton />
      </React.Fragment>
    );

    const makeDecrypt = () => (
      <WalletDecrypt disabledWallets={DISABLE_WALLETS.READ_ONLY} shouldTransactionReset={false} />
    );

    return <FullWalletOnly withFullWallet={makeContent} withoutFullWallet={makeDecrypt} />;
  }
}
