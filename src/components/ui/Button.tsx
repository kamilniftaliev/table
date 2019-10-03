import React from 'react';
import styled from 'styled-components';

const getButtonColor = ({ color }) => {
  switch (color) {
    case 'green':
      return '#30be4f';

    default:
      return '#0c75ff';
  }
};

const Element = styled.button`
  border-radius: 3px;
  padding: 8px 15px;
  border: none;
  background-color: ${getButtonColor};
  color: #fff;
  cursor: pointer;
  font-weight: 400;

  &:hover {
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  }
`;

function Component(props: React.ButtonHTMLAttributes<{}>): React.ReactElement {
  return <Element {...props} />;
}

// const IconButton = styled.button`
//   display: inline-block;
//   border-radius: 3px;
//   padding: 5px;
//   border: none;
//   background-color: rgba(0, 0, 0, 0.1);
//   cursor: pointer;
//   // box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
// `;

export const Icon = styled.img.attrs(() => ({
  alt: 'Icon',
}))`
  width: 24px;
  margin-left: 10px;
  opacity: 0.6;
`;

const Button = React.memo(Component);

export default Button;
