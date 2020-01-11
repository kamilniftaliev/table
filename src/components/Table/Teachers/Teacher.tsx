import React, { lazy, Suspense, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMutation } from 'react-apollo';

import { translation, text } from '../../../utils';
import { Preloader, Input } from '../../ui';

import graph from '../../../graph';

const Workload = lazy(() =>
  import(/* webpackChunkName: "workload" */ './Workload'),
);
const Workhours = lazy(() =>
  import(/* webpackChunkName: "workhours" */ './Workhours'),
);

const Container = styled.div`
  padding: 20px;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px;
  margin-top: 20px;
`;

interface WorkloadTitle {
  isActive?: string;
}

const WorkloadTitle = styled.span<WorkloadTitleProps>`
  font-size: 22px;
  font-weight: 400;
  margin-right: 15px;
  cursor: pointer;

  ${({ isActive }): string => isActive && 'color: blue;'}
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;

const NameLabel = styled.label`
  margin-bottom: 10px;
  font-weight: 400;
`;

const NameInput = styled(Input)`
  display: block;
  margin: 0 auto;
  width: 300px;
`;

interface Props {
  tableId: string;
  slug: string;
}

let nameUpdateTimeout = null;

function Teacher({
  classes,
  subjects,
  teachers,
  tableId,
  tableSlug,
  id,
}: Props): React.ReactElement {
  const teacher = teachers.find(t => t.id === id);
  const [name, setName] = useName(teacher?.name, id, tableId);

  useEffect(() => {
    document.title = name;
    return (): void => {
      document.title = 'Table.az';
    };
  }, [id, name]);

  if (!teacher) return null;

  return (
    <Container>
      <InfoContainer>
        <NameLabel>{translation('teacherName')}</NameLabel>
        <NameInput value={name} onChange={e => setName(e.target.value)} />
      </InfoContainer>
      <Workload
        teacher={teacher}
        tableId={tableId}
        tableSlug={tableSlug}
        classes={classes}
        subjects={subjects}
      />
      <Workhours
        teacher={teacher}
        tableId={tableId}
        tableSlug={tableSlug}
        classes={classes}
        subjects={subjects}
      />
    </Container>
  );
}

function useName(initialName, teacherId, tableId) {
  const [name, setName] = useState<string>(initialName || '');
  const [updateTeacherRequest] = useMutation(graph.UpdateTeacher);

  function updateName(inputName): void {
    const newName = inputName.trimStart().replace(/\s+/g, ' ');

    const regExp = /^[a-zа-яöüşiİıIğəç0-9\s]*$/gi;

    if (!regExp.test(newName) || newName.length > 30) return;

    const slug = text.generateSlug(newName);
    setName(newName);
    clearTimeout(nameUpdateTimeout);

    nameUpdateTimeout = setTimeout(() => {
      updateTeacherRequest({
        variables: {
          name: newName,
          id: teacherId,
          tableId,
          slug,
        },
      });
    }, 1000);
  }

  return [name, updateName];
}

export default React.memo(Teacher);
