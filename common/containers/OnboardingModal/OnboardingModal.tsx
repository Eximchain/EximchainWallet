import React from 'react';
import { connect } from 'react-redux';

import { AppState } from 'features/reducers';
import { onboardingSelectors } from 'features/onboarding';
import { Modal } from 'components/v2';
import logo from 'assets/images/logo-eximchain-wallet-white.svg';
import chest from 'assets/images/icn-chest.svg';
import bankVsMyCrypto from 'assets/images/icn-bank-vs-eximchain-wallet.svg';
import vault from 'assets/images/icn-vault.svg';
import { ProgressDots } from './components';
import { FirstSlide, SecondSlide, ThirdSlide } from './slides';
import './OnboardingModal.scss';

interface StateProps {
  currentSlide: ReturnType<typeof onboardingSelectors.getSlide>;
}

function OnboardingModal({ currentSlide }: StateProps) {
  {
    // const images = [bankVsMyCrypto, vault, chest];
    // const logoImage = <img src={logo} alt="Eximchain Wallet logo white" />;
    // const slideImage = <img src={images[currentSlide - 1]} alt="Slide art" />;
  }
  const slides = [<FirstSlide key={1} />];
  const slide = slides[currentSlide - 1];

  return (
    <Modal>
      <section className="OnboardingModal">
        {
          // <section className="OnboardingModal-top">{logoImage}</section>
          // <section className="OnboardingModal-side">
          //   <section className="OnboardingModal-side-top">{logoImage}</section>
          //   <section className="OnboardingModal-side-middle">{slideImage}</section>
          //   <section className="OnboardingModal-side-bottom">
          //     <ProgressDots />
          //   </section>
          // </section>
        }
        <section className="OnboardingModal-middle">
          <div className="OnboardingModal-middle-topsection">{slide}</div>
        </section>
        {
          // <section className="OnboardingModal-bottom">
          //   {slideImage}
          //   <ProgressDots />
          // </section>
        }
      </section>
    </Modal>
  );
}

export default connect((state: AppState) => ({
  currentSlide: onboardingSelectors.getSlide(state)
}))(OnboardingModal);
