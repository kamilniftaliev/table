import React, { FC } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

import { GRAPH_URL } from '../constants';

const client = new ApolloClient({
  uri: GRAPH_URL,
  request: operation => {
    const token = localStorage.getItem('token');
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });
  },
});

interface Props {
  children: React.ReactChildren;
}

const Component: FC = ({ children }: Props): React.ReactElement => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export const GraphQL = React.memo(Component);

export default GraphQL;
