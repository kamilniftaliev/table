import React from 'react';
import styled from 'styled-components';

import TickIcon from '../../images/icons/tick.svg';

const Wrapper = styled.label`
  cursor: pointer;
`;

const Container = styled.span`
  display: inline-flex;
  align-items: center;
`;

interface TickProps {
  checked: boolean;
}

const Tick = styled.span<TickProps>`
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid;
  border-color: ${({ checked }): string => (checked ? '#1f73b7' : '#ccc')};
  background-color: ${({ checked }): string => (checked ? '#1f73b7' : '#fff')};
  background-image: url(${({ checked }): string => (checked ? TickIcon : '')});
  background-size: 77%;
  background-repeat: no-repeat;
  background-position: center;
`;

const Text = styled.span`
  padding-left: 10px;
`;

interface Props {
  label?: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
}

function Component({
  label,
  checked,
  onChange,
  ...props
}: Props): React.ReactElement {
  return (
    <Wrapper {...props}>
      <Container>
        <input
          onChange={(e): void => onChange && onChange(!!e.target.checked)}
          type="checkbox"
          checked={checked}
          hidden
        />
        <Tick checked={checked} />
        {label && <Text>{label}</Text>}
      </Container>
    </Wrapper>
  );
}

export default React.memo(Component);
