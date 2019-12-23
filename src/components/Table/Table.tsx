import React, { lazy, Suspense } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';
import { NavLink, Route, Switch } from 'react-router-dom';

import graph from '../../graph';
import { translation } from '../../utils';

import { Content, Preloader } from '../ui';

const GeneratedTable = lazy(() =>
  import(/* webpackChunkName: "generated-table" */ './GeneratedTable'),
);
const Teachers = lazy(() =>
  import(/* webpackChunkName: "teachers" */ './Teachers/Teachers'),
);
// import Teachers from './Teachers/Teachers';
const Teacher = lazy(() =>
  import(/* webpackChunkName: "teacher" */ './Teachers/Teacher'),
);
// import Teacher from './Teachers/Teacher';
const Classes = lazy(() =>
  import(/* webpackChunkName: "classes" */ './Classes/Classes'),
);
// import Classes from './Classes/Classes';
const Subjects = lazy(() =>
  import(/* webpackChunkName: "subjects" */ './Subjects/Subjects'),
);
// import Subjects from './Subjects/Subjects';

interface Props {
  match: { params: { slug: string } };
}

const Header = styled.header``;

const Tabs = styled.nav`
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #e5e5e5;
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
`;

function Table({
  match: {
    params: { slug },
  },
}: Props): React.ReactElement {
  const { data, loading } = useQuery(graph.GetTable, { variables: { slug } });

  if (loading) return <Preloader isCentered />;

  const { table } = data;
  table.classes.sort((first, second) => {
    const firstClassNum = parseInt(first.title, 10);
    const secondClassNum = parseInt(second.title, 10);

    return firstClassNum - secondClassNum;
  });
  // table.classes = table.classes.filter(({ title }) => parseInt(title, 10) > 5);
  console.log('INIT table :', table);
  const mainPath = `/cedvel/${slug}`;
  const teachersPath = `${mainPath}/muellimler`;
  const teacherPath = `${teachersPath}/:id`;
  const classesPath = `${mainPath}/sinfler`;
  const subjectsPath = `${mainPath}/fennler`;

  return (
    <Content>
      <Header>
        <Tabs>
          <Tab to={mainPath} exact>
            {translation('table')}
          </Tab>
          <Tab to={teachersPath}>{translation('teachers')}</Tab>
          <Tab to={classesPath}>{translation('classes')}</Tab>
          <Tab to={subjectsPath}>{translation('subjects')}</Tab>
        </Tabs>
      </Header>
      <Container>
        <Suspense fallback={<Preloader isCentered />}>
          <Switch>
            <Route
              path={mainPath}
              exact
              component={() => <GeneratedTable {...table} />}
            />
            <Route
              path={teachersPath}
              exact
              component={() => <Teachers {...table} />}
            />
            <Route
              path={teacherPath}
              exact
              component={({
                match: {
                  params: { id },
                },
              }) => (
                <Teacher
                  tableId={table.id}
                  id={id}
                  tableSlug={slug}
                  teachers={table.teachers}
                  classes={table.classes}
                  subjects={table.subjects}
                />
              )}
            />
            <Route
              path={classesPath}
              exact
              component={() => <Classes {...table} />}
            />
            <Route
              path={subjectsPath}
              exact
              component={() => <Subjects {...table} />}
            />
          </Switch>
        </Suspense>
      </Container>
    </Content>
  );
}

export default React.memo(Table);
