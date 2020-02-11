import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export default styled.table`
  width: 100%;
  text-align: center;
  border-spacing: 0;
  border-collapse: collapse;
  position: relative;
  z-index: 0;
  margin-left: auto;
  margin-right: auto;
`;

export const Header = styled.thead`
  cursor: default;
`;

export const Body = styled.tbody``;

interface TdProps {
  highlightColumn?: boolean;
}

export const TD = styled.td<TdProps>`
  padding: 0;
  border-bottom: 1px solid #f2f2f2;

  ${({ align }): string => align && `text-align: ${align};`}

  ${({ highlightColumn }): string =>
    highlightColumn &&
    `
    position: relative;

    :hover::after {
      background-color: rgba(0, 0, 0, 0.06);
      content: '';
      height: 500vh;
      left: 0;
      position: absolute;
      top: -200vh;
      width: 100%;
      z-index: -1;
    }
  `}
`;

export const Row = styled.tr`
  &:hover {
    background-color: rgba(0, 0, 0, 0.07);
  }

  &:last-of-type ${TD} {
    border-bottom: none;
  }
`;

interface CellProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTableDataCellElement>,
    HTMLTableDataCellElement
  > {
  align?: string;
  link?: string;
  children: React.ReactElement[] | string | number;
}

export const CellTD = styled(TD)`
  ${({ onClick }): string =>
    onClick &&
    `
    cursor: pointer;
  `}

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

export const Cell = ({
  link,
  children,
  ...props
}: CellProps): React.ReactElement => {
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
