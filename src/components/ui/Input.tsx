import React from 'react';
import styled from 'styled-components';

const Element = styled.input.attrs(() => ({
  type: 'text',
}))`
  border-radius: 3px;
  padding: 8px 15px;
  border: 1px solid #ccc;

  &:focus {
    border-color: #0c75ff;
  }
`;

function Component(props: React.InputHTMLAttributes<{}>): React.ReactElement {
  return <Element {...props} />;
}

const Input = React.memo(Component);

export default Input;
