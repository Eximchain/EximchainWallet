import React, { Component } from 'react';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { connect } from 'react-redux';
import translate, { translateRaw } from 'translations';
import { bufferToHex } from 'ethereumjs-util';
import arrow from 'assets/images/output-arrow.svg';
import moment from 'moment';

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

import { ContractFuncNames } from '..';

import '../index.scss';
import { decode } from 'rlp';
import { selectedNodeActions } from 'features/config/nodes/selected/reducer.spec';

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
  chainedCall: null | ContractFuncNames;
  chainedFunction: null | ContractOption;
  goBack: () => void;
}

interface State {
  inputs: {
    [key: string]: { rawData: string; parsedData: string[] | string };
  };
  outputs: any;
  outputOptions?: ContractOption;
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
    const { chainedCall, chainedFunction, selectedFunction } = this.props;
    let outputFunction: ContractOption;
    if (chainedFunction) {
      outputFunction = chainedFunction;
      outputFunction.contract.outputs = selectedFunction.contract.outputs.concat(
        chainedFunction.contract.outputs
      );
    } else {
      outputFunction = selectedFunction;
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
    const { inputs, outputs, outputOptions } = this.state;
    const selectedFunction = this.props.selectedFunction;
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
                          return (
                            <div
                              key={parsedName}
                              className="input-group-wrapper InteractExplorer-func-in"
                            >
                              <label className="input-group">
                                <div className="input-group-header">{translateRaw(newName)}</div>
                                {type === 'bool' ? (
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
                                  />
                                ) : (
                                  <Input
                                    className="InteractExplorer-func-in-input"
                                    isValid={!!(inputs[parsedName] && inputs[parsedName].rawData)}
                                    name={parsedName}
                                    value={(inputs[parsedName] && inputs[parsedName].rawData) || ''}
                                    onChange={this.handleInputChange}
                                  />
                                )}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        className="InteractExplorer-func-submit btn btn-primary FormReadButton"
                        onClick={this.handleFunctionCall}
                      >
                        {translate('CONTRACT_READ')}
                      </button>
                    </div>

                    <div className="ReadFunctionContent-arrow">
                      <img src={arrow} alt="arrow" />
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
                          const o = outputs[parsedName];
                          const rawFieldValue = o === null || o === undefined ? '' : o;
                          const decodedFieldValue = Buffer.isBuffer(rawFieldValue)
                            ? bufferToHex(rawFieldValue)
                            : rawFieldValue;
                          const newName = outputFunction.name + 'Output' + parsedName;
                          console.log(newName);
                          let isTimestamp;
                          if (
                            (newName.includes('time') || newName.includes('start')) &&
                            decodedFieldValue !== '0'
                          ) {
                            isTimestamp = true;
                          } else {
                            isTimestamp = false;
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
  private handleFunctionCall = async (_: React.FormEvent<HTMLButtonElement>) => {
    try {
      const data = this.encodeData();
      const { nodeLib, to, selectedFunction, chainedFunction } = this.props;
      if (!to.value) {
        throw Error();
      }
      const callData = { to: to.raw, data };
      const results = await nodeLib.sendCallRequest(callData);
      const parsedResult = selectedFunction!.contract.decodeOutput(results);
      if (chainedFunction) {
        const data = chainedFunction!.contract.encodeInput(parsedResult);
        const chainedCallData = { to: to.raw, data };
        const chainedResults = await nodeLib.sendCallRequest(chainedCallData);
        const chainedParsedResults = chainedFunction!.contract.decodeOutput(chainedResults);
        this.setState({ outputs: { ...parsedResult, ...chainedParsedResults } });
      } else {
        this.setState({ outputs: parsedResult });
      }
    } catch (e) {
      this.props.showNotification(
        'warning',
        `Function call error: ${(e as Error).message}` || 'Invalid input parameters',
        5000
      );
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
