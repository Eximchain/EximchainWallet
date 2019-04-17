import {
  ethPlorer,
  ETHTokenExplorer,
  gasPriceDefaults,
  InsecureWalletName,
  SecureWalletName
} from 'config/data';
import { ETH_DEFAULT, ETH_LEDGER, ETH_TREZOR, ETH_SAFE_T } from 'config/dpaths';
import { makeExplorer } from 'utils/helpers';
// import { TAB } from 'components/Header/components/constants';
import * as types from './types';

// const testnetDefaultGasPrice = {
//   min: 0.1,
//   max: 40,
//   initial: 4
// };

export const STATIC_NETWORKS_INITIAL_STATE: types.ConfigStaticNetworksState = {
  ETH: {
    id: 'ETH',
    name: 'Eximchain',
    unit: 'EXC',
    chainId: 1,
    isCustom: false,
    color: '#267EDC',
    blockExplorer: makeExplorer({
      name: 'blk.io',
      origin: 'https://eximchain.explorer.epirus.blk.io'
    }),
    tokenExplorer: {
      name: ethPlorer,
      address: ETHTokenExplorer
    },
    tokens: require('config/tokens/eth.json'),
    contracts: require('config/contracts/eth.json'),
    dPathFormats: {
      [SecureWalletName.TREZOR]: ETH_TREZOR,
      [SecureWalletName.SAFE_T]: ETH_SAFE_T,
      [SecureWalletName.LEDGER_NANO_S]: ETH_LEDGER,
      [InsecureWalletName.MNEMONIC_PHRASE]: ETH_DEFAULT
    },
    gasPriceSettings: gasPriceDefaults,
    shouldEstimateGasPrice: true
  }
};

export function staticNetworksReducer(
  state: types.ConfigStaticNetworksState = STATIC_NETWORKS_INITIAL_STATE,
  action: any
) {
  switch (action.type) {
    default:
      return state;
  }
}
