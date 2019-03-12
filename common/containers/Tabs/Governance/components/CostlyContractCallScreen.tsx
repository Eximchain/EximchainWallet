import React, { Component } from 'react';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { connect } from 'react-redux';
import translate from 'translations';
import { AmountField } from './InteractExplorer/components/AmountField';
import ResultScreen from './ResultScreen';

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
import './InteractExplorer/InteractExplorer.scss';

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
  stageHistory: ContractFlowStages[];
  setValue?: any;
  broadcastHash?: any;
  promoDemoBool?: any;
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
    this.goTo = this.goTo.bind(this);
    this.back = this.back.bind(this);
  }
  public static defaultProps: Partial<Props> = {};

  public state: State = {
    stage: ContractFlowStages.CONSTRUCT_TRANSACTION_SCREEN,
    stageHistory: [],
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

  public componentDidUpdate(prevProps: Props) {
    if (
      prevProps.txBroadcasted == false &&
      this.props.txBroadcasted &&
      !this.props.currentTransactionFailed
    ) {
      const broadcastedHash = this.props.broadcastState[
        this.props.currentTransactionIndex.indexingHash
      ].broadcastedHash;
      this.setState({ broadcastHash: broadcastedHash });
      this.goTo(ContractFlowStages.RESULT_SCREEN);
    }
  }

  private goTo(stage: ContractFlowStages) {
    this.setState((state: State) => {
      let newState = Object.assign({}, state);
      newState.stageHistory.push(this.state.stage);
      newState.stage = stage;
      return newState;
    });
  }

  private back() {
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
      return newState;
    });
  }

  render() {
    console.log(this.state.stageHistory);
    console.log(this.state.stage);
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
          <div className="GovernanceSection-form-write">
            <h2 className="FormInput-title">{translate(this.props.contractCall + 'Name')}</h2>
            <p className="FormInput-subtitle">
              {translate(this.props.selectedFunction.name + 'Description')}
            </p>

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
                            { value: false, label: translate(parsedName + 'false') },
                            { value: true, label: translate(parsedName + 'true') }
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
                <label className="input-group flex-wrapper">
                  <div className="input-group-header EXCAmount">EXC Amount</div>
                  <Input
                    className="InteractExplorer-func-in-input"
                    name={'Value'}
                    value={this.state.setValue}
                    readOnly={true}
                  />
                </label>
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
            <Fields button={generateOrWriteButton} />

            <button className="FormBackButton btn btn-default" onClick={this.back}>
              <span>{translate('GO_BACK')}</span>
            </button>
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
    try {
      const data = this.encodeData();
      const { nodeLib, to, selectedFunction } = this.props;
      const callData = { to: to.raw, data };
      console.log(this.state.setValue);
      this.props.setDataField({ raw: data, value: Data(data) });
      this.goTo(ContractFlowStages.SUBMIT_TRANSACTION_SCREEN);
    } catch (e) {
      this.props.showNotification('warning', `All fields are required`, 5000);
    }
  };

  private autoSetAmountValue(rawValue: any) {
    const value = rawValue * rawValue;
    this.setState({ setValue: value });
    this.props.setCurrentValue(value.toString());
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
      this.props.setCurrentValue(this.state.setValue.toString());
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
    broadcastState: transactionBroadcastSelectors.getBroadcastState(state)
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