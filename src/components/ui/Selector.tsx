import React from 'react';
import Select from 'react-select';

interface SelectorProps {
  [propName: string]: any;
}

function Selector(props: SelectorProps): JSX.Element {
  return <Select {...props} isClearable />;
}

export default React.memo(Selector);
