import React, { Component } from 'react';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { connect } from 'react-redux';
import translate, { translateRaw } from 'translations';
import { bufferToHex } from 'ethereumjs-util';

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
  goBack: () => void;
}

interface State {
  inputs: {
    [key: string]: { rawData: string; parsedData: string[] | string };
  };
  outputs: any;
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

export class FreeContractCallClass extends Component<Props> {
  public static defaultProps: Partial<Props> = {};

  public state: State = {
    inputs: {},
    outputs: {}
  };
  public componentDidMount() {
    this.props.setAsContractInteraction();
    //
  }

  public componentWillUnmount() {
    this.props.setAsViewAndSend();
  }

  render() {
    const { inputs, outputs } = this.state;
    const selectedFunction = this.props.selectedFunction;
    return (
      <div className="GovernanceSection-form">
        <h2 className="FormInput-title">{translate(this.props.contractCall)}</h2>
        <p className="FormInput-subtitle">{translate(this.props.contractCall)}</p>

        <div key={selectedFunction.name}>
          {selectedFunction && (
            <div key={selectedFunction.name}>
              {
                // These are the inputs
              }
              <div className="ReadFunctionContent flex-wrapper">
                <div className="Input-box">
                  <h4 className="ReadFunctionContent-header"> Inputs </h4>
                  {selectedFunction.contract.inputs.map((input, index) => {
                    const { type, name } = input;
                    // if name is not supplied to arg, use the index instead
                    // since that's what the contract ABI function factory subsitutes for the name
                    // if it is undefined
                    const parsedName = name === '' ? index : name;

                    const inputState = this.state.inputs[parsedName];
                    return (
                      <div
                        key={parsedName}
                        className="input-group-wrapper InteractExplorer-func-in"
                      >
                        <label className="input-group">
                          <div className="input-group-header">
                            {(parsedName === index ? `Input#${parsedName}` : parsedName) +
                              ' ' +
                              type}
                          </div>
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
                  <button className="FormBackButton btn btn-default" onClick={this.props.goBack}>
                    <span>{translate('GO_BACK')}</span>
                  </button>
                  <button
                    className="InteractExplorer-func-submit btn btn-primary FormReadButton"
                    onClick={this.handleFunctionCall}
                  >
                    {translate('CONTRACT_READ')}
                  </button>
                </div>
                {
                  // These are the outputs
                }
                <div className="Output-box">
                  <h4 className="ReadFunctionContent-header"> Outputs </h4>

                  {selectedFunction.contract.outputs.map((output: any, index: number) => {
                    const { type, name } = output;
                    const parsedName = name === '' ? index : name;
                    const o = outputs[parsedName];
                    const rawFieldValue = o === null || o === undefined ? '' : o;
                    const decodedFieldValue = Buffer.isBuffer(rawFieldValue)
                      ? bufferToHex(rawFieldValue)
                      : rawFieldValue;

                    return (
                      <div
                        key={parsedName}
                        className="input-group-wrapperInteractExplorer-func-out"
                      >
                        <label className="input-group">
                          <div className="input-group-header">{name + ' ' + type}</div>
                          <Input
                            className="InteractExplorer-func-out-input"
                            isValid={!!decodedFieldValue}
                            value={decodedFieldValue}
                            disabled={true}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
      const { nodeLib, to, selectedFunction } = this.props;
      if (!to.value) {
        throw Error();
      }
      const callData = { to: to.raw, data };
      const results = await nodeLib.sendCallRequest(callData);
      const parsedResult = selectedFunction!.contract.decodeOutput(results);
      this.setState({ outputs: parsedResult });
    } catch (e) {
      console.log(e);
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
