import React from 'react';
import OfflineIcon from 'assets/images/offline.svg';

import './OfflineTab.scss';

const OfflineTab: React.SFC<{}> = () => (
  <section className="OfflineTab Tab-content swap-tab">
    <div className="Tab-content-pane">
      <img src={OfflineIcon} />

      {
        // <div className="OfflineTab-icon fa-stack fa-8x">
        // <i className="fa fa-wifi fa-stack-1x" />
        // <i className="fa fa-ban fa-stack-2x" />
        // </div>
      }

      <br />
      <br />
      <br />
      <p className="OfflineTab-message">This feature is unavailable while offline</p>
    </div>
  </section>
);

export default OfflineTab;
