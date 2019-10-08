import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';

import graph from '../../graph';

interface Props {
  match: { params: { slug: string } };
}

const Container = styled.main``;

function Table({
  match: {
    params: { slug },
  },
}: Props): React.ReactElement {
  const { data, loading } = useQuery(graph.GetTable, { variables: { slug } });

  if (loading) return <>Loading...</>;

  const { table } = data;

  console.log('table :', table);

  return <Container>AAAA</Container>;
}

export default React.memo(Table);
