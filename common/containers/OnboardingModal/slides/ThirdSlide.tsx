import React from 'react';

import translate, { translateRaw } from 'translations';
import trezor from 'assets/images/icn-trezor-new.svg';
// import ledger from 'assets/images/icn-ledger-nano.svg';
import { HardwareWalletChoice, OnboardingButton } from '../components';
import './ThirdSlide.scss';

export default function ThirdSlide() {
  return (
    <section className="ThirdSlide">
      <section>
        <h1>{translate('ONBOARDING_TEXT_25')}</h1>
        <p>{translate('ONBOARDING_TEXT_26')}</p>
        <section className="ThirdSlide-wallets">
          <HardwareWalletChoice
            image={trezor}
            text={translateRaw('ONBOARDING_TEXT_27')}
            link="https://shop.trezor.io/"
          />
        </section>
        <OnboardingButton />
      </section>
    </section>
  );
}
