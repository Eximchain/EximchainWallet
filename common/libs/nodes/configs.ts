import { RawNodeConfig } from 'types/node';
import { StaticNetworkIds } from 'types/network';

export const makeNodeName = (network: string, name: string) => {
  return `${network.toLowerCase()}_${name}`;
};

export const NODE_CONFIGS: { [key in StaticNetworkIds]: RawNodeConfig[] } = {
  ETH: [
    {
      name: makeNodeName('ETH', 'eximchain wallet'),
      type: 'rpc',
      service: 'Localhost',
      url: 'http://localhost:22000'
    }
  ]
};

export default NODE_CONFIGS;
