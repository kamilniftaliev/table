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

export const ContentContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f9fa;

  @media print {
    padding: 0;
    background-color: #fff;
  }
`;

const isAuth = !!localStorage.getItem('token');

const App: FC = (): JSX.Element => {
  return (
    <GraphQL>
      <Router>
        <ErrorHandler>
          <div>
            <Suspense fallback={<Preloader withDomain isCentered />}>
              {isAuth && <Header />}
              <ContentContainer>
                <Switch>
                  <Route path="/" exact component={isAuth ? Tables : Auth} />
                  <Route path="/cedvel/:slug" component={Table} />
                </Switch>
              </ContentContainer>
            </Suspense>
          </div>
        </ErrorHandler>
      </Router>
      <CSS.global />
    </GraphQL>
  );
};

export default React.memo(hot(App));
