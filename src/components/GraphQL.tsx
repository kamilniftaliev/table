import React, { FC } from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

import { GRAPH_URL } from '../constants';
import { Auth } from '../utils';

const client = new ApolloClient({
  uri: GRAPH_URL,
  request: (operation): void => {
    const token = localStorage.getItem('token');
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });
  },
  onError: ({ graphQLErrors }): void => {
    if (graphQLErrors?.[0].message === 'access_denied') {
      return Auth.logout();
    }

    console.log('graphQLErrors :', graphQLErrors);
  },
});

interface Props {
  children: React.ReactElement;
}

const Component: FC = ({ children }: Props): React.ReactElement => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export const GraphQL = React.memo(Component);

export default GraphQL;
