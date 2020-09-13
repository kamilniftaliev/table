/* eslint-disable no-param-reassign */
import React, { lazy, Suspense } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';
import { NavLink, Route, Switch } from 'react-router-dom';

import graph from '../../graph';
import { translation, setTableStats } from '../../utils';

import { Content, Preloader } from '../ui';
import { Table as TableType } from '../../models';

const Timetable = lazy(() =>
  import(/* webpackChunkName: "generated-table" */ './Timetable'),
);
const Teachers = lazy(() =>
  import(/* webpackChunkName: "teachers" */ './Teachers/Teachers'),
);
const Teacher = lazy(() =>
  import(/* webpackChunkName: "teacher" */ './Teachers/Teacher'),
);
const Classes = lazy(() =>
  import(/* webpackChunkName: "classes" */ './Classes/Classes'),
);

interface Props {
  match: { params: { slug: string } };
}

const Header = styled.header``;

const Tabs = styled.nav`
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #e5e5e5;

  @media print {
    display: none;
  }
`;

const tabHeight = 2;

const Tab = styled(NavLink)`
  position: relative;
  padding: 15px;
  color: #2a3646;
  font-weight: 500;
  font-size: 18px;

  &.active {
    color: #0b75d7;

    &:before {
      display: block;
      width: 100%;
      content: '';
      height: ${tabHeight}px;
      border-radius: ${tabHeight / 2}px;
      position: absolute;
      bottom: -${tabHeight / 2}px;
      left: 0;
      background-color: #0b75d7;
    }
  }
`;

const Container = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  @media print {
    justify-content: flex-start;
    align-items: flex-start;
  }
`;

function Table({
  match: {
    params: { slug },
  },
}: Props): React.ReactElement {
  const { data: subjectsData, loading: loadingSubjects } = useQuery(
    graph.GetSubjects,
  );
  const { data, loading, updateQuery } = useQuery(graph.GetTable, {
    variables: { slug },
    onCompleted: () =>
      updateQuery(response => ({
        table: setTableStats(response.table, subjectsData?.subjects),
      })),
  });

  if (loading || loadingSubjects) return <Preloader isCentered />;

  const { table } = data;

  table.shifts = 2;
  console.log('INIT table :', table);
  const mainPath = `/cedvel/${slug}`;
  const teachersPath = `${mainPath}/muellimler`;
  const teacherPath = `${teachersPath}/:id`;
  const classesPath = `${mainPath}/sinfler`;

  return (
    <Content>
      <Header>
        <Tabs>
          <Tab to={mainPath} exact>
            {translation('table')}
          </Tab>
          <Tab to={teachersPath}>{translation('teachers')}</Tab>
          <Tab to={classesPath}>{translation('classes')}</Tab>
        </Tabs>
      </Header>
      <Container>
        <Suspense fallback={<Preloader isCentered />}>
          <Switch>
            <Route
              path={mainPath}
              exact
              component={(): React.ReactElement => <Timetable table={table} />}
            />
            <Route
              path={teachersPath}
              exact
              component={(): React.ReactElement => (
                <Teachers slug={slug} id={table.id} teachers={table.teachers} />
              )}
            />
            <Route
              path={teacherPath}
              exact
              component={({
                match: {
                  params: { id },
                },
              }): React.ReactElement => <Teacher id={id} tableSlug={slug} />}
            />
            <Route
              path={classesPath}
              exact
              component={(): React.ReactElement => (
                <Classes
                  tableId={table.id}
                  slug={slug}
                  classes={table.classes}
                />
              )}
            />
          </Switch>
        </Suspense>
      </Container>
    </Content>
  );
}

export default React.memo(Table);
