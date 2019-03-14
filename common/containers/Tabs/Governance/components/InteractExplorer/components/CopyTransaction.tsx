import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { translateRaw } from 'translations';

interface State {
  copied: boolean;
}
interface Props {
  text: string;
}
export class CopyTransaction extends React.Component<Props, State> {
  public state = {
    copied: false
  };
  private goingToClearCopied: number | null = null;
  public handleCopy = () =>
    this.setState(
      (prevState: State) => ({
        copied: !prevState.copied
      }),
      this.clearCopied
    );
  private clearCopied = () =>
    (this.goingToClearCopied = window.setTimeout(() => this.setState({ copied: false }), 2000));

  public render() {
    const { text } = this.props;
    const { copied } = this.state;
    return (
      <React.Fragment>
        <CopyToClipboard onCopy={this.handleCopy} text={text}>
          <div
            className={`AccountInfo-copy ${copied ? 'is-copied' : ''}`}
            title={translateRaw('COPY_TO_CLIPBOARD')}
          >
            <i className="fa fa-clone" />
            <span>{translateRaw(copied ? 'COPIED' : '')}</span>
          </div>
        </CopyToClipboard>
      </React.Fragment>
    );
  }
}
