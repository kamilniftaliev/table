/* eslint-disable no-param-reassign */
import React, { lazy, Suspense } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';
import { NavLink, Route, Switch } from 'react-router-dom';

import graph from '../../graph';
import { translation } from '../../utils';

import { Content, Preloader } from '../ui';
import { Table as TableType } from '../../models';

const Timetable = lazy(() =>
  import(/* webpackChunkName: "generated-table" */ './Timetable'),
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

interface OnCompleteProps {
  table: TableType;
}

function Table({
  match: {
    params: { slug },
  },
}: Props): React.ReactElement {
  const { data: subjectsData, loading: loadingSubjects } = useQuery(
    graph.GetSubjects,
  );
  const { data, loading } = useQuery(graph.GetTable, {
    variables: { slug },
    onCompleted: ({ table }: OnCompleteProps) => {
      table.teachers.forEach(teacher => {
        const stats = teacher.workload
          .filter(({ hours }) => hours)
          .reduce(
            ({ subjects, classes }, { hours, subjectId, classId }) => ({
              subjects: {
                ...subjects,
                [subjectId]: (subjects[subjectId] || 0) + hours,
              },
              classes: {
                ...classes,
                [classId]: (classes[classId] || 0) + hours,
              },
            }),
            {
              subjects: [],
              classes: [],
            },
          );

        const workhoursAmount = teacher.workhours
          .flat()
          .reduce((acc, works) => (works ? acc + 1 : acc), 0);

        const subjects = Object.values(stats.subjects);

        teacher.subjects = subjects.length;
        teacher.classes = Object.keys(stats.classes).length;
        teacher.workhoursAmount = workhoursAmount;
        teacher.workloadAmount = subjects.reduce(
          (acc: number, hours: number) => acc + hours,
          0,
        );
      });

      table.classes.forEach(theClass => {
        let teachersCount = 0;
        const classSubjects = Object.values(
          table.teachers.reduce((acc, { id, workload }) => {
            const classWorkload = workload.filter(
              w => w.classId === theClass.id && w.hours,
            );

            if (!classWorkload.length) return acc;

            const subjectHours = classWorkload.reduce((prevHours, w) => {
              const subjectTitle = subjectsData?.subjects.find(
                s => s.id === w.subjectId,
              )?.title.ru;

              return {
                ...prevHours,
                [subjectTitle]: w.hours,
              };
            }, {});

            teachersCount += 1;

            return {
              ...acc,
              ...subjectHours,
            };
          }, {}),
        );

        theClass.teachers = teachersCount;
        theClass.subjects = classSubjects.length;
        theClass.lessons = classSubjects.reduce(
          (acc: number, hours: number) => acc + hours,
          0,
        );
      });
    },
  });

  if (loading || loadingSubjects) return <Preloader isCentered />;

  const { table } = data;
  table.shifts = 2;
  table.classes.sort((first, second) => {
    const numbers = first.number - second.number;

    if (numbers !== 0) return numbers;

    // Index in az letters
    return first.letter - second.letter;
  });
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
        </Tabs>
      </Header>
      <Container>
        <Suspense fallback={<Preloader isCentered />}>
          <Switch>
            <Route
              path={mainPath}
              exact
              component={() => <Timetable table={table} />}
            />
            <Route
              path={teachersPath}
              exact
              component={() => (
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
              component={() => (
                <Classes
                  tableId={table.id}
                  slug={slug}
                  classes={table.classes}
                />
              )}
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
