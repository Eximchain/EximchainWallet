import React, { Component } from 'react';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { connect } from 'react-redux';
import translate, { translateRaw } from 'translations';
import ResultScreen from './ResultScreen';
import { configSelectors } from 'features/config';
import { walletSelectors } from 'features/wallet';
import ClientBuilder from '@eximchain/weyl-web3-client';
import { Data } from 'libs/units';
import { INode, NODE_CONFIGS } from 'libs/nodes';
import { configNodesSelectors } from 'features/config';
import {
  transactionActions,
  transactionFieldsActions,
  transactionFieldsSelectors,
  transactionMetaActions,
  transactionSelectors
} from 'features/transaction';
import { transactionBroadcastSelectors } from 'features/transaction/broadcast';
import { transactionSignSelectors } from 'features/transaction/sign';
import { GenerateTransaction } from 'components/GenerateTransaction';
import { Input, Dropdown } from 'components/ui';
import { Fields } from './InteractExplorer/components';
import { AddressField } from 'components';
import './InteractExplorer/InteractExplorer.scss';
import { ContractFuncNames } from '..';
import WalletDecrypt, { DISABLE_WALLETS } from 'components/WalletDecrypt';
import { FullWalletOnly } from 'components/renderCbs';
import * as selectors from 'features/selectors';

import '../index.scss';
import ErrorScreen from './ErrorScreen';

interface StateProps {
  nodeLib: INode;
  wallet: AppState['wallet']['inst'];
  to: AppState['transaction']['fields']['to'];
  from: ReturnType<typeof selectors.getFrom>;
  dataExists: boolean;
  txBroadcasted: boolean;
  currentTransactionFailed: boolean;
  currentTransactionIndex: any;
  broadcastState: any;
  isValidAddress: ReturnType<typeof configSelectors.getIsValidAddressFn>;
}

interface DispatchProps {
  showNotification: notificationsActions.TShowNotification;
  setDataField: transactionFieldsActions.TSetDataField;
  setAsContractInteraction: transactionMetaActions.TSetAsContractInteraction;
  setAsViewAndSend: transactionMetaActions.TSetAsViewAndSend;
  setCurrentValue: transactionActions.TSetCurrentValue;
  resetTransactionRequested: transactionFieldsActions.TResetTransactionRequested;
}

interface OwnProps {
  selectedFunction: ContractOption;
  contractCall: ContractFuncNames;
  chainedCalls: null | ContractFuncNames[];
  chainedFunctions: null | ContractOption[];
  goBack: () => void;
}

enum ContractFlowStages {
  CONSTRUCT_TRANSACTION_SCREEN = 'construct transaction screen',
  SUBMIT_TRANSACTION_SCREEN = 'submit transaction screen',
  RESULT_SCREEN = 'result screen',
  ERROR_SCREEN = 'error screen'
}
enum ErrorType {
  COLLECT_ALREADY_COLLECTED,
  COLLECT_NOT_CLAIMED,
  CLAIM_ALREADY_CLAIMED,
  CLAIM_GOV_STATUS_INVALID,
  INCOMPLETE_INPUTS,
  INVALID_INPUTS,
  NO_ERROR
}
interface State {
  inputs: {
    [key: string]: { rawData: string; parsedData: string[] | string };
  };
  outputs: any;
  stage: ContractFlowStages;
  stageHistory: ContractFlowStages[];
  setValue?: any;
  broadcastHash?: any;
  promoDemoBool?: any;
  confirmTransaction: boolean;
  inputOption?: ContractOption;
  errorState: {
    errorType: ErrorType;
    error: string;
  };
  maximumPossibleBallots?: number;
  isBlockMaker?: boolean;
}

interface ContractFunction {
  constant: boolean;
  decodeInput: any;
  decodeOutput: any;
  encodeInput: any;
  inputs: any[];
  outputs: any;
}

interface ContractOption {
  contract: ContractFunction;
  name: string;
}

type Props = StateProps & DispatchProps & OwnProps;

export class ContractCallClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { chainedFunctions, selectedFunction } = this.props;
    let inputOptions;
    if (chainedFunctions && selectedFunction.name !== 'vote') {
      inputOptions = JSON.parse(JSON.stringify(selectedFunction));
      inputOptions.contract.inputs = chainedFunctions[0].contract.inputs;
    }
    this.state = {
      stage: ContractFlowStages.CONSTRUCT_TRANSACTION_SCREEN,
      stageHistory: [],
      inputs: {},
      outputs: {},
      inputOption: inputOptions,
      confirmTransaction: false,
      errorState: {
        error: '',
        errorType: ErrorType.INCOMPLETE_INPUTS
      }
    };
    this.goTo = this.goTo.bind(this);
    this.back = this.back.bind(this);
  }

  public static defaultProps: Partial<Props> = {};

  public async componentDidMount() {
    this.props.setAsContractInteraction();
    const { selectedFunction } = this.props;
    const currentGovernanceCycle = this.functionFilter('currentGovernanceCycle');
    const currentGovernanceCycleResult = await this.handleChainedCalls('', currentGovernanceCycle);
    this.setState({
      maximumPossibleBallots: currentGovernanceCycleResult[0]
    });
  }

  public componentWillUnmount() {
    this.props.setAsViewAndSend();
  }

  public async componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.txBroadcasted == false && this.props.txBroadcasted) {
      if (this.props.currentTransactionFailed) {
        this.goTo(ContractFlowStages.ERROR_SCREEN);
      } else {
        const broadcastedHash = this.props.broadcastState[
          this.props.currentTransactionIndex.indexingHash
        ].broadcastedHash;
        this.setState({ broadcastHash: broadcastedHash });
        this.goTo(ContractFlowStages.RESULT_SCREEN);
      }
    }
    if (this.props.wallet) {
      if (this.props.selectedFunction.name === 'VOTE') {
        const walletAddress = this.props.wallet.getAddressString();
        const WeylClient = ClientBuilder(NODE_CONFIGS['ETH'][0].url);
        const isBlockMaker = await WeylClient.isBlockMaker(walletAddress);
        this.setState({ isBlockMaker: isBlockMaker });
      }
    }
  }
  private onClick = () => {
    if (this.state.confirmTransaction) {
      this.setState({
        confirmTransaction: false
      });
    } else {
      this.setState({
        confirmTransaction: true
      });
    }
  };
  private goTo = (stage: ContractFlowStages) => {
    this.setState((state: State) => {
      let newState = Object.assign({}, state);
      newState.stageHistory.push(this.state.stage);
      newState.stage = stage;
      return newState;
    });
  };

  private back = () => {
    if (this.state.stage === ContractFlowStages.CONSTRUCT_TRANSACTION_SCREEN) {
      this.props.goBack();
    }

    this.setState((state: State) => {
      // tslint:disable-next-line:prefer-const
      let newState = Object.assign({}, state);
      const prevStage =
        newState.stageHistory.length > 0
          ? newState.stageHistory.pop()
          : ContractFlowStages.CONSTRUCT_TRANSACTION_SCREEN;
      newState.stage = prevStage;
      if (this.state.stage === ContractFlowStages.SUBMIT_TRANSACTION_SCREEN) {
        newState.confirmTransaction = false;
      }
      return newState;
    });
  };

  render() {
    const { inputs, inputOption, errorState, maximumPossibleBallots } = this.state;
    const { selectedFunction } = this.props;

    let inputFunction;
    if (inputOption) {
      inputFunction = inputOption;
    } else {
      inputFunction = selectedFunction;
    }
    const generateOrWriteButton = this.props.dataExists ? (
      <GenerateTransaction isGovernanceTransaction={true} onClick={this.onClick} />
    ) : (
      <button
        className="InteractExplorer-func-submit btn btn-primary"
        onClick={this.handleFunctionSend}
      >
        {translate('CONTRACT_WRITE')}
      </button>
    );
    let body;
    switch (this.state.stage) {
      case ContractFlowStages.CONSTRUCT_TRANSACTION_SCREEN:
        body = (
          <div className="GovernanceSection-form-write">
            <h2 className="FormInput-title">{translate(this.props.contractCall + 'Name')}</h2>
            <p className="FormInput-subtitle">{translate(inputFunction.name + 'Description')}</p>
            <div key={inputFunction.name}>
              {inputFunction.contract.inputs.map((input, index) => {
                const { type, name } = input;
                const parsedName = name === '' ? index : name;
                const inputState = inputs[parsedName];
                let inputField;
                if (type === 'bool') {
                  inputField = (
                    <Dropdown
                      options={[
                        { value: false, label: translateRaw(parsedName + 'false') },
                        { value: true, label: translateRaw(parsedName + 'true') }
                      ]}
                      value={
                        inputState
                          ? {
                              value: inputState.parsedData as any,
                              label: translateRaw(parsedName + inputState.rawData)
                            }
                          : undefined
                      }
                      clearable={false}
                      onBlur={this.handleOnBlur}
                      onChange={({ value }: { value: boolean }) => {
                        this.handleBooleanDropdownChange({ value, name: parsedName });
                      }}
                    />
                  );
                } else if (type === 'address') {
                  inputField = (
                    <AddressField
                      name={parsedName}
                      value={(inputs[parsedName] && inputs[parsedName].rawData) || ''}
                      showLabelMatch={true}
                      showInputLabel={false}
                      onBlur={this.handleOnBlur}
                      onChangeOverride={this.handleSelectAddressFromBook}
                      dropdownThreshold={1}
                    />
                  );
                } else if (maximumPossibleBallots && parsedName === '_ballot_number') {
                  let options: any[] = [];

                  for (const x of Array.apply(null, { length: maximumPossibleBallots })
                    .map(Number.call, Number)
                    .keys()) {
                    options = options.concat({ value: x, label: x });
                  }
                  inputField = (
                    <Dropdown
                      options={options}
                      value={
                        inputState
                          ? {
                              value: inputState.parsedData as any,
                              label: inputState.rawData
                            }
                          : undefined
                      }
                      onBlur={this.handleOnBlur}
                      clearable={false}
                      onChange={({ value }: { value: number }) => {
                        this.handleIntegerDropdownChange({ value, name: parsedName });
                      }}
                    />
                  );
                } else {
                  inputField = (
                    <Input
                      className="InteractExplorer-func-in-input"
                      isValid={!!(inputs[parsedName] && inputs[parsedName].rawData)}
                      name={parsedName}
                      value={(inputs[parsedName] && inputs[parsedName].rawData) || ''}
                      onChange={this.handleInputChange}
                      onBlur={this.handleOnBlur}
                      onFocus={this.handleOnBlur}
                    />
                  );
                }
                return (
                  <div key={parsedName} className="input-group-wrapper">
                    <label className="input-group">
                      <div className="input-group-header">
                        {
                          // (parsedName === index ? `Input#${parsedName}` : parsedName) + ' ' + type
                        }
                        {translate(parsedName)}
                      </div>

                      {inputField}
                    </label>
                  </div>
                );
              })}
              {inputFunction.name === 'vote' && (
                <label className="input-group flex-wrapper">
                  <div className="input-group-header EXCAmount">EXC Amount</div>
                  <Input
                    className="InteractExplorer-func-in-input"
                    name={'Value'}
                    value={this.state.setValue}
                    readOnly={true}
                  />
                </label>
              )}
              <div className={'errorMsg costlyContractError'}>
                {errorState.errorType !== ErrorType.NO_ERROR && errorState.error}
              </div>

              {inputFunction.contract.constant ? (
                <button
                  className="InteractExplorer-func-submit btn btn-primary"
                  onClick={this.handleFunctionCall}
                >
                  {translate('CONTRACT_READ')}
                </button>
              ) : (
                <button
                  className="InteractExplorer-func-submit NextButton btn btn-primary"
                  onClick={this.handleFunctionSend}
                  disabled={errorState.errorType !== ErrorType.NO_ERROR}
                >
                  {translate('Next')}
                </button>
              )}
            </div>
          </div>
        );
        break;
      case ContractFlowStages.SUBMIT_TRANSACTION_SCREEN:
        body = (
          <React.Fragment>
            <Fields
              button={generateOrWriteButton}
              onClick={this.onClick}
              confirmTransaction={this.state.confirmTransaction}
            />
          </React.Fragment>
        );
        break;
      case ContractFlowStages.RESULT_SCREEN:
        body = (
          <ResultScreen
            txHash={this.state.broadcastHash}
            backToGovernance={this.props.goBack}
            isPromotion={this.state.promoDemoBool}
            governanceCallName={this.props.contractCall}
          />
        );
        break;
      case ContractFlowStages.ERROR_SCREEN:
        body = <ErrorScreen backToGovernance={this.props.goBack} />;
    }
    const makeDecrypt = () => <WalletDecrypt disabledWallets={DISABLE_WALLETS.READ_ONLY} />;
    const makeContent = () => <React.Fragment>{body}</React.Fragment>;

    return (
      <React.Fragment>
        <div className="GovernanceSection-topsection">
          <button className="FormBackButton fa fa-chevron-left" onClick={this.back} />
          <h2 className="ContractSection-topsection-title">{translate(this.props.contractCall)}</h2>
        </div>
        <section className="Tab-content GovernanceSection-content">
          <FullWalletOnly withFullWallet={makeContent} withoutFullWallet={makeDecrypt} />
        </section>
      </React.Fragment>
    );
  }

  private handleStageChange = () => {
    this.goTo(ContractFlowStages.SUBMIT_TRANSACTION_SCREEN);
  };

  private autoSetAmountValue = (rawValue: any) => {
    const value = rawValue * rawValue;
    this.setState({ setValue: value });
  };
  private handleChainedCalls = async (input: any, contractOption: ContractOption) => {
    const data = contractOption!.contract.encodeInput(input);
    const { nodeLib, to } = this.props;
    const callData = { to: to.raw, data };
    const results = await nodeLib.sendCallRequest(callData);
    return contractOption!.contract.decodeOutput(results);
  };
  //goes through chained functions and returns either null or the contractOptions
  //it will also return null if the first chainedFunction is equal to nameOfFunction since that is
  //already handled by default
  private functionFilter = (nameOfFunction: string) => {
    const chainedFunctions = this.props.chainedFunctions;
    if (!chainedFunctions) {
      return null;
    }
    const value = chainedFunctions.filter(e => e.name === nameOfFunction);
    if (value.length > 0) {
      return value[0];
    }
    return null;
  };

  private handleFunctionCall = async (_: React.FormEvent<HTMLButtonElement>) => {
    try {
      const data = this.encodeData();
      const { nodeLib, to, selectedFunction } = this.props;
      if (!to.value) {
        throw Error();
      }
      const callData = { to: to.raw, data };
      const results = await nodeLib.sendCallRequest(callData);
      const parsedResult = selectedFunction!.contract.decodeOutput(results);
      this.setState({ outputs: parsedResult });
    } catch (e) {
      this.props.showNotification(
        'warning',
        `Function call error: ${(e as Error).message}` || 'Invalid input parameters',
        5000
      );
    }
  };

  //modified handleFunctionCall to return the final chained output data that we need.
  private handleChainedFunctionInput = (_: React.FormEvent<HTMLButtonElement>) => {
    const { to, selectedFunction, chainedFunctions } = this.props;
    const { inputs } = this.state;
    // console.log(inputs, 'inside inputs costlycontract')
    // console.log(chainedFunctions[0].contract.inputs.map(({name})=>name))
    const filterKey = chainedFunctions[0].contract.inputs.map(({ name }) => name);
    const newInput = Object.keys(inputs).reduce((accu, key) => {
      if (!filterKey.includes(key)) return { ...accu, [key]: inputs[key].parsedData };
    }, {});
    // console.log(newInput,'thingy')
    if (!to.value) {
      throw Error();
    }
    return selectedFunction!.contract.encodeInput(newInput);
  };

  private handleFunctionSend = async (input: React.FormEvent<HTMLButtonElement>) => {
    try {
      const { selectedFunction } = this.props;
      let data;
      if (selectedFunction.name !== 'VOTE') {
        data = this.handleChainedFunctionInput(input);
      } else {
        data = this.encodeData();
      }
      // this.props.resetTransactionRequested();
      this.props.setDataField({ raw: data, value: Data(data) });
      if (this.state.setValue) {
        this.props.setCurrentValue(this.state.setValue.toString());
      }
      this.handleStageChange();
    } catch (e) {
      this.props.showNotification('danger', `All fields are required.${e}`, 5000);
    }
  };
  private handleSelectAddressFromBook = (ev: React.FormEvent<HTMLInputElement>) => {
    const { inputOption } = this.state;
    const { selectedFunction } = this.props;
    const { currentTarget: { value: addressFromBook } } = ev;
    if (inputOption) {
      ev.currentTarget.name = inputOption.contract.inputs[0].name;
    } else {
      ev.currentTarget.name = selectedFunction.contract.inputs[0].name;
    }
    ev.currentTarget.value = addressFromBook;

    this.handleInputChange(ev);
  };

  private handleClaimInputs = async (state: State) => {
    try {
      const inputs = Object.assign({}, state.inputs);

      //Just insuring that the states are reset properly.
      delete inputs['_governanceCycleId'];
      delete inputs['_ballotId'];

      //Set state here for testing purposes
      // await this.setState({
      //   inputs: {
      //     ...this.state.inputs,
      //     ['_governanceCycleId']: {'rawData':'3','parsedData':'3'},
      //     ['_ballotId']: {'rawData':'2','parsedData':'2'}
      //   }
      // })

      const parsedInputs = Object.keys(inputs).reduce(
        (accu, key) => ({ ...accu, [key]: inputs[key].parsedData }),
        {}
      );
      const mandatoryInputs = ['_ballot_address', '_ballot_number'];
      for (var key in mandatoryInputs) {
        // console.log(parsedInputs[mandatoryInputs[key]]==undefined, mandatoryInputs[key])
        if (parsedInputs[mandatoryInputs[key]] == undefined) {
          throw Error();
        }
      }
      if (!this.props.isValidAddress(parsedInputs['_ballot_address'])) {
        throw Error('Invalid address');
      }
      const { to } = this.props;
      if (!to.value) {
        throw Error();
      }
      const ballotHistory = this.functionFilter('ballotHistory');
      // console.log(ballotHistory)
      if (ballotHistory) {
        // console.log('what', parsedInputs)
        const ballotHistoryResult = await this.handleChainedCalls(parsedInputs, ballotHistory);
        // console.log(ballotHistoryResult, 'ballotHistoryResult')
        if (ballotHistoryResult[0] === '0')
          throw Error('You have not cast that number of ballot entries with this address.');
        const ballotRecords = this.functionFilter('ballotRecords');
        if (ballotRecords) {
          const ballotRecordsResult = await this.handleChainedCalls(
            ballotHistoryResult,
            ballotRecords
          );
          // console.log(ballotRecordsResult, 'recordResult')
          if (ballotRecordsResult.withdrawRecord) {
            throw Error('This address has already claimed tokens for that ballot entry.');
          }
          const governanceCycleRecord = this.functionFilter('governanceCycleRecords');
          if (governanceCycleRecord) {
            const newInput = { 0: ballotRecordsResult.governanceCycleId };
            const governanceCycleRecordResult = await this.handleChainedCalls(
              newInput,
              governanceCycleRecord
            );
            // console.log(governanceCycleRecordResult.status, 'governanceCycle for ballotHistory')
            if (governanceCycleRecordResult.status === '1')
              throw Error('Tokens cannot be claimed if the governance cycle has not been closed');
            if (governanceCycleRecordResult.status === '0')
              throw Error(
                'If you are seeing this message you have hit a snag, please email support@eximchain.com'
              );
            if (governanceCycleRecordResult.status === '2' && !ballotRecordsResult.withdrawRecord) {
              const governanceCycleId = ballotRecordsResult.governanceCycleId;
              const ballotId = ballotHistoryResult[0];
              this.setState({
                inputs: {
                  ...this.state.inputs,
                  ['_governanceCycleId']: {
                    rawData: governanceCycleId,
                    parsedData: governanceCycleId
                  },
                  ['_ballotId']: { rawData: ballotId, parsedData: ballotId }
                }
              });
              // console.log('CanClaim');
            }
          }
        }
      }
      // this.setState({ outputs: parsedResult });
      this.setState({
        errorState: {
          errorType: ErrorType.NO_ERROR,
          error: 'no error'
        }
      });
    } catch (e) {
      //Handle the errors here.
      if (e.toString() == 'Error') {
        this.setState({
          errorState: {
            errorType: ErrorType.INCOMPLETE_INPUTS,
            error: ''
          }
        });
      } else if (e.toString().includes('NO CLAIM')) {
        this.setState({
          errorState: {
            errorType: ErrorType.INVALID_INPUTS,
            error: `${e}`
          }
        });
      } else {
        this.setState({
          errorState: {
            errorType: ErrorType.INCOMPLETE_INPUTS,
            error: `${e}`
          }
        });
      }
    }
  };
  private handleCollectInputs = async (state: State) => {
    try {
      const inputs = Object.assign({}, state.inputs);

      //Just insuring that the states are reset properly.
      delete inputs['_withdrawIndex'];
      // await this.setState({
      //   inputs: {
      //     ...this.state.inputs,
      //     ['_withdrawIndex']: {'rawData':'3','parsedData':'3'}
      //   }
      // })

      const parsedInputs = Object.keys(inputs).reduce(
        (accu, key) => ({ ...accu, [key]: inputs[key].parsedData }),
        {}
      );
      const mandatoryInputs = ['_ballot_address', '_ballot_number'];
      for (var key in mandatoryInputs) {
        // console.log(parsedInputs[mandatoryInputs[key]]==undefined, mandatoryInputs[key])
        if (parsedInputs[mandatoryInputs[key]] == undefined) {
          throw Error();
        }
      }
      if (!this.props.isValidAddress(parsedInputs['_ballot_address'])) {
        throw Error('Invalid address');
      }
      const { to } = this.props;
      if (!to.value) {
        throw Error();
      }
      const ballotHistory = this.functionFilter('ballotHistory');
      // console.log(ballotHistory)
      if (ballotHistory) {
        // console.log('what', parsedInputs)
        const ballotHistoryResult = await this.handleChainedCalls(parsedInputs, ballotHistory);
        // console.log(ballotHistoryResult, 'ballotHistoryResult')
        if (ballotHistoryResult[0] === '0') throw Error('NO CLAIM: INVALID BALLOT');
        const ballotRecords = this.functionFilter('ballotRecords');
        if (ballotRecords) {
          const ballotRecordsResult = await this.handleChainedCalls(
            ballotHistoryResult,
            ballotRecords
          );
          // console.log(ballotRecordsResult, 'ballotRecordResult');
          if (!ballotRecordsResult.withdrawRecord) {
            throw Error('NO COLLECT: Need to CLAIM the ballot first');
          }
          const withdrawRecords = this.functionFilter('withdrawRecords');
          if (withdrawRecords) {
            const newInput = { 0: ballotRecordsResult.withdrawRecordId };
            const withdrawRecordsResult = await this.handleChainedCalls(newInput, withdrawRecords);
            // console.log(withdrawRecordsResult, 'withdrawRecordResult');
            if (withdrawRecordsResult.status === '2') {
              throw Error('NO COLLECT: Already Withdrawn');
            }
            if (withdrawRecordsResult.status === '1') {
              const withdrawRecordId = ballotRecordsResult.withdrawRecordId;
              this.setState({
                inputs: {
                  ...this.state.inputs,
                  ['_withdrawIndex']: { rawData: withdrawRecordId, parsedData: withdrawRecordId }
                }
              });
              // console.log('Can Collect!');
            }
          }
        }
      }
      this.setState({
        errorState: {
          errorType: ErrorType.NO_ERROR,
          error: 'no error'
        }
      });
    } catch (e) {
      //Handle the errors here.
      if (e.toString() == 'Error') {
        this.setState({
          errorState: {
            errorType: ErrorType.INCOMPLETE_INPUTS,
            error: ''
          }
        });
      } else if (e.toString().includes('NO COLLECT')) {
        this.setState({
          errorState: {
            errorType: ErrorType.INVALID_INPUTS,
            error: `${e}`
          }
        });
      } else {
        this.setState({
          errorState: {
            errorType: ErrorType.INCOMPLETE_INPUTS,
            error: `${e}`
          }
        });
      }
    }
  };
  private handleVoteInputs = async (state: State) => {
    try {
      const inputs = Object.assign({}, state.inputs);
      const { isBlockMaker, maximumPossibleBallots } = state;
      const parsedInputs = Object.keys(inputs).reduce(
        (accu, key) => ({ ...accu, [key]: inputs[key].parsedData }),
        {}
      );
      // console.log(parsedInputs)
      // console.log('CurrentState VOTE values',parsedInputs['_votes'])
      const voteValue = parsedInputs['_votes'];
      // console.log('what', voteValue)
      const numberOfVotes = parseInt(voteValue);
      const mandatoryInputs = ['_voted_for', '_election', '_inSupport', '_votes'];
      for (var key in mandatoryInputs) {
        // console.log(parsedInputs[mandatoryInputs[key]]==undefined, mandatoryInputs[key])
        if (parsedInputs[mandatoryInputs[key]] == undefined) {
          throw Error();
        }
      }
      if (!this.props.isValidAddress(parsedInputs['_voted_for'])) {
        throw Error('Invalid address');
      }
      if (!parseInt(parsedInputs['_votes'])) {
        throw Error('invalid input');
      }
      const nomineeBallot = this.functionFilter('nomineeBallots');
      const currentGovernanceCycle = this.functionFilter('currentGovernanceCycle');
      let currentGovernanceCycleId = maximumPossibleBallots;
      let ballotGovCycleId;
      const WeylClient = await ClientBuilder(NODE_CONFIGS['ETH'][0].url);
      const votedForIsBlockMaker = await WeylClient.isBlockMaker(parsedInputs['_voted_for']);
      const electionBool = await parsedInputs['_election'];
      if (votedForIsBlockMaker) {
        if (electionBool) {
          throw Error('Your address cannot promote a blockmaker address.');
        }
      } else {
        if (!electionBool) {
          throw Error('You cannot demote a non-blockmaker address.');
        }
      }
      var electionType;
      if (nomineeBallot) {
        const newInput = {
          0: parsedInputs['_voted_for']
        };
        const nomineeBallotResult = await this.handleChainedCalls(newInput, nomineeBallot);
        electionType = nomineeBallotResult['election'];
        console.log(electionType);
        ballotGovCycleId = nomineeBallotResult['governanceCycleId'];
        //Check that you are not a blockmaker
        if (!isBlockMaker) {
          //If you are not a blockmaker and the ballot exists make sure you can only vote for a demotion ballot
          if (ballotGovCycleId == currentGovernanceCycleId) {
            if (electionType) {
              throw Error('A promotion ballot has already been cast for this address.');
            }
          } else {
            //if you are not a blockmaker and the ballot doesn't exist make sure your vote still needs to be a nomination ballot
            if (numberOfVotes < 32) {
              throw Error('You must cast a minimum of 32 votes to nominate an address.');
            }
          }
        } else {
          // Ensure that even as a block maker you must still cast a minimum of 32 votes to start a ballot
          if (!(ballotGovCycleId == currentGovernanceCycle)) {
            if (numberOfVotes < 32) {
              throw Error('You must cast a minimum of 32 votes to start the ballot');
            }
          }
        }
      }
      this.setState({
        errorState: {
          errorType: ErrorType.NO_ERROR,
          error: 'no error'
        }
      });
    } catch (e) {
      if (e.toString() == 'Error') {
        this.setState({
          errorState: {
            errorType: ErrorType.INCOMPLETE_INPUTS,
            error: ''
          }
        });
      } else if (e.toString().includes('NO VOTE')) {
        this.setState({
          errorState: {
            errorType: ErrorType.INVALID_INPUTS,
            error: `${e}`
          }
        });
      } else {
        this.setState({
          errorState: {
            errorType: ErrorType.INCOMPLETE_INPUTS,
            error: `${e}`
          }
        });
      }
    }
  };
  private handleOnBlur = (ev: React.FormEvent<HTMLInputElement>) => {
    const { selectedFunction } = this.props;
    if (selectedFunction.name === 'vote') {
      this.handleVoteInputs(this.state);
    } else if (selectedFunction.name === 'startWithdraw') {
      this.handleClaimInputs(this.state);
    } else if (selectedFunction.name === 'finalizeWithdraw') {
      this.handleCollectInputs(this.state);
    }
  };
  private handleInputChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const { selectedFunction } = this.props;
    const rawValue: string = ev.currentTarget.value;
    // console.log(ev.currentTarget.name);
    if (ev.currentTarget.name === '_votes') {
      this.autoSetAmountValue(rawValue);
    }
    if (ev.currentTarget.name === '_ballot_address') {
      //TODO: filter ballot number goes here?
    }
    const name = ev.currentTarget.name;
    const isArr = rawValue.startsWith('[') && rawValue.endsWith(']');
    if (rawValue === '') {
      this.setState(
        (state, _) => {
          let inputs = Object.assign({}, state.inputs);
          if (inputs[name] !== undefined) {
            delete inputs[name];
          }
          return {
            inputs: {
              ...inputs
            }
          };
        },
        () => {
          if (this.props.selectedFunction.name === 'vote') {
            this.handleVoteInputs(this.state);
          }
          if (this.props.selectedFunction.name === 'startWithdraw') {
            this.handleClaimInputs(this.state);
          }
          if (this.props.selectedFunction.name === 'finalizeWithdraw') {
            this.handleCollectInputs(this.state);
          }
        }
      );
    } else {
      const value = {
        rawData: rawValue,
        parsedData: isArr ? this.tryParseJSON(rawValue) : rawValue
      };
      this.setState(
        (state, props) => {
          let inputs = Object.assign({}, state.inputs);
          return {
            inputs: {
              ...inputs,
              [name]: value
            }
          };
        },
        () => {
          if (this.props.selectedFunction.name === 'vote') {
            this.handleVoteInputs(this.state);
          }
          if (this.props.selectedFunction.name === 'startWithdraw') {
            this.handleClaimInputs(this.state);
          }
          if (this.props.selectedFunction.name === 'finalizeWithdraw') {
            this.handleCollectInputs(this.state);
          }
        }
      );
    }
  };
  private tryParseJSON(input: string) {
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }

  private encodeData(): string {
    const { inputs } = this.state;
    const selectedFunction = this.props.selectedFunction;
    const parsedInputs = Object.keys(inputs).reduce(
      (accu, key) => ({ ...accu, [key]: inputs[key].parsedData }),
      {}
    );
    return selectedFunction!.contract.encodeInput(parsedInputs);
  }
  private handleIntegerDropdownChange = ({ value, name }: { value: number; name: string }) => {
    this.setState(
      (state, props) => {
        let inputs = Object.assign({}, state.inputs);
        return {
          inputs: {
            ...inputs,
            [name as any]: {
              rawData: value.toString(),
              parsedData: value
            }
          }
        };
      },
      () => {
        if (this.props.selectedFunction.name === 'vote') {
          this.handleVoteInputs(this.state);
        }
        if (this.props.selectedFunction.name === 'startWithdraw') {
          this.handleClaimInputs(this.state);
        }
        if (this.props.selectedFunction.name === 'finalizeWithdraw') {
          this.handleCollectInputs(this.state);
        }
      }
    );
  };
  private handleBooleanDropdownChange = ({ value, name }: { value: boolean; name: string }) => {
    if (name === '_election') {
      this.setState(
        {
          promoDemoBool: value.toString()
        },
        () => {
          if (this.props.selectedFunction.name === 'vote') {
            this.handleVoteInputs(this.state);
          }
          if (this.props.selectedFunction.name === 'startWithdraw') {
            this.handleClaimInputs(this.state);
          }
          if (this.props.selectedFunction.name === 'finalizeWithdraw') {
            this.handleCollectInputs(this.state);
          }
        }
      );
    }
    this.setState((state, props) => {
      let inputs = Object.assign({}, state.inputs);
      return {
        inputs: {
          ...inputs,
          [name as any]: {
            rawData: value.toString(),
            parsedData: value
          }
        }
      };
    }),
      () => {
        if (this.props.selectedFunction.name === 'vote') {
          this.handleVoteInputs(this.state);
        }
        if (this.props.selectedFunction.name === 'startWithdraw') {
          this.handleClaimInputs(this.state);
        }
        if (this.props.selectedFunction.name === 'finalizeWithdraw') {
          this.handleCollectInputs(this.state);
        }
      };
  };
}

export const CostlyContractCallScreen = connect(
  (state: AppState) => ({
    wallet: walletSelectors.getWalletInst(state),
    nodeLib: configNodesSelectors.getNodeLib(state),
    to: transactionFieldsSelectors.getTo(state),
    dataExists: transactionSelectors.getDataExists(state),
    txBroadcasted: transactionSelectors.currentTransactionBroadcasted(state),
    currentTransactionFailed: transactionSelectors.currentTransactionFailed(state),
    currentTransactionIndex: transactionSignSelectors.getSignState(state),
    broadcastState: transactionBroadcastSelectors.getBroadcastState(state),
    isValidAddress: configSelectors.getIsValidAddressFn(state)
  }),
  {
    showNotification: notificationsActions.showNotification,
    setDataField: transactionFieldsActions.setDataField,
    resetTransactionRequested: transactionFieldsActions.resetTransactionRequested,
    setAsContractInteraction: transactionMetaActions.setAsContractInteraction,
    setAsViewAndSend: transactionMetaActions.setAsViewAndSend,
    setCurrentValue: transactionActions.setCurrentValue
  }
)(ContractCallClass);
