import React from 'react';
import Select from 'react-select';

interface SelectorProps {
  [propName: string]: any;
}

function Selector(props: SelectorProps): JSX.Element {
  let { value } = props;

  if (Array.isArray(props.options) && typeof value !== 'object') {
    value = props.options.find(option => option.value === value);
  }

  return <Select isClearable {...props} value={value} />;
}

export default React.memo(Selector);
