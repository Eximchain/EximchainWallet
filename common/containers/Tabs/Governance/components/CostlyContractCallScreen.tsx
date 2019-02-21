import React, { Component } from 'react';
import TabSection from 'containers/TabSection';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { connect } from 'react-redux';
import translate, { translateRaw } from 'translations';

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

import { ContractFuncNames } from '..';

import '../index.scss';
import { Button } from './Button';

interface StateProps {
  nodeLib: INode;
  to: AppState['transaction']['fields']['to'];
  dataExists: boolean;
}

interface DispatchProps {
  showNotification: notificationsActions.TShowNotification;
  setDataField: transactionFieldsActions.TSetDataField;
  resetTransactionRequested: transactionFieldsActions.TResetTransactionRequested;
  setAsContractInteraction: transactionMetaActions.TSetAsContractInteraction;
  setAsViewAndSend: transactionMetaActions.TSetAsViewAndSend;
}

interface OwnProps {
  selectedFunction: ContractOption;
  contractFxnName: ContractFuncNames | null;
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

export class ContractCallClass extends Component<Props> {
  public static defaultProps: Partial<Props> = {};

  public state: State = {
    inputs: {},
    outputs: {}
  };
  public componentDidMount() {
    this.props.setAsContractInteraction();
    this.props.resetTransactionRequested();
  }

  public componentWillUnmount() {
    this.props.setAsViewAndSend();
  }
  render() {
    const { inputs, outputs } = this.state;
    const selectedFunction = this.props.selectedFunction;
    console.log(selectedFunction, 'asdfsasdfasdfas');
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
    return (
      <div>
        {this.props.contractFxnName}
        <div key={selectedFunction.name}>
          {selectedFunction.contract.inputs.map((input, index) => {
            const { type, name } = input;
            const parsedName = name === '' ? index : name;
            const inputState = this.state.inputs[parsedName];
            return (
              <div key={parsedName}>
                {type === 'bool' ? (
                  <Dropdown
                    options={[{ value: false, label: 'false' }, { value: true, label: 'true' }]}
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
              </div>
            );
          })}
          {selectedFunction.contract.outputs.map((output: any, index: number) => {
            const { type, name } = output;
            const parsedName = name === '' ? index : name;
            const o = outputs[parsedName];
            const rawFieldValue = o === null || o === undefined ? '' : o;
            const decodedFieldValue = Buffer.isBuffer(rawFieldValue)
              ? bufferToHex(rawFieldValue)
              : rawFieldValue;
            return (
              <div key={parsedName}>
                <Input
                  className="InteractExplorer-func-out-input"
                  isValid={!!decodedFieldValue}
                  value={decodedFieldValue}
                  disabled={true}
                />
              </div>
            );
          })}
          {selectedFunction.contract.constant ? (
            <button
              className="InteractExplorer-func-submit btn btn-primary"
              onClick={this.handleFunctionCall}
            >
              {translate('CONTRACT_READ')}
            </button>
          ) : (
            <React.Fragment>
              <Fields button={generateOrWriteButton} />
            </React.Fragment>
          )}
        </div>
        <Button key="Back" name="Back Button" onClick={this.props.goBack} description="go back" />
      </div>
    );
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
      console.log(callData);
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
