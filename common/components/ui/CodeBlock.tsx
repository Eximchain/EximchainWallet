import React from 'react';

import './CodeBlock.scss';

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const CodeBlock = ({ children, className }: Props) => (
  <pre className={`${className} CodeBlock`}>
    {
      //   <div className="CodeBlock-fade-right"></div>
      // <div className="CodeBlock-fade-bottom"></div>
    }
    <code className="CodeBlock-content">
      <code>{children}</code>
    </code>
  </pre>
);

export default CodeBlock;
