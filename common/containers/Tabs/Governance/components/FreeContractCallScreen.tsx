import React, { Component } from 'react';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { connect } from 'react-redux';
import translate, { translateRaw } from 'translations';
import { bufferToHex } from 'ethereumjs-util';
import arrow from 'assets/images/output-arrow.svg';
import moment from 'moment';
import { AddressField } from 'components';

import { INode } from 'libs/nodes';
import { configNodesSelectors } from 'features/config';
import {
  transactionActions,
  transactionFieldsActions,
  transactionFieldsSelectors,
  transactionMetaActions,
  transactionSelectors
} from 'features/transaction';
import { Input, Dropdown } from 'components/ui';
import './InteractExplorer/InteractExplorer.scss';
import './FreeContractCallScreen.scss';
import { GovernanceFlowStages } from '..';
import { ContractFuncNames, CostlyContractCallName } from '..';

import '../index.scss';
import { decode } from 'punycode';
import { isValidAbiJson } from 'libs/validators';

interface StateProps {
  nodeLib: INode;
  to: AppState['transaction']['fields']['to'];
  dataExists: boolean;
  txBroadcasted: boolean;
  currentTransactionFailed: boolean;
  currentTransactionIndex: any;
  broadcastState: any;
}

interface DispatchProps {
  showNotification: notificationsActions.TShowNotification;
  setDataField: transactionFieldsActions.TSetDataField;
  setAsContractInteraction: transactionMetaActions.TSetAsContractInteraction;
  setAsViewAndSend: transactionMetaActions.TSetAsViewAndSend;
  setCurrentValue: transactionActions.TSetCurrentValue;
}

interface OwnProps {
  selectedFunction: ContractOption;
  contractCall: ContractFuncNames;
  chainedCalls: null | ContractFuncNames[];
  chainedFunctions: null | ContractOption[];
  goBack: () => void;
}

interface State {
  inputs: {
    [key: string]: { rawData: string; parsedData: string[] | string };
  };
  outputs: any;
  outputOptions?: ContractOption;
  governanceCycleStatus?: number;
  withdrawRecordStatus?: number;
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

export class FreeContractCallClass extends Component<Props, State> {
  public static defaultProps: Partial<Props> = {};
  constructor(props: Props) {
    super(props);
    const { chainedCalls, chainedFunctions, selectedFunction } = this.props;
    let outputFunction = JSON.parse(JSON.stringify(selectedFunction));
    if (
      chainedFunctions &&
      !outputFunction.contract.outputs.includes(chainedFunctions[0].contract.outputs[0])
    ) {
      outputFunction.contract.outputs = outputFunction.contract.outputs.concat(
        chainedFunctions[0].contract.outputs
      );
    }
    this.state = {
      inputs: {},
      outputs: {},
      outputOptions: outputFunction
    };
  }

  public componentDidMount() {
    this.props.setAsContractInteraction();
  }

  public componentWillUnmount() {
    this.props.setAsViewAndSend();
  }

  render() {
    const {
      inputs,
      outputs,
      outputOptions,
      governanceCycleStatus,
      withdrawRecordStatus
    } = this.state;
    const { selectedFunction } = this.props;
    const outputFunction = outputOptions;
    // console.log(this.props.chainedCall)
    // console.log(this.props.chainedFunction)

    return (
      <React.Fragment>
        <div className="GovernanceSection-topsection">
          <button className="FormBackButton fa fa-chevron-left" onClick={this.props.goBack} />
          <h2 className="ContractSection-topsection-title">{translate(this.props.contractCall)}</h2>
        </div>
        <section className="Tab-content GovernanceSection-content">
          <div className="GovernanceSection-form">
            <div key={selectedFunction.name}>
              {selectedFunction && (
                <div key={selectedFunction.name}>
                  {
                    // These are the inputs
                  }
                  <div className="ReadFunctionContent flex-wrapper">
                    <div className="Input-container">
                      <div className="Input-box">
                        <h4 className="ReadFunctionContent-header">
                          <i className="ElectronNav-controls-btn-icon fa fa-sign-in" />
                          Inputs
                        </h4>

                        {selectedFunction.contract.inputs.map((input, index) => {
                          const { type, name } = input;
                          // if name is not supplied to arg, use the index instead
                          // since that's what the contract ABI function factory subsitutes for the name
                          // if it is undefined
                          const parsedName = name === '' ? index : name;
                          const newName = selectedFunction.name + 'Input' + parsedName;
                          const inputState = this.state.inputs[parsedName];
                          let inputField;
                          if (type == 'bool') {
                            <Dropdown
                              options={[
                                { value: false, label: 'false' },
                                { value: true, label: 'true' }
                              ]}
                              value={
                                inputState
                                  ? {
                                      label: inputState.rawData,
                                      value: inputState.parsedData as any
                                    }
                                  : undefined
                              }
                              clearable={false}
                              onChange={({ value }: { value: boolean }) => {
                                this.handleBooleanDropdownChange({ value, name: parsedName });
                              }}
                            />;
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
                            <div
                              key={parsedName}
                              className="input-group-wrapper InteractExplorer-func-in"
                            >
                              <label className="input-group">
                                <div className="input-group-header">{translateRaw(newName)}</div>
                                {inputField}
                              </label>
                            </div>
                          );
                        })}
                        <button
                          className="InteractExplorer-func-submit btn btn-primary FormReadButton"
                          onClick={this.handleFunctionCall}
                        >
                          {translate('CONTRACT_READ')}
                        </button>
                      </div>
                    </div>

                    <div className="ReadFunctionContent-arrow">
                      {/* <img src={arrow} alt="arrow" /> */}
                    </div>
                    {
                      // These are the outputs
                    }
                    <div className="Output-container">
                      <div className="Output-box">
                        <h4 className="ReadFunctionContent-header">
                          <i className="ElectronNav-controls-btn-icon fa fa-sign-out" />
                          Outputs
                        </h4>
                        {outputFunction.contract.outputs.map((output: any, index: number) => {
                          const { type, name } = output;
                          const parsedName = name === '' ? index : name;
                          // console.log(parsedName);
                          const o = outputs[parsedName];
                          const rawFieldValue = o === null || o === undefined ? '' : o;
                          let decodedFieldValue = Buffer.isBuffer(rawFieldValue)
                            ? bufferToHex(rawFieldValue)
                            : rawFieldValue;
                          const newName = outputFunction.name + 'Output' + parsedName;
                          let isTimestamp;
                          if (
                            (newName.includes('time') || newName.includes('start')) &&
                            decodedFieldValue !== '0'
                          ) {
                            isTimestamp = true;
                          } else {
                            isTimestamp = false;
                          }
                          if (o !== null || o !== undefined) {
                            if (parsedName === 'status') {
                              if (decodedFieldValue === '0')
                                decodedFieldValue = translateRaw(`NOT_STARTED`);
                              else if (decodedFieldValue === '1')
                                decodedFieldValue = translateRaw(`STARTED`);
                              else if (decodedFieldValue === '2')
                                decodedFieldValue = translateRaw(`CLOSED`);
                            }
                            if (parsedName === 'election') {
                              if (decodedFieldValue === true) {
                                decodedFieldValue = translateRaw('FOR_PROMOTION');
                              } else if (decodedFieldValue === false) {
                                decodedFieldValue = translateRaw('FOR_DEMOTION');
                              }
                            }
                            if (parsedName === 'inSupport') {
                              if (decodedFieldValue === true) {
                                decodedFieldValue = translateRaw('IN_SUPPORT_FOR');
                              } else if (decodedFieldValue === false) {
                                decodedFieldValue = translateRaw('IN_SUPPORT_AGAINST');
                              }
                            }
                          }

                          return (
                            <div
                              key={parsedName}
                              className="flex-wrapper InteractExplorer-func-out"
                            >
                              <label className="output-group">
                                <div className="input-group-header">{translate(newName)}</div>
                                <Input
                                  className="InteractExplorer-func-out-input"
                                  isValid={!!decodedFieldValue}
                                  value={
                                    decodedFieldValue &&
                                    (isTimestamp
                                      ? moment.unix(decodedFieldValue).format('l LT')
                                      : decodedFieldValue)
                                  }
                                  disabled={true}
                                />
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </React.Fragment>
    );
  }
  private handleSelectAddressFromBook = (ev: React.FormEvent<HTMLInputElement>) => {
    const { selectedFunction } = this.props;
    const { currentTarget: { value: addressFromBook } } = ev;
    ev.currentTarget.name = selectedFunction.contract.inputs[0].name;
    ev.currentTarget.value = addressFromBook;

    this.handleInputChange(ev);
  };
  private handleInputChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const rawValue: string = ev.currentTarget.value;
    const isArr = rawValue.startsWith('[') && rawValue.endsWith(']');
    const value = {
      rawData: rawValue,
      parsedData: isArr ? this.tryParseJSON(rawValue) : rawValue
    };
    this.setState({
      inputs: {
        ...this.state.inputs,
        [ev.currentTarget.name]: value
      }
    });
  };
  private tryParseJSON(input: string) {
    try {
      return JSON.parse(input);
    } catch {
      return input;
    }
  }
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
    if (value.length > 0 && chainedFunctions[0].name !== nameOfFunction) {
      return value[0];
    }
    return null;
  };
  private handleFunctionCall = async (_: React.FormEvent<HTMLButtonElement>) => {
    try {
      const data = this.encodeData();
      const { nodeLib, to, selectedFunction, chainedFunctions } = this.props;
      if (!to.value) {
        throw Error();
      }
      const callData = { to: to.raw, data };
      const results = await nodeLib.sendCallRequest(callData);
      let parsedResult = selectedFunction!.contract.decodeOutput(results);

      if (chainedFunctions) {
        //withdrawHistory is a special case where we have swapped withdrawHistory for ballotHistory/ballotRecords
        let chainedParsedResults;
        if (selectedFunction.name === 'withdrawHistory') {
          const ballotRecord = this.functionFilter('ballotRecords');
          if (ballotRecord) {
            const ballotRecordResults = await this.handleChainedCalls(parsedResult, ballotRecord);
            parsedResult = { 0: ballotRecordResults['withdrawRecordId'] };
            chainedParsedResults = await this.handleChainedCalls(parsedResult, chainedFunctions[0]);
          }
        } else {
          chainedParsedResults = await this.handleChainedCalls(parsedResult, chainedFunctions[0]);
        }
        // //All of the additional chainedFunctions after the first one are only called when we need more
        // //information about the claiming token and collect token state.
        // const cycleFunction = this.functionFilter('governanceCycleRecords');
        // if (cycleFunction) {
        //   const newInput = { 0: chainedParsedResults['governanceCycleId'] };
        //   const cycleParsedResults = await this.handleChainedCalls(newInput, cycleFunction);
        //   this.setState({ governanceCycleStatus: cycleParsedResults['status'] });
        // }
        // const withdrawFunction = this.functionFilter('withdrawRecords');
        // if (withdrawFunction) {
        //   const newInput = { 0: chainedParsedResults['withdrawRecordId'] };
        //   const withdrawParsedResults = await this.handleChainedCalls(newInput, withdrawFunction);
        //   this.setState({ withdrawRecordStatus: withdrawParsedResults['status'] });
        // }
        if (chainedParsedResults['timestamp'] == 0) {
          this.setState({ governanceCycleStatus: undefined, withdrawRecordStatus: undefined });
        }
        this.setState({ outputs: { ...parsedResult, ...chainedParsedResults } });
      } else {
        this.setState({ outputs: parsedResult });
      }
    } catch (e) {
      this.props.showNotification('warning', 'Invalid input parameters', 5000);
    }
  };

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

export const FreeContractCallScreen = connect(
  (state: AppState) => ({
    nodeLib: configNodesSelectors.getNodeLib(state),
    to: transactionFieldsSelectors.getTo(state),
    dataExists: transactionSelectors.getDataExists(state)
  }),
  {
    showNotification: notificationsActions.showNotification,
    setDataField: transactionFieldsActions.setDataField,
    resetTransactionRequested: transactionFieldsActions.resetTransactionRequested,
    setAsContractInteraction: transactionMetaActions.setAsContractInteraction,
    setAsViewAndSend: transactionMetaActions.setAsViewAndSend,
    setCurrentValue: transactionActions.setCurrentValue
  }
)(FreeContractCallClass);
