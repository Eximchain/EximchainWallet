import React from 'react';

import translate from 'translations';
import { OnboardingButton } from '../components';
import walletillustration from 'assets/images/eximchain-wallet-illustration.svg';

export default function FirstSlide() {
  return (
    <section className="FirstSlide">
      <img src={walletillustration} />
      <h1>{translate('ONBOARDING_TEXT_1')}</h1>
      <p className="OnboardingModal-subtitle">{translate('ONBOARDING_TEXT_2')}</p>
      <p className="OnboardingModal-disclaimer">{translate('ONBOARDING_TEXT_19')}</p>
      <OnboardingButton />
    </section>
  );
}
