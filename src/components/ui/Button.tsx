import React from 'react';
import styled from 'styled-components';

const Element = styled.button`
  border-radius: 3px;
  padding: 8px 15px;
  border: none;
  background-color: #0c75ff;
  color: #fff;
  cursor: pointer;
  font-weight: 400;

  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
  }
`;

function Component(props: React.ButtonHTMLAttributes<{}>): React.ReactElement {
  return <Element {...props} />;
}

const Button = React.memo(Component);

export default Button;
