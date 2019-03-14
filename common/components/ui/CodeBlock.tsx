import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import translate from 'translations';
import './CodeBlock.scss';

interface Props {
  children?: React.ReactNode;
  className?: string;
  text?: string;
}

const CodeBlock = ({ children, className, text }: Props) => (
  <pre className={`${className} CodeBlock`}>
    {text && (
      <CopyToClipboard text={text}>
        <button className={className + 'input-group-header'}>
          {translate('COPY_TO_CLIPBOARD')}
        </button>
      </CopyToClipboard>
    )}
    <code>{children}</code>
  </pre>
);

export default CodeBlock;
