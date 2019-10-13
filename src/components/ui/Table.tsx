import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export default styled.table`
  width: 100%;
  text-align: center;
  border-spacing: 0;
`;

export const Header = styled.thead`
  cursor: default;
`;

export const Body = styled.tbody``;

export const Row = styled.tr`
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
    cursor: pointer;
  }

  &:last-of-type td {
    border: none;
  }
`;

interface CellProps {
  align?: string;
  link?: string;
  children: [Element] | Element | string | number;
}

export const TD = styled.td`
  padding: 0;
  border-bottom: 1px solid #f2f2f2;

  ${({ align }): string => align && `text-align: ${align};`}
`;

const CellTD = styled(TD)`
  &:first-of-type {
    width: 30px;
  }

  &:last-of-type {
    padding-right: 10px;
  }
`;

interface TextProps {
  as: string | Link;
}

const Text = styled.span<TextProps>`
  display: block;
  padding: 15px;
  color: #000;
`;

export const Cell = ({ link, children, ...props }: CellProps) => {
  return (
    <CellTD {...props}>
      <Text as={link ? Link : 'span'} to={link}>
        {children}
      </Text>
    </CellTD>
  );
};

export const Head = styled(TD).attrs(() => ({
  as: 'th',
}))`
  padding: 15px;
  font-weight: 500;
`;
