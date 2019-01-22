import React from 'react';

import './OfflineTab.scss';

const OfflineTab: React.SFC<{}> = () => (
  <section className="OfflineTab Tab-content swap-tab">
    <div className="Tab-content-pane">
      <div className="OfflineTab-icon fa-stack fa-4x">
        <i className="fa fa-wifi fa-stack-1x" />
        <i className="fa fa-ban fa-stack-2x" />
      </div>
      <br />
      <br />
      <br />
      <p className="OfflineTab-message">This feature is unavailable while offline</p>
    </div>
  </section>
);

export default OfflineTab;
