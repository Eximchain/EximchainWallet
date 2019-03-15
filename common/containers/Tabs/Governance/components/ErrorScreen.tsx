import React from 'react';
import './ErrorScreen.scss';
import errorIllustration from 'assets/images/generic-error.svg';

interface Props {
  backToGovernance: () => void;
}

interface State {}

class ResultScreen extends React.Component<Props, State> {
  render() {
    return (
      <div className="ErrorScreenFlexContainer">
        <div style={{ flex: 1 }} />
        <div style={{ flex: 2, alignSelf: 'center' }}>
          <div className="ErrorScreenBody">
            <img
              src={errorIllustration}
              style={{ flexBasis: '256px', minWidth: '160px', maxWidth: '256px' }}
            />
            <h2 className="resultContent-header">Whoops, something went wrong</h2>
            <p>Something shortcircuited on our end. Sorry about that.</p>
            <br />
            <a
              className="errorScreenBtnLink btn btn-primary errorScreenBtnLink-back"
              onClick={this.props.backToGovernance}
            >
              Back to Governance
            </a>
          </div>
        </div>
        <div style={{ flex: 1 }} />
      </div>
    );
  }
}

export default ResultScreen;
