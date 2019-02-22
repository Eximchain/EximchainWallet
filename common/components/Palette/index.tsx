import React from 'react';
import TabSection from 'containers/TabSection/index';
import './index.scss';

const COLORS = [
  [
    'n900',
    'n800',
    'n700',
    'n600',
    'n500',
    'gray',
    'n300',
    'n200',
    'n100',
    'n90',
    'n80',
    'n70',
    'n60',
    'n50',
    'n40',
    'n30',
    'n20',
    'n10',
    'n0'
  ],
  ['b90', 'b80', 'b70', 'b60', 'b50', 'b40', 'b30', 'b20', 'b10', 'b0'],
  ['p70-darker', 'p70-dark', 'p70', 'p70-light', 'p70-lighter'],
  ['g70-darker', 'g70-dark', 'g70', 'g70-light', 'g70-lighter'],
  [
    'brand-warning-darker',
    'brand-warning-dark',
    'brand-warning',
    'brand-warning-light',
    'brand-warning-lighter'
  ],
  ['r70-darker', 'r70-dark', 'r70', 'r70-light', 'r70-lighter'],
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
