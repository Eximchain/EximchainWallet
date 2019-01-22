import React from 'react';

import translate from 'translations';
import { OnboardingButton } from '../components';
import './SecondSlide.scss';

export default function SecondSlide() {
  return (
    <section className="SecondSlide">
      <section>
        <h1>{translate('ONBOARDING_TEXT_8')}</h1>

        <p>{translate('ONBOARDING_TEXT_9')}</p>

        <OnboardingButton className="horizontal" />
      </section>
      <OnboardingButton className="vertical" />
    </section>
  );
}
