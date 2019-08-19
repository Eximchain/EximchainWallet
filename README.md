# Eximchain Wallet

Eximchain wallet is a desktop wallet client that connects to the Eximchain network. We are currently still in beta, so if you see any issues, please report them to [support@eximchain.com](mailto:support@eximchain.com)


## Major Changes From MyCryptoWallet
This forked MyCryptoWallet contains some notable changes consisting of the following:

- Eximchain Governance Tab
- UI/Functionality Changes
- Bug Patches/Fixes
- Signing Releases

### Eximchain Governance Tab

The Governance Tab was originally a modified version of the Contracts tab, and still utilizes a lot of the same components to do the render the individual components. To maintain some more levels of consistency across the app it is within containers/tabs section of the folder.

Furthermore it can be broken down in to its file which consists of three primary components.

- The index.tsx/index.scss (which is the entry point of the tab)
- components/FreeContractCallScreen.tsx (handles any free reads from the governance smart contract)
- components/CostlyContractCallScreen.tsx (handles any writes/transactions to the governance smart contract)

The rest of the components are there to support the two contract call screens. Realstically, any of the calls made through this tab can also been done through the Contracts tab, but the governance tabs have further built in further checks to prevent users from submitting "bad" transactions that will later be rejected by the blockchain. That being said if there is a situation in which a "bad" transaction goes through our ui, rest assured, the governance smart contract will still not accept the transaction as it is not supported by the given state of the contract.

TODO: Dataflow from redux to the governance tab
- What pieces of the data is needed from the state in redux
  - The app state contains:
    - config
    - notifications
    - onboarding
    - ens
    - wallet
    - customTokens
    - rates
    - deterministicWallets
    - swap
    - transaction
    - transactions
    - message
    - addressBook
    - gas
    - schedule
    - routing
- How the contract abi is stored
  - Grabbing the contract abi
  - Passing the functions through to the costlycontractcall component
  - Passing the functions through to the freecontract call component
- How signing and submitting transaction works in costlycontractcall
  - Grabbing the input values for the transaction
  - How input validation works
  - How setting the gas price/ gas limit works
  - How the transaction to be sent is signed
  - How the the transaction is sent the web3 provider
- How reads happen in freecontractcall
  - Grabbing the input values for the read
  - Chaining contract calls
  - How input validation works
  - How the request is made through the web3 provider


TODO: Component structure within the governance tab
- Explain what props are passed in to FreeContractCall/CostlyContractCall components
- How the props are used
- What components are reused from Contracts
- How the components are then rendered

TODO: Validation on inputs before sending them to the blockchain.

### UI/Functionality Changes
TODO: Go over Chris's changes to match our design language various css style changes

TODO: Explain how we have changed gas limit/gas pricing functionality to be simpler, and the ui changes to reflect it.

TODO: Network changer overhaul

TODO: View and Send tab flow/layout changes

### Bug Patches/Fixes
TODO: Talk about the pr that andreweximchain made to MyCryptoWallet that fixed issues regarding ledger. 

TODO: Talk about fixing the recent transactions history

TODO: Updated packages to keep in line with some of the npm packages that suffered security vulnerablities


### Signing Releases
TODO: Issues regarding signing software with electron-builder


### [**⬇︎ Download the latest release**](https://github.com/Eximchain/EximchainWallet/releases)

## Requirements

* Node 8.9.4\*
* Yarn >= 1.7.0\*\*
* Python 2.7.X\*\*\*

<sub>\*Higher versions should work fine, but may cause inconsistencies. It's suggested you run 8.9.4 using `nvm`.</sub>
<br/>
<sub>**npm is NOT supported for package management. Eximchain Wallet uses yarn.lock to ensure sub-dependency versions are pinned, so yarn is required to install node_modules</sub>
<br/>
<sub>\***Python 3 is **not** supported, since our dependencies use `node-gyp`.</sub>

## Running the App

After `yarn`ing all dependencies you can run various commands depending on what you want to do:

#### Development

```bash
# run app in dev mode in browser, rebuild on file changes
yarn dev
```

```bash
# run app in dev mode in electron, rebuild on file changes
yarn dev:electron
```

#### Build Releases

```bash
# builds the production server app
yarn build
```

```bash
# builds the downloadable version of the site
yarn build:downloadable
```

```bash
# builds the electron apps
yarn build:electron

# builds only one OS's electron app
yarn build:electron:(osx|linux|windows)
```

All of these builds are output to a folder in `dist/`.


#### Dev (HTTPS):

Some parts of the site, such as the Ledger wallet, require an HTTPS environment to work. To develop on HTTPS, do the following:

1.  Create your own SSL Certificate (Heroku has a [nice guide here](https://devcenter.heroku.com/articles/ssl-certificate-self))
2.  Move the `.key` and `.crt` files into `webpack_config/server.*`
3.  Run the following command:

```bash
yarn dev:https
```

#### Address Derivation Checker:

EthereumJS-Util previously contained a bug that would incorrectly derive addresses from private keys with a 1/128 probability of occurring. A summary of this issue can be found [here](https://www.reddit.com/r/ethereum/comments/48rt6n/using_myetherwalletcom_just_burned_me_for/d0m4c6l/).

As a reactionary measure, the address derivation checker was created.

To test for correct address derivation, the address derivation checker uses multiple sources of address derivation (EthereumJS and PyEthereum) to ensure that multiple official implementations derive the same address for any given private key.

##### The derivation checker utility assumes that you have:

1.  Docker installed/available
2.  [dternyak/eth-priv-to-addr](https://hub.docker.com/r/dternyak/eth-priv-to-addr/) pulled from DockerHub

##### Docker setup instructions:

1.  Install docker (on macOS, [Docker for Mac](https://docs.docker.com/docker-for-mac/) is suggested)
2.  `docker pull dternyak/eth-priv-to-addr`

##### Run Derivation Checker

The derivation checker utility runs as part of the integration test suite.

```bash
yarn test:int
```

## Folder structure:

```
│
├── common
│   ├── actions - Application actions
│   ├── api - Services and XHR utils
│   ├── assets - Images, fonts, etc.
│   ├── components - Components according to "Redux philosophy"
│   ├── config - Various config data and hard-coded json
│   ├── containers - Containers according to "Redux philosophy" any major views will be inside containers
│   │   ├── OnboardingModal
│   │   ├── Tabs - breaks down the major pieces that the entire app is divided in to
│   │   │   ├── ... - These tabs also include their own components folder which consists of
│   │   │   ├── ... - the pieces that aren't being shared across the app.
│   │   │   ├── Governance
│   │   │   └── ... (BroadcastTx, CheckTransaction)
│   │   └─ TabSection
│   ├── libs - Framework-agnostic libraries and business logic
│   ├── reducers - Redux reducers
│   ├── sagas - Redux sagas
│   ├── sass - SCSS styles, variables, mixins
│   ├── selectors - Redux selectors
│   ├── translations - Language JSON dictionaries
│   ├── typescript - Typescript definition files
│   ├── utils - Common use utility functions
│   ├── index.tsx - Entry point for app
│   ├── index.html - Html template file for html-webpack-plugin
│   ├── Root.tsx - Root component for React
│   └── store.ts - Redux reducer combiner and middleware injector
├── electron-app - Code for the native electron app
├── jest_config - Jest testing configuration
├── spec - Jest unit tests, mirror's common's structure
├── static - Files that don't get compiled, just moved to build
└── webpack_config - Webpack configuration
```

### More information is available on the [Help Desk](https://eximchain.zendesk.com/hc/en-us)



