import React, { FC, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import styled from 'styled-components';

import { GRAPH_URL } from '../constants';

import { CSS, ErrorHandler } from './ui';

const Auth = lazy(() => import(/* webpackChunkName: "post" */ './Auth/Auth'));

const client = new ApolloClient({
  uri: GRAPH_URL,
});

export const Container = styled.main`
  padding: 15px;
  min-height: calc(100vh - 170px);
`;

const App: FC = (): JSX.Element => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Suspense fallback={<div>YÜKLƏNİR...</div>}>
          <ErrorHandler>
            <Container>
              <Switch>
                <Route path="/" exact component={Auth} />
              </Switch>
            </Container>
          </ErrorHandler>
        </Suspense>
      </Router>
      <CSS.global />
    </ApolloProvider>
  );
};

const MemoApp = React.memo(App);

export { MemoApp as App };

export default MemoApp;
