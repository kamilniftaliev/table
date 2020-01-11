import React from 'react';
import Select from 'react-select';
import styled from 'styled-components';

const SwitchContainer = styled.div`
  display: inline-block;
  width: 100%;
  position: relative;
  margin-bottom: 15px;
`;

const SwitchButtons = styled.ul`
  display: flex;
  text-align: center;
`;

const SwitchTitle = styled.span`
  display: block;
  text-align: center;
  margin-bottom: 5px;
  font-weight: 400;
  font-size: 18px;
`;

interface SwitchButtonProps extends React.LiHTMLAttributes<string> {
  isSelected?: boolean;
}

const SwitchButton = styled.li<SwitchButtonProps>`
  padding: 7px 12px;
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid #d7d7d7;
  color: #202b33;
  cursor: pointer;
  user-select: none;
  flex-basis: 100%;

  &:not(:first-of-type) {
    border-left: none;
  }

  &:first-of-type {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  &:last-of-type {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }

  ${({ isSelected }): string =>
    isSelected &&
    `
    background-color: #0c75ff;
    border-color: #158ed9;
    color: #fff;
  `}
`;

interface Option {
  value: string | number;
  label: string;
}

interface SelectorProps {
  options: Option[];
  useSwitcherForOptionsCount: number;
  placeholder: string;
  [propName: string]: any;
}

function Selector(props: SelectorProps): JSX.Element {
  let { value } = props;
  const { options, useSwitcherForOptionsCount, onChange, placeholder } = props;

  if (options.length <= useSwitcherForOptionsCount) {
    return (
      <SwitchContainer>
        <SwitchTitle>{placeholder}</SwitchTitle>
        <SwitchButtons>
          {options.map(option => (
            <SwitchButton
              key={option.value}
              onClick={(): void => onChange(option)}
              isSelected={option.value === value}
            >
              {option.label}
            </SwitchButton>
          ))}
        </SwitchButtons>
      </SwitchContainer>
    );
  }

  if (Array.isArray(options) && typeof value !== 'object') {
    value = options.find(option => option.value === value);
  }

  return <Select isClearable {...props} value={value} />;
}

export default React.memo(Selector);
