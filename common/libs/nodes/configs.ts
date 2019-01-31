import { RawNodeConfig } from 'types/node';
import { StaticNetworkIds } from 'types/network';

export const makeNodeName = (network: string, name: string) => {
  return `${network.toLowerCase()}_${name}`;
};

export const NODE_CONFIGS: { [key in StaticNetworkIds]: RawNodeConfig[] } = {
  ETH: [
    {
      name: makeNodeName('ETH', 'localhost'),
      type: 'rpc',
      service: 'Localhost',
      url: 'http://localhost:22000'
    },
    {
      name: makeNodeName('ETH', 'transactionexc1'),
      type: 'rpc',
      service: 'Europe',
      url: 'http://ec2-3-80-165-200.compute-1.amazonaws.com:8080'
    },
    {
      name: makeNodeName('ETH', 'transactionexc2'),
      type: 'rpc',
      service: 'Korea',
      url: 'http://ec2-34-219-140-122.us-west-2.compute.amazonaws.com:8080'
    },
    {
      name: makeNodeName('ETH', 'transactionexc3'),
      type: 'rpc',
      service: 'Singapore',
      url: 'http://ec2-54-255-248-144.ap-southeast-1.compute.amazonaws.com:8080'
    }
  ]
};

export default NODE_CONFIGS;
