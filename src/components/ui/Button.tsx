import React from 'react';
import styled from 'styled-components';

const getButtonColor = ({ color, disabled }): string => {
  if (disabled) return '#a6a6a6';

  switch (color) {
    case 'green':
      return '#30be4f';

    case 'red':
      return '#fe2323';

    case 'gray':
      return '#a6a6a6';

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

  ${({ disabled }): string =>
    !disabled &&
    `
      &:hover {
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
      }
  `}
`;

function Component(props: React.ButtonHTMLAttributes<{}>): React.ReactElement {
  return <Element {...props} />;
}

export const Icon = styled.img.attrs(() => ({
  alt: 'Icon',
}))`
  width: 20px;
  margin-left: 10px;
  opacity: 0.4;
`;

export const Add = styled(Component).attrs(() => ({
  color: 'blue',
}))`
  display: block;
  margin: 100px auto;
`;

const Button = React.memo(Component);

export default Button;
