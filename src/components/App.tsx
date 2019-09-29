import React, { FC, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import styled from 'styled-components';
import { hot } from 'react-hot-loader/root';

import { CSS, ErrorHandler } from './ui';

import { GraphQL } from './GraphQL';

const Auth = lazy(() => import(/* webpackChunkName: "post" */ './Auth/Auth'));
const Tables = lazy(() =>
  import(/* webpackChunkName: "tables" */ './Tables/Tables'),
);

export const Container = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  min-height: 100vh;
`;

const isAuth = !!localStorage.getItem('token');

const App: FC = (): JSX.Element => {
  return (
    <GraphQL>
      <Router>
        <Suspense fallback={<div>YÜKLƏNİR...</div>}>
          <ErrorHandler>
            <Container>
              <Switch>
                <Route path="/" exact component={isAuth ? Tables : Auth} />
              </Switch>
            </Container>
          </ErrorHandler>
        </Suspense>
      </Router>
      <CSS.global />
    </GraphQL>
  );
};

export default React.memo(hot(App));
