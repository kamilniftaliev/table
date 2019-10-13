import React from 'react';
import styled from 'styled-components';

import Icon from '../../images/icons/spinner.svg';

import DefaultDomain from './Domain';

interface ContainerProps {
  isCentered: boolean;
}

const Container = styled.div<ContainerProps>`
  ${({ isCentered }): string =>
    isCentered &&
    `
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 300px;
    height: 300px;
  `}
`;

const Domain = styled(DefaultDomain)`
  font-size: 48px;
`;

const Spinner = styled.img.attrs(() => ({
  src: Icon,
  alt: 'Yüklənir...',
}))`
  width: 50%;
  margin-bottom: -50px;
`;

interface Props {
  withDomain?: boolean;
  isCentered?: boolean;
}

const Preloader = ({ withDomain, isCentered }: Props): React.ReactElement => {
  return (
    <Container isCentered={isCentered}>
      <Spinner />
      {withDomain && <Domain />}
    </Container>
  );
};

export default React.memo(Preloader);
