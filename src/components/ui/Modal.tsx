import React from 'react';
import styled from 'styled-components';

import { Button } from '../ui';

import CloseIcon from '../../images/icons/close.svg';
import { translation } from '../../utils';

const Overlay = styled.div`
  display: flex;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

  background-color: rgba(0, 0, 0, 0.6);
`;

const Window = styled.form`
  position: relative;
  padding: 20px 30px;
  border-radius: 3px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  background-color: #fff;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 10px;
`;

const buttons = {
  white: {
    color: '#555',
    backgroundColor: '#fff',
    borderColor: '#ababab',
  },
  red: {
    color: '#fff',
    backgroundColor: '#ff1212',
    borderColor: '#c10d0d',
  },
  green: {
    color: '#fff',
    backgroundColor: '#30be4f',
    borderColor: '#0a8d27',
  },
};

const ModalButton = styled(({ color, ...rest }) => <Button.default {...rest} />)`
  color: ${({ color = 'red' }) => buttons[color].color};
  background-color: ${({ color = 'red' }) => buttons[color].backgroundColor};
  margin-left: 15px;
  border: 1px solid ${({ color = 'red' }) => buttons[color].borderColor};

  font-weight: 500;
  min-width: 100px;

  &:hover {
    box-shadow: none;
  }
`;

const Close = styled.img.attrs(() => ({
  alt: 'Close',
  src: CloseIcon,
}))`
  display: block;
  position: absolute;
  right: 20px;
  top: 20px;
  width: 12px;
  opacity: 0.5;
  cursor: pointer;
`;

const ConfirmText = styled.p`
  font-size: 20px;
  font-weight: 400;
`;

interface ButtonProps {
  color?: string;
  type?: string;
  text: string;
  onClick: () => {};
}

interface ModalProps {
  children?: JSX.Element[] | JSX.Element;
  onClose: () => {};
  buttons?: ButtonProps[];
}

interface ConfirmProps extends ModalProps {
  text: string;
  onConfirm: () => {}
}

export default function Modal({
  children,
  onClose,
  buttons,
}: ModalProps) {
  function onOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <Overlay onClick={onOverlayClick}>
      <Window>
        <Close onClick={onClose} />
        {children}
        {buttons?.length && (
          <ButtonsContainer>
            {buttons.map(({ onClick, text, color, ...props }, index) => (
              <ModalButton
                key={`${index}`}
                color={color}
                onClick={onClick}
                {...props}
              >
                {text}
              </ModalButton>
            ))}
          </ButtonsContainer>
        )}
      </Window>
    </Overlay>
  );
}

export function Confirm({ text, onClose, onConfirm }: ConfirmProps) {
  return (
    <Modal
      onClose={onClose}
      buttons={[
        {
          onClick: onConfirm,
          text: translation('yes'),
          color: 'red',
          type: 'submit',
          autoFocus: true,
        },
        {
          onClick: onClose,
          text: translation('no'),
          color: 'white',
        }
      ]}
    >
      <ConfirmText>{text}</ConfirmText>
    </Modal>
  );
}
