import React from 'react';
import { Link } from 'react-router-dom';

import './Template.scss';

interface Props {
  hideBack?: boolean;
  children: React.ReactElement<any>;
  onBack?(ev: React.MouseEvent<HTMLAnchorElement>): void;
}

const GenerateWalletTemplate: React.SFC<Props> = ({ children, hideBack, onBack }) => (
  <div className="GenerateWallet Tab-content-pane">
    {children}
    {!hideBack && (
      <Link className="GenerateWallet-back" to="/generate" onClick={onBack}>
        <i className="fa fa-chevron-left" />
      </Link>
    )}
  </div>
);

export default GenerateWalletTemplate;
