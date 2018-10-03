import { translateRaw } from 'translations';
import {
  discordURL,
  ledgerReferralURL,
  trezorReferralURL,
  // safeTReferralURL,
  ethercardReferralURL,
  keepkeyReferralURL,
  steelyReferralURL
} from './data';

interface Link {
  link: string;
  text: string;
}

export const DOWNLOAD_MYCRYPTO_LINK = 'https://wallet.eximchain.com/download';

export const socialMediaLinks: Link[] = [
  {
    link: 'https://twitter.com/eximchainexc',
    text: 'twitter'
  },
  {
    link: 'https://www.facebook.com/eximchain/',
    text: 'facebook'
  },
  {
    link: 'https://medium.com/@eximchain',
    text: 'medium'
  },
  {
    link: 'https://www.linkedin.com/company/eximchain',
    text: 'linkedin'
  },
  {
    link: 'https://github.com/Eximchain',
    text: 'github'
  }
];

export const productLinks: Link[] = [

];

export const affiliateLinks: Link[] = [
  {
    link: ledgerReferralURL,
    text: translateRaw('LEDGER_REFERRAL_1')
  },
  {
    link: trezorReferralURL,
    text: translateRaw('TREZOR_REFERAL')
  }

];

export const partnerLinks: Link[] = [

];
