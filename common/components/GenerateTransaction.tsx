import React from 'react';

import translate from 'translations';
import { SigningStatus } from 'components';
import { GenerateTransactionFactory } from './GenerateTransactionFactory';
import './GenerateTransaction.scss';

interface OwnProps {
  isGovernanceTransaction?: boolean;
  onClick?: any;
}
export const GenerateTransaction: React.SFC<OwnProps> = props => {
  return (
    <React.Fragment>
      <GenerateTransactionFactory
        isGovernanceTransaction={props.isGovernanceTransaction}
        withProps={({ disabled, isWeb3Wallet, onClick }) => (
          <React.Fragment>
            <button
              disabled={disabled}
              className="btn btn-primary btn-block GenerateTransaction"
              onClick={() => {
                onClick();
                if (!isWeb3Wallet) {
                  props.onClick();
                }
              }}
            >
              {isWeb3Wallet ? translate('SEND_GENERATE') : translate('DEP_SIGNTX')}
            </button>
          </React.Fragment>
        )}
      />
      <SigningStatus />
    </React.Fragment>
  );
};
