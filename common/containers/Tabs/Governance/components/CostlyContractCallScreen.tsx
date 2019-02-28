import React, { Component } from 'react';
import TabSection from 'containers/TabSection';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { connect } from 'react-redux';
import translate, { translateRaw } from 'translations';
import { AmountField } from './InteractExplorer/components/AmountField';
import { ResultScreen } from './ResultScreen';
import { bufferToHex } from 'ethereumjs-util';

import { Data } from 'libs/units';
import { INode } from 'libs/nodes';
import { configNodesSelectors } from 'features/config';
import {
  transactionFieldsActions,
  transactionFieldsSelectors,
  transactionMetaActions,
  transactionSelectors
} from 'features/transaction';
import { GenerateTransaction } from 'components/GenerateTransaction';
import { Input, Dropdown } from 'components/ui';
import { Fields } from './InteractExplorer/components';
import './InteractExplorer/InteractExplorer.scss';

import { GovernanceCall } from '..';

import '../index.scss';
import { Button } from './Button';
import { select } from 'redux-saga/effects';

interface StateProps {
  nodeLib: INode;
  to: AppState['transaction']['fields']['to'];
  dataExists: boolean;
}

interface DispatchProps {
  showNotification: notificationsActions.TShowNotification;
  setDataField: transactionFieldsActions.TSetDataField;
  setAsContractInteraction: transactionMetaActions.TSetAsContractInteraction;
  setAsViewAndSend: transactionMetaActions.TSetAsViewAndSend;
}

interface OwnProps {
  selectedFunction: ContractOption;
  contractCall: GovernanceCall;
  goBack: () => void;
}

enum ContractFlowStages {
  CONSTRUCT_TRANSACTION_SCREEN = 'construct transaction screen',
  SUBMIT_TRANSACTION_SCREEN = 'submit transaction screen',
  RESULT_SCREEN = 'result screen'
}

interface State {
  inputs: {
    [key: string]: { rawData: string; parsedData: string[] | string };
  };
  outputs: any;
  stage: ContractFlowStages;
  setValue?: any;
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

export class ContractCallClass extends Component<Props> {
  public static defaultProps: Partial<Props> = {};

  public state: State = {
    stage: ContractFlowStages.CONSTRUCT_TRANSACTION_SCREEN,
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
  goTo(newStage: ContractFlowStages) {
    this.setState({ stage: newStage });
  }

  render() {
    const { inputs, outputs } = this.state;
    const selectedFunction = this.props.selectedFunction;
    const generateOrWriteButton = this.props.dataExists ? (
      <GenerateTransaction />
    ) : (
      <button
        className="InteractExplorer-func-submit btn btn-primary"
        onClick={this.handleFunctionSend}
      >
        {translate('CONTRACT_WRITE')}
      </button>
    );
    var body;
    switch (this.state.stage) {
      case ContractFlowStages.CONSTRUCT_TRANSACTION_SCREEN:
        body = (
          <div className="GovernanceSection-form">
            <h2 className="FormInputTitle">{translate(this.props.contractCall.name)}</h2>
            <div key={selectedFunction.name}>
              {selectedFunction.contract.inputs.map((input, index) => {
                const { type, name } = input;
                const parsedName = name === '' ? index : name;
                const inputState = this.state.inputs[parsedName];
                return (
                  <div key={parsedName} className="input-group-wrapper">
                    <label className="input-group">
                      <div className="input-group-header">
                        {
                          // (parsedName === index ? `Input#${parsedName}` : parsedName) + ' ' + type
                        }
                        {translate(parsedName)}
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
              {selectedFunction.name === 'vote' ? (
                <AmountField setValue={this.state.setValue} readOnly={true} />
              ) : (
                <AmountField readOnly={false} />
              )}
              {selectedFunction.contract.constant ? (
                <button
                  className="InteractExplorer-func-submit btn btn-primary"
                  onClick={this.handleFunctionCall}
                >
                  {translate('CONTRACT_READ')}
                </button>
              ) : (
                <button
                  className="InteractExplorer-func-submit NextButton btn btn-primary"
                  onClick={this.handleStageChange}
                >
                  {translate('Submit')}
                </button>
              )}
              <button className="FormBackButton btn btn-default" onClick={this.props.goBack}>
                <span>{translate('GO_BACK')}</span>
              </button>
            </div>
          </div>
        );
        break;
      case ContractFlowStages.SUBMIT_TRANSACTION_SCREEN:
        body = (
          <React.Fragment>
            <Fields button={generateOrWriteButton} onClick={this.handleSuccessScreen} />
          </React.Fragment>
        );
        break;
      case ContractFlowStages.RESULT_SCREEN:
        body = <ResultScreen promoDemoBool={true} />;
        break;
    }
    return <div>{body}</div>;
  }
  private handleStageChange = () => {
    try {
      const data = this.encodeData();
      const { nodeLib, to, selectedFunction } = this.props;
      const callData = { to: to.raw, data };
      this.goTo(ContractFlowStages.SUBMIT_TRANSACTION_SCREEN);
    } catch (e) {
      this.props.showNotification(
        'warning',
        `Invalid input parameters: ${(e as Error).message}`,
        5000
      );
    }
  };

  private autoSetAmountValue(rawValue: any) {
    const value = rawValue * rawValue;
    console.log(value);
    this.setState({ setValue: value });
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
      this.props.showNotification(
        'warning',
        `Function call error: ${(e as Error).message}` || 'Invalid input parameters',
        5000
      );
    }
  };
  private contractOptions = () => {
    const { contractFunctions } = this.props;
    const transformedContractFunction: ContractOption[] = Object.keys(contractFunctions).map(
      contractFunction => {
        const contract = contractFunctions[contractFunction];
        return {
          name: contractFunction,
          contract
        };
      }
    );
    return transformedContractFunction;
  };
  private handleFunctionSend = (_: React.FormEvent<HTMLButtonElement>) => {
    try {
      const data = this.encodeData();
      this.props.setDataField({ raw: data, value: Data(data) });
    } catch (e) {
      this.props.showNotification(
        'danger',
        `Function send error: ${(e as Error).message}` || 'Invalid input parameters',
        5000
      );
    }
  };
  private handleInputChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const rawValue: string = ev.currentTarget.value;
    console.log(rawValue);
    console.log(ev.currentTarget.name);
    if (ev.currentTarget.name === '_votes') {
      this.autoSetAmountValue(rawValue);
    }
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
  public handleSuccessScreen(promoDemoBool: boolean) {
    if (promoDemoBool) {
      //Handle boolean change here
    } else {
      //Handle boolean change here
    }
    this.goTo(ContractFlowStages.RESULT_SCREEN);
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
    dataExists: transactionSelectors.getDataExists(state)
  }),
  {
    showNotification: notificationsActions.showNotification,
    setDataField: transactionFieldsActions.setDataField,
    resetTransactionRequested: transactionFieldsActions.resetTransactionRequested,
    setAsContractInteraction: transactionMetaActions.setAsContractInteraction,
    setAsViewAndSend: transactionMetaActions.setAsViewAndSend
  }
)(ContractCallClass);
