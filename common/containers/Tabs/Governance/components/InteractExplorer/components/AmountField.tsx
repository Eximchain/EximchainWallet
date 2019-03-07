import React from 'react';

import { Input } from 'components/ui';
import { AmountFieldFactory } from 'components/AmountFieldFactory';

interface Props {
  readOnly?: boolean;
  value?: any;
}

export const AmountField: React.SFC<Props> = props => (
  <div className="input-group-wrapper InteractExplorer-field">
    <label className="input-group">
      <div className="input-group-header">Value</div>
      <AmountFieldFactory
        withProps={({ currentValue: { raw }, isValid, onChange, readOnly }) => {
          const instrumentedOnChange = (ev: React.FormEvent<HTMLInputElement>) => {
            onChange(ev);
          };
          return (
            <Input
              name="value"
              value={props.value ? props.value : raw}
              isValid={isValid || raw === ''}
              onChange={instrumentedOnChange}
              readOnly={readOnly}
              className="InteractExplorer-field-input"
            />
          );
        }}
      />
    </label>
  </div>
);
