import React from 'react';
import { Link } from 'react-router-dom';

import translate from 'translations';
import { WalletType } from '../GenerateWallet';
import './FinalSteps.scss';

interface Props {
  walletType: WalletType;
}

const FinalSteps: React.SFC<Props> = ({ walletType }) => {
  // const steps = [
  // {
  //   name: translate('CREATE_FINAL_STEP_1'),
  //   image: process.env.BUILD_ELECTRON ? OpenAppImage : OpenWebImage
  // },
  // {
  //   name: translate('CREATE_FINAL_STEP_2'),
  //   image: process.env.BUILD_ELECTRON ? TabAppImage : TabWebImage
  // }
  // ];
  console.log(walletType);
  // if (walletType === WalletType.Keystore) {
  //   steps.push({
  //     name: translate('CREATE_FINAL_STEP_3'),
  //     image: SelectKeystoreImage
  //   });
  //   steps.push({
  //     name: translate('CREATE_FINAL_STEP_4_KEYSTORE'),
  //     image: ProvideKeystoreImage
  //   });
  // } else if (walletType === WalletType.Mnemonic) {
  //   steps.push({
  //     name: translate('CREATE_FINAL_STEP_3'),
  //     image: SelectMnemonicImage
  //   });
  //   steps.push({
  //     name: translate('CREATE_FINAL_STEP_4_MNEMONIC'),
  //     image: ProvideMnemonicImage
  //   });
  // }

  return (
    <div className="FinalSteps">
      <h1 className="FinalSteps-title">{translate('ADD_LABEL_6')}</h1>
      <p className="FinalSteps-help">{translate('MNEMONIC_FINAL_DESCRIPTION')}</p>
      <div className="FinalSteps-steps row">
        {/* {steps.map((step, index) => (
          <div key={index} className="StepBox col-lg-3 col-sm-6 col-xs-12">
            <h4 className="StepBox-title">{step.name}</h4>
            <div className="StepBox-screen">
              <img className="StepBox-screen-img" src={step.image} />
              <div className="StepBox-screen-number">{index + 1}</div>
            </div>
          </div>
        ))} */}
      </div>
      <div className="FinalSteps-buttons">
        <Link to="/account" className="FinalSteps-buttons-btn btn btn-primary ">
          {translate('GO_TO_ACCOUNT')}
        </Link>
      </div>
    </div>
  );
};

export default FinalSteps;
