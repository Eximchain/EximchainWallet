### AppState
As far as the app is concerned, any state data that needs to be reset or carried over from the various tabs is stored through redux on master component state called the AppState. Defined inside the AppState are the core pieces of code that makes the rest of the application function. Listed below are some of the AppState attributes and what they control
- The AppState contains:
  - `config` (chain config aka. the variables defining which network you are connected to as well as the block explorer you want to link to when viewing transactions through an external source)
  - `notifications` (multipurpose notifications that can be accessed throughout the app to inform the client of useful bits of information)
  - `onboarding` (the modal that shows how to use the app for the first time as well as storing the information about whether the user has opened this app before)
  - `ens` (ethereum name service. The state in here is not relevant to the changes that this wallet has made)
  - `wallet` (the wallet that is currently active should be undefined if no wallet is currently active, furthermore the values in here should be reset whenever clicking to a different tab/section of the app)
  - `customTokens` (contains information about erc20 tokens that the client may want to keep track of)
  - `rates` (This feature is currently broken and unused in our wallet because it queries information about the current pricing of etherum/bitcoin which are no longer relevant to this wallet)
  - `deterministicWallets` (Related to the wallet, and describes the dpath of a particular private key/seed phrase of a wallet you are using)
  - `swap` (keeps track of bitcoin/ethereum swap rates as well as swap rates of other erc20 tokens currently not in use by our wallet)
  - `transaction` (the current transaction that is being constructed)
  - `transactions` (a local transaction history that is searchable)
  - `message` (a message that is being constructed)
  - `addressBook` (a local storage of human readable names to addresses)
  - `gas` (defines all things related to gas in a transaction)
  - `schedule` (keeps track of transactions that you want to schedule for a future date)
  - `routing` (passes in a routerReducer for navigating throughout the app however the usage of the implementation throughout the app is poor)
  
- What pieces of the data (selectors/StateProps) is needed from the app state in redux
  - `toChecksumAddress` (a function to turn an address to it's checksummed version)
  - `wallet` (the wallet and related functions of the current activated wallet)
  - `currentTo` (the current receipient or receiver of a transaction)
  - `contracts` (list of contracts from local storage)
  - `isValidAddress` (a function that runs a checksum for a given address to maintain validity
- What pieces of the AppState that need to be set. (actions/DispatchProps)
  - `resetWallet` (resets the wallet state)
  - `setCurrentTo` (resets the address a transaction should be sent to)
  - `showNotification` (sets the notification with the message you want to display to the user)
  - `resetTransactionRequested` (reset all current transaction variables)

- How the contract abi is stored
  - Grabbing the contract abi: We use the the AppState selector to grab the array of locally stored contracts, and we can define these locally stored contracts abi inside common/config/contracts/eth.json. Then we filter the array and select for the one that has the correct name and address. Then we take the abi of the selected contract and throw it into a Contract constructor which returns a Contract instance. The Contract instance has all the neccessary decode/encode functions to interact with the abi, and let's us forgo the need to have define each of these contract function interfaces manually.
  - Passing the functions through to the costlycontractcall/freecontractcall component
    - Within the index file of the governance tab the functions that need be made available to the costlycontractcall or freecontractcall are defined. 
    - Filter through costlycontractcall defined functions and we create buttons based on the functions, we do the same for the freecontractcall defined functions. We do this by using the buildFunctionOptions which returns the button components that needs to be rendered.
    - When a button is clicked the instance of the function is passed through either to the costlycontractcall or freecontractcall component alongside additional props that is specific to each component.