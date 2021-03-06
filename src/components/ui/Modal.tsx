import React, { useState, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import Button from './Button';

import CloseIcon from '../../images/icons/close.svg';
import { translation, dom } from '../../utils';

const Overlay = styled.div`
  display: flex;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;

  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1;
`;

const Window = styled.form`
  min-width: 200px;
  position: relative;
  padding: 30px 50px;
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

const theme = {
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

const ModalButton = styled(props => <Button {...dom.getTagProps(props)} />)`
  color: ${({ color = 'red' }): string => theme[color].color};
  background-color: ${({ color = 'red' }): string =>
    theme[color].backgroundColor};
  margin-left: 15px;
  border: 1px solid ${({ color = 'red' }): string => theme[color].borderColor};

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
  onClick: (e: React.MouseEvent) => void;
}

interface ModalProps {
  children?: JSX.Element[] | JSX.Element;
  onClose: () => void;
  buttons?: ButtonProps[];
  steps: ((
    nextStep?: ModalProps['onClose'],
    prevStep?: ModalProps['onClose'],
  ) => ReactElement)[];
  className: string;
}

interface ConfirmProps extends ModalProps {
  text: string;
  onConfirm: () => void;
}

export default function Modal({
  children,
  onClose,
  buttons,
  steps: defaultSteps,
  className,
}: ModalProps): ReactElement {
  const [step, setStep] = useState<number>(0);
  function onOverlayClick(e): void {
    if (e.target === e.currentTarget) onClose();
  }

  const steps = defaultSteps?.filter(Boolean);

  const prevStep = (): void => setStep(step - 1);
  const nextStep = (): void => {
    if (steps.length === step + 1) {
      onClose();
    } else {
      setStep(step + 1);
    }
  };

  return createPortal(
    <Overlay onClick={onOverlayClick}>
      <Window className={className}>
        <Close onClick={onClose} />
        {steps ? steps[step](nextStep, prevStep) : children}
        {buttons?.length && (
          <ButtonsContainer>
            {buttons.map(({ text, ...props }) => (
              <ModalButton key={text} {...props}>
                {text}
              </ModalButton>
            ))}
          </ButtonsContainer>
        )}
      </Window>
    </Overlay>,
    document.getElementById('modal'),
  );
}

export function Confirm({
  text,
  onClose,
  onConfirm,
}: ConfirmProps): ReactElement {
  return (
    <Modal
      onClose={onClose}
      buttons={[
        {
          onClick: e => {
            e.preventDefault();
            onConfirm(e);
          },
          text: translation('yes'),
          color: 'red',
          type: 'submit',
          autoFocus: true,
        },
        {
          onClick: onClose,
          text: translation('no'),
          color: 'white',
        },
      ]}
    >
      <ConfirmText>{text}</ConfirmText>
    </Modal>
  );
}
