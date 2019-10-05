import React from 'react';
import styled from 'styled-components';

import Icon from '../../images/icons/spinner.svg';
import { dom } from '../../utils';

import DefaultDomain from './Domain';

interface ContainerProps {
  fullHeight: boolean;
}

const Container = styled(props => <div {...dom.getTagProps(props)} />)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  ${({ fullHeight }: ContainerProps): string => fullHeight && 'height: 85vh;'}
`;

const Domain = styled(DefaultDomain)`
  font-size: 48px;
`;

const Spinner = styled.img.attrs(() => ({
  src: Icon,
  alt: 'Yüklənir...',
}))`
  width: 150px;
  margin-bottom: -50px;
`;

interface Props {
  withoutDomain?: boolean;
  isCentered?: boolean;
}

const Preloader = ({
  withoutDomain,
  isCentered,
}: Props): React.ReactElement => {
  return (
    <Container fullHeight={isCentered}>
      <Spinner />
      {!withoutDomain && <Domain />}
    </Container>
  );
};

export default React.memo(Preloader);
