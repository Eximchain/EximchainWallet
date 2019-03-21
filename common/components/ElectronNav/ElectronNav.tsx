import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import translate, { translateRaw } from 'translations';
import { navigationLinks } from 'config';
import { NodeConfig } from 'types/node';

import NavigationLink from 'components/NavigationLink';
import NetworkSelect from './NetworkSelect';
import LanguageSelect from './LanguageSelect';
import NetworkStatus from './NetworkStatus';
import { configMetaActions, configMetaSelectors, configNodesSelectors } from 'features/config';
import { AppState } from 'features/reducers';
import './ElectronNav.scss';

interface StateProps {
  theme: ReturnType<typeof configMetaSelectors.getTheme>;
  node: NodeConfig;
}

interface ActionProps {
  changeTheme: typeof configMetaActions.changeTheme;
}

type Props = StateProps & ActionProps;

interface State {
  panelContent: React.ReactElement<any> | null;
  isPanelOpen: boolean;
}

class ElectronNav extends React.Component<Props, State> {
  public state: State = {
    panelContent: null,
    isPanelOpen: false
  };

  public render() {
    const { node } = this.props;
    const { panelContent, isPanelOpen } = this.state;

    return (
      <div
        className={classnames({
          ElectronNav: true,
          'is-panel-open': isPanelOpen
        })}
      >
        <div className="ElectronNav-branding" />
        <button className="ElectronNav-status ElectronNav-controls-btn" onClick={this.toggleSelect}>
          <NetworkStatus />

          <i className="ElectronNav-controls-btn-icon fa fa-caret-down" />
        </button>
        <div>{translateRaw(node.isCustom ? node.name : node.service)}</div>
        <ul className="ElectronNav-links">
          {navigationLinks.map(link => (
            <NavigationLink
              key={link.to}
              link={link}
              isHomepage={link === navigationLinks[0]}
              className="ElectronNavLink"
              isNotEnabled={false}
            />
          ))}
        </ul>
        {/* <div className="ElectronNav-controls">
          <button className="ElectronNav-controls-btn" onClick={this.openLanguageSelect}>
            Change Language
            <i className="ElectronNav-controls-btn-icon fa fa-chevron-right" />
          </button>
        </div> */}

        <div className="ElectronNav-panel">
          <div className="ElectronNav-panel-content">{panelContent}</div>
        </div>
      </div>
    );
  }

  // private openLanguageSelect = () => {
  //   const panelContent = <LanguageSelect closePanel={this.closePanel} />;
  //   this.setState({
  //     panelContent,
  //     isPanelOpen: true
  //   });
  // };
  private toggleSelect = () => {
    const { panelContent } = this.state;
    if (this.state.isPanelOpen) {
      this.setState({ isPanelOpen: false });

      if (this.state.panelContent === panelContent) {
        this.setState({ panelContent: null });
      }
    } else {
      const panelContent = <NetworkSelect closePanel={this.closePanel} />;
      this.setState({
        panelContent,
        isPanelOpen: true
      });
    }
  };

  private openNodeSelect = () => {
    const panelContent = <NetworkSelect closePanel={this.closePanel} />;
    this.setState({
      panelContent,
      isPanelOpen: true
    });
  };

  private closePanel = () => {
    const { panelContent } = this.state;

    // Start closing panel
    this.setState({ isPanelOpen: false });

    // Remove content when out of sight
    setTimeout(() => {
      if (this.state.panelContent === panelContent) {
        this.setState({ panelContent: null });
      }
    }, 300);
  };
}

export default connect(
  (state: AppState) => ({
    theme: configMetaSelectors.getTheme(state),
    node: configNodesSelectors.getNodeConfig(state)
  }),
  {
    changeTheme: configMetaActions.changeTheme
  }
)(ElectronNav);
