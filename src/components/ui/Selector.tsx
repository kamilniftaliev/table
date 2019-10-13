import React from 'react';
import styled from 'styled-components';
import Select from 'react-select';

interface SelectorProps {
  value: any;
}

// const Select = styled.select``;

function Selector(props: SelectorProps) {
  return <Select {...props} isClearable />;
}

export default React.memo(Selector);
