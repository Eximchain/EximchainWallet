import React from 'react';

import { Input } from 'components/ui';
import { AmountFieldFactory } from 'components/AmountFieldFactory';

interface Props {
  readOnly: boolean;
  setValue?: any;
}

export const AmountField: React.SFC<Props> = props => (
  <div className="input-group-wrapper InteractExplorer-field">
    <label className="input-group">
      <div className="input-group-header">Value</div>
      <AmountFieldFactory
        withProps={({ currentValue: { raw }, isValid, onChange, readOnly }) => (
          <Input
            name="value"
            value={props.setValue ? props.setValue : raw}
            isValid={isValid || raw === ''}
            onChange={onChange}
            readOnly={props.readOnly}
            className="InteractExplorer-field-input"
          />
        )}
      />
    </label>
  </div>
);
