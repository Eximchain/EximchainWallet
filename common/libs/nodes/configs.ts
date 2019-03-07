import { RawNodeConfig } from 'types/node';
import { StaticNetworkIds } from 'types/network';

export const makeNodeName = (network: string, name: string) => {
  return `${network.toLowerCase()}_${name}`;
};

export const NODE_CONFIGS: { [key in StaticNetworkIds]: RawNodeConfig[] } = {
  ETH: [
    {
      name: makeNodeName('ETH', 'gamma'),
      type: 'rpc',
      service: 'GAMMA testnet',
      url: 'https://gamma-tx-executor-us-east.eximchain-dev.com'
    }
    // {
    //   name: makeNodeName('ETH', 'localhost'),
    //   type: 'rpc',
    //   service: 'Local',
    //   url: 'http://localhost:22000'
    // },
    // {
    //   name: makeNodeName('ETH', 'transactionexc1'),
    //   type: 'rpc',
    //   service: 'Europe',
    //   url: 'https://tx-executor-us-east.eximchain.com'
    // },
    // {
    //   name: makeNodeName('ETH', 'transactionexc2'),
    //   type: 'rpc',
    //   service: 'Korea',
    //   url: 'https://tx-executor-us-west.eximchain.com'
    // },
    // {
    //   name: makeNodeName('ETH', 'transactionexc3'),
    //   type: 'rpc',
    //   service: 'Singapore',
    //   url: 'https://tx-executor-singapore.eximchain.com '
    // }
  ]
};

export default NODE_CONFIGS;
