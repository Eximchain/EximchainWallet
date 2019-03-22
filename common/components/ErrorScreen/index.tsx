import React from 'react';

import { NewTabLink } from 'components/ui';
import './index.scss';

const SUBJECT = 'Error!';
const DESCRIPTION =
  'I encountered an error while using Eximchain Wallet. Here are the steps to re-create the issue:\n\nThe full error message:';

interface Props {
  error: Error;
}

const ErrorScreen: React.SFC<Props> = ({ error }) => {
  return (
    <div className="ErrorScreen">
      <div className="ErrorScreen-content">
        <h2>Oops!</h2>
        <p>Something went wrong, so we're showing you this error page.</p>
        <p>
          Please contact{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`mailto:support@eximchain.com?Subject=${SUBJECT}&body=${DESCRIPTION}`}
          >
            support@eximchain.com
          </a>{' '}
          if a refresh doesn't fix it (or click it anyway to open a ticket). You can also submit an
          issue on our{' '}
          <NewTabLink href="https://github.com/Eximchain/EximchainWallet/issues">
            GitHub Repository
          </NewTabLink>. Please attach the following error to help our team solve your issue:
        </p>
        <code>{error.message}</code>
        <h6>
          <i className="fa fa-warning" />
          &nbsp; Please make sure the error message does not include any sensitive information
          before sending it to us. We don't want your private keys!
        </h6>
      </div>
    </div>
  );
};

export default ErrorScreen;
