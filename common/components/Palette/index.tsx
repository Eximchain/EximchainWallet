import React from 'react';
import TabSection from 'containers/TabSection/index';
import './index.scss';

const COLORS = [
  ['gray-base', 'gray-darker', 'gray-dark', 'gray', 'n60', 'n20', 'n10'],
  ['b60-darker', 'b60-dark', 'b60', 'b60-light', 'b60-lighter'],
  ['p70-darker', 'p70-dark', 'p70', 'p70-light', 'p70-lighter'],
  ['g70-darker', 'g70-dark', 'g70', 'g70-light', 'g70-lighter'],
  [
    'brand-warning-darker',
    'brand-warning-dark',
    'brand-warning',
    'brand-warning-light',
    'brand-warning-lighter'
  ],
  [
    'brand-danger-darker',
    'brand-danger-dark',
    'brand-danger',
    'brand-danger-light',
    'brand-danger-lighter'
  ],
  ['text-color', 'text-inverted-color', 'link-color', 'link-hover-color'],
  ['control-bg', 'control-color', 'control-border']
];

const Palette: React.SFC = () => (
  <TabSection>
    <section className="Tab-content">
      <div className="Tab-content-pane Palette">
        {COLORS.map(colors => (
          <div className="Palette-group" key={colors[0]}>
            {colors.map(c => (
              <div className="Palette-group-color" key={c}>
                <div className={`Palette-group-color-blob color--${c}`} />
                <div className="Palette-group-color-name">{c}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  </TabSection>
);

export default Palette;
