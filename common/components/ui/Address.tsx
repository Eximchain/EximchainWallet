import React from 'react';
import { connect } from 'react-redux';

import { IWallet } from 'libs/wallet';
import { BlockExplorerConfig } from 'types/network';
import { AppState } from 'features/reducers';
import { configSelectors } from 'features/config';
import NewTabLink from './NewTabLink';

interface BaseProps {
  explorer?: BlockExplorerConfig | null;
  address?: string | null;
  wallet?: IWallet | null;
  shorten?: boolean;
}

interface StateProps {
  toChecksumAddress: ReturnType<typeof configSelectors.getChecksumAddressFn>;
}

interface State {
  expanded: boolean;
}

type Props = BaseProps & StateProps;

export class Address extends React.PureComponent<Props, State> {
  public state = {
    expanded: false
  };
  private expand = () => {
    if (!this.state.expanded) {
      this.setState({
        expanded: true
      });
    }
  };
  private shorten = () => {
    if (this.state.expanded) {
      this.setState({
        expanded: false
      });
    }
  };
  public render() {
    const { wallet, address, explorer, toChecksumAddress, shorten } = this.props;
    let renderAddress = '';
    if (address !== null && address !== undefined) {
      renderAddress = address;
    } else {
      renderAddress = wallet !== null && wallet !== undefined ? wallet.getAddressString() : '';
    }
    renderAddress = toChecksumAddress(renderAddress);

    if (explorer) {
      return <NewTabLink href={explorer.addressUrl(renderAddress)}>{renderAddress}</NewTabLink>;
    } else {
      if (shorten) {
        return (
          <div onMouseEnter={this.expand} onMouseLeave={this.shorten}>
            {!this.state.expanded ? (
              <React.Fragment>
                {renderAddress.substring(0, 6) +
                  '...' +
                  renderAddress.substring(renderAddress.length - 4, renderAddress.length)}
              </React.Fragment>
            ) : (
              <React.Fragment>{renderAddress}</React.Fragment>
            )}
          </div>
        );
      }

      return <React.Fragment>{renderAddress}</React.Fragment>;
    }
  }
}

export default connect((state: AppState) => ({
  toChecksumAddress: configSelectors.getChecksumAddressFn(state)
}))(Address);
