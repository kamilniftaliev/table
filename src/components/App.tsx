import React, { FC, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import styled from 'styled-components';
import { hot } from 'react-hot-loader/root';

import { CSS, ErrorHandler, Preloader } from './ui';

import { GraphQL } from './GraphQL';

const Header = lazy(() =>
  import(/* webpackChunkName: "header" */ './Header/Header'),
);
const Auth = lazy(() => import(/* webpackChunkName: "auth" */ './Auth/Auth'));
const Tables = lazy(() =>
  import(/* webpackChunkName: "tables" */ './Tables/Tables'),
);
const Table = lazy(() =>
  import(/* webpackChunkName: "table" */ './Table/Table'),
);

export const Container = styled.div`
  padding: 80px 20px 20px 20px;
  min-height: 100vh;
`;

const isAuth = !!localStorage.getItem('token');

const App: FC = (): JSX.Element => {
  return (
    <GraphQL>
      <Router>
        <ErrorHandler>
          <Container>
            <Suspense fallback={<Preloader isCentered />}>
              {isAuth && <Header />}
              <Switch>
                <Route path="/" exact component={isAuth ? Tables : Auth} />
                <Route path="/cedvel/:slug" component={Table} />
              </Switch>
            </Suspense>
          </Container>
        </ErrorHandler>
      </Router>
      <CSS.global />
    </GraphQL>
  );
};

export default React.memo(hot(App));
