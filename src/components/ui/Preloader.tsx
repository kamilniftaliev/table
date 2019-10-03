import React from 'react';
import styled from 'styled-components';

import Icon from '../../images/icons/spinner.svg';

import DefaultDomain from './Domain';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
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
}

const Preloader = ({ withoutDomain }: Props) => {
  return (
    <Container>
      <Spinner />
      {!withoutDomain && <Domain />}
    </Container>
  );
};

export default React.memo(Preloader);
