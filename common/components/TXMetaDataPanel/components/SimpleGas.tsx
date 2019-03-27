import React from 'react';
import { connect } from 'react-redux';
import Slider, { createSliderWithTooltip, Marks } from 'rc-slider';

import { gasPriceDefaults } from 'config';
import translate, { translateRaw } from 'translations';
import { Wei, fromWei } from 'libs/units';
import { AppState } from 'features/reducers';
import { configNodesSelectors } from 'features/config';
import { transactionFieldsActions, transactionNetworkSelectors } from 'features/transaction';
import { gasActions, gasSelectors } from 'features/gas';
import { scheduleSelectors } from 'features/schedule';
import { InlineSpinner } from 'components/ui/InlineSpinner';
import FeeSummary from './FeeSummary';
import './SimpleGas.scss';
import { estimateGas } from 'features/transaction/network/sagas';

const SliderWithTooltip = createSliderWithTooltip(Slider);

interface OwnProps {
  gasPrice: AppState['transaction']['fields']['gasPrice'];
  setGasPrice: transactionFieldsActions.TInputGasPrice;

  inputGasPrice(rawGas: string): void;
}

interface StateProps {
  gasEstimates: AppState['gas']['estimates'];
  isGasEstimating: AppState['gas']['isEstimating'];
  noncePending: boolean;
  gasLimitPending: boolean;
  isWeb3Node: boolean;
  gasLimitEstimationTimedOut: boolean;
  scheduleGasPrice: AppState['schedule']['scheduleGasPrice'];
}

interface ActionProps {
  fetchGasEstimates: gasActions.TFetchGasEstimates;
}

type Props = OwnProps & StateProps & ActionProps;

enum SliderStates {
  SLOW = 'slow',
  AVERAGE = 'average',
  FAST = 'fast'
}
interface State {
  hasSetRecommendedGasPrice: boolean;
  defaultGasPriceOn: boolean;
  sliderState: SliderStates;
}

interface GasTooltips {
  [estimationLevel: string]: string;
}

class SimpleGas extends React.Component<Props> {
  public state: State = {
    hasSetRecommendedGasPrice: false,
    defaultGasPriceOn: true,
    sliderState: SliderStates.AVERAGE
  };

  public componentDidMount() {
    this.props.fetchGasEstimates();
  }

  // public UNSAFE_componentWillReceiveProps(nextProps: Props) {
  //   if (!this.state.hasSetRecommendedGasPrice && nextProps.gasEstimates) {
  //     this.setState({ hasSetRecommendedGasPrice: true });
  //     this.props.setGasPrice(nextProps.gasEstimates.fast.toString());
  //   }
  // }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (!prevState.hasSetRecommendedGasPrice && this.props.gasEstimates) {
      this.setState({
        hasSetRecommendedGasPrice: true,
        defaultGasPriceOn: true
      });
      prevProps.setGasPrice(this.props.gasEstimates.fast.toString());
    }
  }

  public render() {
    const {
      isGasEstimating,
      gasEstimates,
      gasPrice,
      gasLimitEstimationTimedOut,
      isWeb3Node,
      noncePending,
      gasLimitPending,
      scheduleGasPrice
    } = this.props;
    const { sliderState } = this.state;
    const bounds = {
      max: gasEstimates ? gasEstimates.fastest : gasPriceDefaults.max,
      min: gasEstimates ? gasEstimates.safeLow : gasPriceDefaults.min
    };
    const average = (bounds.max + bounds.min) / 2;
    const gasNotches = this.makeGasNotches();

    /**
     * @desc On retrieval of gas estimates,
     *  the current gas price may be lower than the lowest recommended price.
     *  `rc-slider` will force the onChange if the value is too low, so we
     *  ensure it at least passes the lower boundary.
     *  When this occurs, the logic in `UNSAFE_componentWillReceiveProps` fires,
     *  and it cannot happen again from that point forward.
     */
    const actualGasPrice = Math.max(this.getGasPriceGwei(gasPrice.value), bounds.min);
    console.log(this.state.defaultGasPriceOn);
    if (this.state.defaultGasPriceOn) {
      this.setGasPrice(SliderStates.AVERAGE);
    }

    return (
      <div className="SimpleGas row form-group">
        {
          // <div className="SimpleGas-title">
          // <div className="flex-wrapper">
          // <label>{translate('CONFIRM_TX_FEE')}
          // <FeeSummary
          //   gasPrice={gasPrice}
          //   scheduleGasPrice={scheduleGasPrice}
          //   render={({ fee }) => <span>{fee}</span>}
          // />
          // </label>
          // <div className="flex-spacer" />
          //   <InlineSpinner active={noncePending || gasLimitPending} text="Calculating" />
          // </div>
          // </div>
        }

        {gasLimitEstimationTimedOut && (
          <div className="prompt-toggle-gas-limit">
            <p className="small">
              {isWeb3Node
                ? "Couldn't calculate gas limit, if you know what you're doing, try setting manually in Advanced settings"
                : "Couldn't calculate gas limit, try switching nodes"}
            </p>
          </div>
        )}
        <div className="SimpleGas-input-group">
          <div className="SimpleGas-slider">
            <SliderWithTooltip
              // onChange={this.handleSlider}
              min={bounds.min * 2 - (bounds.min + bounds.max) / 2}
              max={bounds.max}
              marks={gasNotches}
              included={false}
              step={bounds.min < 1 ? 0.1 : 1}
              value={actualGasPrice}
              tipFormatter={this.formatTooltip}
              disabled={isGasEstimating}
              className={sliderState}
            />
            {
              //   <div className="SimpleGas-slider-labels">
              //   <span>{translate('TX_FEE_SCALE_LEFT')}</span>
              //   <span>{translate('TX_FEE_SCALE_RIGHT')}</span>
              // </div>
            }
            <div className="SimpleGas-buttonRow">
              <input
                id="slowGas"
                type="radio"
                name="gasPrice"
                value="slowGas"
                className="SimpleGas-button"
                onClick={() => this.setGasPrice(SliderStates.SLOW)}
                checked={actualGasPrice.toString() === bounds.min.toString()}
              />
              <label htmlFor="slowGas" className="config-select">
                <span>Slow</span>
                <p> {bounds.min} Gwei </p>
              </label>

              <input
                id="averageGas"
                type="radio"
                name="gasPrice"
                value="averageGas"
                className="SimpleGas-button"
                onClick={() => this.setGasPrice(SliderStates.AVERAGE)}
                checked={actualGasPrice.toString() === average.toString()}
              />
              <label htmlFor="averageGas" className="config-select id-config-wrapper">
                <span>Average</span>
                <p> {(bounds.min + bounds.max) / 2} Gwei </p>
              </label>

              <input
                id="fastGas"
                type="radio"
                name="gasPrice"
                value="fastGas"
                className="SimpleGas-button"
                onClick={() => this.setGasPrice(SliderStates.FAST)}
                checked={actualGasPrice.toString() === bounds.max.toString()}
              />
              <label htmlFor="fastGas" className="config-select id-config-wrapper">
                <span>Fast</span>
                <p> {bounds.max} Gwei </p>
              </label>

              {
                //   <button className="SimpleGas-button" onClick={() => this.setGasPrice('average')}>
                //   Average
                //   <p> 12 Gwei </p>
                // </button>
                // <button className="SimpleGas-button" onClick={() => this.setGasPrice('fast')}>
                //   Fast
                //   <p> 20 Gwei </p>
                // </button>
              }
            </div>
          </div>
          <FeeSummary
            gasPrice={gasPrice}
            scheduleGasPrice={scheduleGasPrice}
            render={({ fee }) => <span>{fee}</span>}
          />
        </div>
      </div>
    );
  }

  private setGasPrice = (speed: SliderStates) => {
    this.setState({
      defaultGasPriceOn: false,
      sliderState: speed
    });
    const { gasEstimates } = this.props;
    const bounds = {
      max: gasEstimates ? gasEstimates.fastest : gasPriceDefaults.max,
      min: gasEstimates ? gasEstimates.safeLow : gasPriceDefaults.min
    };
    if (speed === SliderStates.SLOW) {
      this.props.inputGasPrice(bounds.min.toString());
    } else if (speed === SliderStates.AVERAGE) {
      this.props.inputGasPrice(((bounds.min + bounds.max) / 2).toString());
    } else if (speed === SliderStates.FAST) {
      this.props.inputGasPrice(bounds.max.toString());
    }
  };

  private handleSlider = (gasGwei: number) => {
    this.props.inputGasPrice(gasGwei.toString());
  };

  private getGasPriceGwei(gasPriceValue: Wei) {
    return parseFloat(fromWei(gasPriceValue, 'gwei'));
  }

  private makeGasNotches = (): Marks => {
    const { gasEstimates } = this.props;

    return gasEstimates
      ? {
          // [gasEstimates.safeLow]: '',
          [gasEstimates.standard]: '',
          [gasEstimates.fast]: ''
          // [gasEstimates.fastest]: ''
        }
      : {};
  };

  private formatTooltip = (gas: number) => {
    const { gasEstimates } = this.props;

    if (!(gasEstimates && !gasEstimates.isDefault)) {
      return '';
    }

    const gasTooltips: GasTooltips = {
      [gasEstimates.fast]: translateRaw('TX_FEE_RECOMMENDED_FAST'),
      [gasEstimates.fastest]: translateRaw('TX_FEE_RECOMMENDED_FASTEST'),
      [gasEstimates.safeLow]: translateRaw('TX_FEE_RECOMMENDED_SAFELOW'),
      [gasEstimates.standard]: translateRaw('TX_FEE_RECOMMENDED_STANDARD')
    };

    const recommended = gasTooltips[gas] || '';

    return translateRaw('GAS_GWEI_COST', {
      $gas: gas.toString(),
      $recommended: recommended
    });
  };
}

export default connect(
  (state: AppState): StateProps => ({
    gasEstimates: gasSelectors.getEstimates(state),
    isGasEstimating: gasSelectors.getIsEstimating(state),
    noncePending: transactionNetworkSelectors.nonceRequestPending(state),
    gasLimitPending: transactionNetworkSelectors.getGasEstimationPending(state),
    gasLimitEstimationTimedOut: transactionNetworkSelectors.getGasLimitEstimationTimedOut(state),
    isWeb3Node: configNodesSelectors.getIsWeb3Node(state),
    scheduleGasPrice: scheduleSelectors.getScheduleGasPrice(state)
  }),
  {
    fetchGasEstimates: gasActions.fetchGasEstimates
  }
)(SimpleGas);
