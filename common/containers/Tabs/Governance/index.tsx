import React, { Component } from 'react';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router';
import * as selectors from 'features/selectors';
import { setCurrentTo, TSetCurrentTo } from 'features/transaction/actions';
import { Option } from 'react-select';
import { AppState } from 'features/reducers';
import { notificationsActions } from 'features/notifications';
import { InteractExplorer } from './components/InteractExplorer';
import { connect } from 'react-redux';
import Contract from 'libs/contracts';
import translate, { translateRaw } from 'translations';
import TabSection from 'containers/TabSection';
import FreeContractCallScreen from './components/FreeContractCallScreen';
import { configSelectors } from 'features/config';
import VoteOrNominateIcon from 'assets/images/vote-or-nominate.svg';
import CollectTokensIcon from 'assets/images/collect-tokens.svg';
import ClaimTokensIcon from 'assets/images/claim-tokens.svg';

import { transactionFieldsActions } from 'features/transaction';
import './index.scss';
import { Button } from './components/Button';
import { select } from 'redux-saga/effects';
import { CostlyContractCallScreen } from './components/CostlyContractCallScreen';
//TODO: move these functioncall stuff into a separate component

//add all functioncall names here.
//Maybe change this so it can be generated by the contract
//though for user experience doing it here would probably make more sense
export enum CostlyContractCallName {
  VOTE = 'vote',
  CLAIM = 'claim',
  COLLECT = 'collect'
}

export enum FreeContractCallName {
  BALLOT_HISTORY = 'ballot history',
  CURRENT_GOVERNANCE_CYCLE = 'current governance cycle',
  WITHDRAW_RECORDS = 'withdraw records',
  BALLOT_RECORDS = 'ballot records',
  GOVERNANCE_CYCLE_RECORDS = 'governance cycle records',
  NOMINEE_BALLOTS = 'nominee ballots',
  CAN_GOVERN = 'can govern',
  IS_KYC_APPROVED = 'is kyc approved',
  IS_KYC_DENIED = 'is kyc denied',
  WITHDRAW_HISTORY = 'withdraw history'
}

export type ContractFuncNames = CostlyContractCallName | FreeContractCallName;

export interface ContractCallDesc {
  name: string;
  icon?: string;
  description: string;
  contractcall: string;
  example?: string;
}

interface NetworkContract {
  name: StaticNetworkIds;
  address?: string;
  abi: string;
}

const COSTLYFUNCTIONCALLS: ContractFuncNames[] = Object.values(CostlyContractCallName);
const FREEFUNCTIONCALLS: ContractFuncNames[] = Object.values(FreeContractCallName);
type CostlyContractCall = { [key in CostlyContractCallName]: ContractCallDesc };
type FreeContractCall = { [key in FreeContractCallName]: ContractCallDesc };
export type GovernanceCall = CostlyContractCall | FreeContractCall;

export enum GovernanceFlowStages {
  START_PAGE = 'start page',
  FREE_CALL_PAGE = 'free call page',
  COSTLY_CALL_PAGE = 'costly call page'
}

export interface State {
  stage: GovernanceFlowStages;
  chosenCall: GovernanceCall | null;
  currentContract: Contract;
  currentCall: null | ContractOption;
}

interface ContractOption {
  name: string;
  icon?: string;
  value: string;
}

interface DispatchProps {
  setCurrentTo: TSetCurrentTo;
  showNotification: notificationsActions.TShowNotification;
  resetTransactionRequested: transactionFieldsActions.TResetTransactionRequested;
}
interface StateProps {
  currentTo: ReturnType<typeof selectors.getCurrentTo>;
  contracts: NetworkContract[];
  isValidAddress: ReturnType<typeof configSelectors.getIsValidAddressFn>;
}

type Props = DispatchProps & StateProps;

const mapStateToProps = (state: AppState) => ({
  contracts: configSelectors.getNetworkContracts(state) || [],
  isValidAddress: configSelectors.getIsValidAddressFn(state),
  currentTo: selectors.getCurrentTo(state)
});

class Governance extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const contractNumber = this.props.contracts.length;
    var i = 0;
    for (i; i < contractNumber; i++) {
      var currentInstance = this.props.contracts[i];
      if (currentInstance.name === 'Weyl Governance') {
        if (currentInstance.address === '0x000000000000000000000000000000000000002a') {
          // this.props.setCurrentTo(currentInstance.address);
          break;
        }
      }
    }

    const x = this.accessContract(this.props.contracts[i].abi);
    this.state = {
      stage: GovernanceFlowStages.START_PAGE,
      chosenCall: null,
      // @ts-ignore
      currentCall: null,
      currentContract: x
    };

    const currentContract = this.state.currentContract;
    const contractFunctions = Contract.getFunctions(currentContract);
    const contractOptions = this.contractOptions(contractFunctions);

    const formattedContract = this.formatOptions(contractOptions);

    this.goTo = this.goTo.bind(this);
    this.goBack = this.goBack.bind(this);
  }

  public formatOptions = (options: Option[]) => {
    if (typeof options[0] === 'object') {
      return options;
    }
    const formatted = options.map(opt => {
      return { value: opt, label: opt };
    });
    return formatted;
  };

  componentDidMount() {
    this.props.resetTransactionRequested();
    const contractNumber = this.props.contracts.length;
    var i = 0;
    console.log('componentdidmount');
    for (i; i < contractNumber; i++) {
      var currentInstance = this.props.contracts[i];
      if (currentInstance.name === 'Weyl Governance') {
        if (currentInstance.address === '0x000000000000000000000000000000000000002a') {
          this.props.setCurrentTo(currentInstance.address);
          break;
        }
      }
    }
  }

  goTo(stage: GovernanceFlowStages, declaredCall: ContractFuncNames) {
    this.setState((state: State) => {
      let newState = Object.assign({}, state);
      newState.stage = stage;
      newState.chosenCall = this.GOVERNANCECALLS[declaredCall];
      newState.currentCall = this.contractOptionsMap()[
        this.GOVERNANCECALLS[declaredCall].contractcall
      ];
      return newState;
    });
  }

  private contractOptionsMap() {
    const currentContract = this.state.currentContract;
    const contractFunctions = Contract.getFunctions(currentContract);
    const contractOptions = this.contractOptions(contractFunctions);
    var contractOptionsMap: { [name: string]: any } = {};
    contractOptions.map(value => {
      contractOptionsMap[value.name] = value;
    });
    return contractOptionsMap as any;
  }

  public accessContract(contractAbi: string) {
    const parsedAbi = JSON.parse(contractAbi);
    return new Contract(parsedAbi);
  }

  public GOVERNANCECALLS: GovernanceCall = {
    [CostlyContractCallName.VOTE]: {
      name: 'VOTE',
      description: 'Requires EXC',
      icon: VoteOrNominateIcon,
      contractcall: 'vote'
    },
    [CostlyContractCallName.CLAIM]: {
      name: 'CLAIM',
      description: 'Requires EXC',
      icon: ClaimTokensIcon,
      contractcall: 'startWithdraw'
    },
    [CostlyContractCallName.COLLECT]: {
      name: 'COLLECT',
      description: 'Requires EXC',
      icon: CollectTokensIcon,
      contractcall: 'finalizeWithdraw'
    },
    [FreeContractCallName.BALLOT_HISTORY]: {
      name: 'BALLOT_HISTORY',
      contractcall: 'ballotHistory'
    },
    [FreeContractCallName.CURRENT_GOVERNANCE_CYCLE]: {
      name: 'CURRENT_GOVERNANCE_CYCLE',
      contractcall: 'currentGovernanceCycle'
    },
    [FreeContractCallName.WITHDRAW_RECORDS]: {
      name: 'WITHDRAW_RECORDS',
      contractcall: 'withdrawRecords'
    },
    [FreeContractCallName.BALLOT_RECORDS]: {
      name: 'BALLOT_RECORDS',
      contractcall: 'ballotHistory'
    },
    [FreeContractCallName.GOVERNANCE_CYCLE_RECORDS]: {
      name: 'GOVERNANCE_CYCLE_RECORDS',
      contractcall: 'governanceCycleRecords'
    },
    [FreeContractCallName.NOMINEE_BALLOTS]: {
      name: 'NOMINEE_BALLOTS',
      contractcall: 'nomineeBallots'
    },
    [FreeContractCallName.CAN_GOVERN]: {
      name: 'CAN_GOVERN',
      contractcall: 'canGovern'
    },
    [FreeContractCallName.IS_KYC_APPROVED]: {
      name: 'IS_KYC_APPROVED',
      contractcall: 'isKYCApproved'
    },
    [FreeContractCallName.IS_KYC_DENIED]: {
      name: 'IS_KYC_DENIED',
      contractcall: 'isKYCDenied'
    },
    [FreeContractCallName.WITHDRAW_HISTORY]: {
      name: 'WITHDRAW_HISTORY',
      contractcall: 'withdraw_history'
    }
  };

  public buildFunctionOptions(
    contractCallMap: ContractFuncNames[],
    stateTransition: GovernanceFlowStages
  ) {
    return (
      <div className="GovernanceSection-row">
        {contractCallMap.map((contractCall: ContractFuncNames) => {
          const call = this.GOVERNANCECALLS[contractCall];
          return (
            <Button
              key={contractCall}
              name={translateRaw(call.name)}
              icon={call.icon}
              onClick={() => this.goTo(stateTransition, contractCall)}
              description={translateRaw(call.description)}
            />
          );
        })}
      </div>
    );
  }

  public goBack() {
    // your transition
    const stage = GovernanceFlowStages.START_PAGE;
    this.setState((state: State) => {
      let newState = Object.assign({}, state);
      newState.stage = stage;
      newState.chosenCall = null;
      return newState;
    });
  }
  public componentDidUpdate(prevProps, prevStates) {
    if (prevStates.stage !== GovernanceFlowStages.START_PAGE) {
      this.goBack();
    }
  }

  private contractOptions = (contractFunctions: any) => {
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

  public render() {
    const currentContract = this.state.currentContract;
    const contractFunctions = Contract.getFunctions(currentContract);
    let stages = GovernanceFlowStages;
    var body;
    switch (this.state.stage) {
      case GovernanceFlowStages.START_PAGE:
        body = (
          <div>
            <h2 className="GovernanceSection-topsection-subtitle">
              {translate('GENERATE_GOVERNANCE_DESC')}
            </h2>
            {this.buildFunctionOptions(COSTLYFUNCTIONCALLS, stages.COSTLY_CALL_PAGE)}
            {this.buildFunctionOptions(FREEFUNCTIONCALLS, stages.FREE_CALL_PAGE)}
          </div>
        );
        break;
      case GovernanceFlowStages.FREE_CALL_PAGE:
        body = <FreeContractCallScreen goBack={this.goBack} contractCall={this.state.chosenCall} />;
        break;
      case GovernanceFlowStages.COSTLY_CALL_PAGE:
        body = (
          <CostlyContractCallScreen
            selectedFunction={this.state.currentCall}
            goBack={this.goBack}
            contractCall={this.state.chosenCall}
          />
        );
        break;
    }
    return (
      <TabSection isUnavailableOffline={true}>
        <div className="GovernanceSection-topsection">
          <h2 className="ContractSection-topsection-title">
            {translate('GENERATE_GOVERNANCE_TITLE')}
          </h2>
        </div>
        <section className="Tab-content GovernanceSection-content">{body}</section>
      </TabSection>
    );
  }
}

export default connect(mapStateToProps, {
  setCurrentTo,
  resetTransactionRequested: transactionFieldsActions.resetTransactionRequested
})(Governance);
