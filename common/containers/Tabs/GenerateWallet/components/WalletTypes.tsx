import React from 'react';
import { Link } from 'react-router-dom';
import translate, { translateRaw } from 'translations';
import { WalletType } from '../GenerateWallet';
import { NewTabLink } from 'components/ui';
import { trezorReferralURL } from 'config';
import Template from './Template';
import MetamaskIcon from 'assets/images/wallets/metamask.svg';
import HardwareWalletIcon from 'assets/images/wallets/hardware.svg';
import FileIcon from 'assets/images/wallets/file.svg';
import './WalletTypes.scss';

interface State {
  isShowingGenerate: boolean;
}

export default class WalletTypes extends React.Component<{}, State> {
  public state: State = {
    isShowingGenerate: true
  };

  public render() {
    const { isShowingGenerate } = this.state;
    return (
      <Template hideBack={isShowingGenerate} onBack={this.handleBack}>
        {isShowingGenerate ? (
          <GenerateOptions />
        ) : (
          <WalletSuggestions showGenerate={this.showGenerate} />
        )}
      </Template>
    );
  }

  private showGenerate = () => {
    this.setState({ isShowingGenerate: true });
  };

  private handleBack = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    this.setState({ isShowingGenerate: false });
  };
}

const GenerateOptions: React.SFC<{}> = () => {
  const walletTypes = [
    {
      type: WalletType.Keystore,
      name: translateRaw('X_KEYSTORE2'),
      bullets: [
        translate('GENERATE_WALLET_KEYSTORE_1'),
        translate('GENERATE_WALLET_KEYSTORE_2'),
        translate('GENERATE_WALLET_KEYSTORE_3'),
        // translate('GENERATE_WALLET_KEYSTORE_4'),
        translate('GENERATE_WALLET_KEYSTORE_5')
      ]
    },
    {
      type: WalletType.Mnemonic,
      name: translateRaw('X_MNEMONIC'),
      bullets: [
        translate('GENERATE_WALLET_MNEMONIC_1'),
        translate('GENERATE_WALLET_MNEMONIC_2'),
        translate('GENERATE_WALLET_MNEMONIC_3'),
        // translate('GENERATE_WALLET_MNEMONIC_4'),
        translate('GENERATE_WALLET_MNEMONIC_5')
      ]
    }
  ];

  return (
    <React.Fragment>
      <div className="WalletTypes-topsection">
        <h2 className="WalletTypes-topsection-title">{translate('GENERATE_WALLET_TITLE')}</h2>
      </div>
      {
        // <h1 className="WalletTypes-title">{translate('NAV_GENERATEWALLET')}</h1>
      }
      <div className="WalletTypes-types">
        {walletTypes.map(wallet => (
          <div key={wallet.type} className="WalletType">
            <h3 className="WalletType-title">{wallet.name}</h3>
            <ul className="WalletType-features">
              {wallet.bullets.map((bullet, idx) => (
                <li key={idx} className="WalletType-features-feature">
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="WalletType-select">
              <Link
                className="WalletType-select-btn btn btn-default btn-block"
                to={`/generate/${wallet.type}`}
              >
                {translate('GENERATE_THING', { $thing: wallet.name })}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};
