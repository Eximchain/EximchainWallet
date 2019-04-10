import React, { Component } from 'react';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { connect } from 'react-redux';
import translate, { translateRaw } from 'translations';
import ResultScreen from './ResultScreen';
import { configSelectors } from 'features/config';

import { Data } from 'libs/units';
import { INode } from 'libs/nodes';
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

import '../index.scss';
import ErrorScreen from './ErrorScreen';

interface StateProps {
  nodeLib: INode;
  to: AppState['transaction']['fields']['to'];
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

    if (chainedFunctions) {
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
        error: ' ',
        errorType: ErrorType.INCOMPLETE_INPUTS
      }
    };
    this.goTo = this.goTo.bind(this);
    this.back = this.back.bind(this);
  }
  public static defaultProps: Partial<Props> = {};

  public componentDidMount() {
    this.props.setAsContractInteraction();
  }

  public componentWillUnmount() {
    this.props.setAsViewAndSend();
  }

  public componentDidUpdate(prevProps: Props) {
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
    const { inputs, outputs, inputOption, errorState } = this.state;
    const { selectedFunction, chainedFunctions, chainedCalls } = this.props;
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
    let inputFunction;
    if (inputOption) {
      inputFunction = inputOption;
    } else {
      inputFunction = selectedFunction;
    }
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
                      onChangeOverride={this.handleSelectAddressFromBook}
                      dropdownThreshold={1}
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
              <div className={'errorMsg'}>
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
                  disabled={
                    errorState.errorType !== ErrorType.NO_ERROR && inputFunction.name !== 'vote'
                  }
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
    return (
      <React.Fragment>
        <div className="GovernanceSection-topsection">
          <button className="FormBackButton fa fa-chevron-left" onClick={this.back} />
          <h2 className="ContractSection-topsection-title">{translate(this.props.contractCall)}</h2>
        </div>
        <section className="Tab-content GovernanceSection-content">{body}</section>
      </React.Fragment>
    );
  }

  private handleStageChange = () => {
    this.goTo(ContractFlowStages.SUBMIT_TRANSACTION_SCREEN);
  };

  private autoSetAmountValue = (rawValue: any) => {
    const value = rawValue * rawValue;
    this.setState({ setValue: value });
    this.props.setCurrentValue(value.toString());
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
    console.log(value);
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
      const { chainedFunctions } = this.props;
      let data;
      if (chainedFunctions) {
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
  private handleClaimInputs = async () => {
    try {
      const { inputs } = this.state;

      //Just insuring that the states are reset properly.
      delete inputs['_governanceCycleId'];
      delete inputs['_ballotId'];
      await this.setState({
        errorState: {
          errorType: ErrorType.NO_ERROR,
          error: 'no error'
        },
        inputs: {
          ...inputs
        }
      });
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
      if (!this.props.isValidAddress(parsedInputs['_ballot_address'])) {
        throw Error('invalid address');
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
          // console.log(ballotRecordsResult, 'recordResult')
          if (ballotRecordsResult.withdrawRecord) {
            throw Error('NO CLAIM: Already Claimed');
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
              throw Error('NO CLAIM: Governance Not Closed');
            if (governanceCycleRecordResult.status === '0')
              throw Error(
                'NO CLAIM: IF YOU SEE THIS MSG THERE IS SOMETHING REALLY WRONG, please email support'
              );
            if (governanceCycleRecordResult.status === '2' && !ballotRecordsResult.withdrawRecord) {
              const governanceCycleId = ballotRecordsResult.governanceCycleId;
              const ballotId = ballotHistoryResult[0];
              await this.setState({
                inputs: {
                  ...this.state.inputs,
                  ['_governanceCycleId']: {
                    rawData: governanceCycleId,
                    parsedData: governanceCycleId
                  },
                  ['_ballotId']: { rawData: ballotId, parsedData: ballotId }
                }
              });
              console.log('CanClaim');
            }
          }
        }
      }
      // this.setState({ outputs: parsedResult });
    } catch (e) {
      //Handle the errors here.
      if (e.type === String && e.includes('NO CLAIM')) {
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
  private handleCollectInputs = async () => {
    try {
      const { inputs } = this.state;

      //Just insuring that the states are reset properly.
      delete inputs['_withdrawIndex'];
      await this.setState({
        errorState: {
          errorType: ErrorType.NO_ERROR,
          error: 'no error'
        },
        inputs: {
          ...inputs
        }
      });
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
      if (!this.props.isValidAddress(parsedInputs['_ballot_address'])) {
        throw Error('invalid address');
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
          console.log(ballotRecordsResult, 'ballotRecordResult');
          if (!ballotRecordsResult.withdrawRecord) {
            throw Error('NO COLLECT: Need to CLAIM the ballot first');
          }
          const withdrawRecords = this.functionFilter('withdrawRecords');
          if (withdrawRecords) {
            const newInput = { 0: ballotRecordsResult.withdrawRecordId };
            const withdrawRecordsResult = await this.handleChainedCalls(newInput, withdrawRecords);
            console.log(withdrawRecordsResult, 'withdrawRecordResult');
            if (withdrawRecordsResult.status === '2') {
              throw Error('NO COLLECT: Already Withdrawn');
            }
            if (withdrawRecordsResult.status === '1') {
              const withdrawRecordId = ballotRecordsResult.withdrawRecordId;
              await this.setState({
                inputs: {
                  ...this.state.inputs,
                  ['_withdrawIndex']: { rawData: withdrawRecordId, parsedData: withdrawRecordId }
                }
              });
              console.log('Can Collect!');
            }
          }
        }
      }
    } catch (e) {
      //Handle the errors here.
      if (e.type === String && e.includes('NO COLLECT')) {
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
  private handleInputChange = async (ev: React.FormEvent<HTMLInputElement>) => {
    const { selectedFunction } = this.props;
    const rawValue: string = ev.currentTarget.value;
    if (ev.currentTarget.name === '_votes') {
      this.autoSetAmountValue(rawValue);
    }

    const isArr = rawValue.startsWith('[') && rawValue.endsWith(']');

    if (rawValue === '') {
      if (this.state.inputs[ev.currentTarget.name] !== undefined) {
        let inputs = this.state.inputs;
        delete inputs[ev.currentTarget.name];
        await this.setState({
          inputs: {
            ...inputs
          }
        });
      }
    } else {
      const value = {
        rawData: rawValue,
        parsedData: isArr ? this.tryParseJSON(rawValue) : rawValue
      };
      await this.setState({
        inputs: {
          ...this.state.inputs,
          [ev.currentTarget.name]: value
        }
      });
    }
    if (selectedFunction.name === 'startWithdraw') {
      this.handleClaimInputs();
    }
    if (selectedFunction.name === 'finalizeWithdraw') {
      this.handleCollectInputs();
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

  private handleBooleanDropdownChange = ({ value, name }: { value: boolean; name: string }) => {
    if (name === '_election') {
      this.setState({
        promoDemoBool: value.toString()
      });
    }
    this.setState({
      inputs: {
        ...this.state.inputs,
        [name as any]: {
          rawData: value.toString(),
          parsedData: value
        }
      }
    });
  };
}

export const CostlyContractCallScreen = connect(
  (state: AppState) => ({
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
