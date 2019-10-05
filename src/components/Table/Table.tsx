import React from 'react';
import styled from 'styled-components';

interface Props {
  match: { params: { slug: string } };
}

const Container = styled.main``;

function Table({
  match: {
    params: { slug },
  },
}: Props): React.ReactElement {
  console.log('slug :', slug);
  return <Container>AAAA</Container>;
}

export default React.memo(Table);
