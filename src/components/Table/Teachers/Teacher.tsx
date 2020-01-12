import React, { lazy, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';

import { translation, text } from '../../../utils';
import {
  Class,
  Teacher as TeacherType,
  Table as TableType,
  Subject,
} from '../../../models';
import { Input } from '../../ui';

import graph from '../../../graph';

const Workload = lazy(() =>
  import(/* webpackChunkName: "workload" */ './Workload'),
);
const Workhours = lazy(() =>
  import(/* webpackChunkName: "workhours" */ './Workhours'),
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
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
  font-size: 22px;
`;

const NameInput = styled(Input)`
  display: block;
  margin: 0 auto 20px;
  width: 300px;
`;

interface Props {
  tableSlug: TableType['slug'];
  id: TableType['id'];
}

let nameUpdateTimeout = null;

function Teacher({ tableSlug, id }: Props): React.ReactElement {
  const { data, loading } = useQuery(graph.GetTable, {
    variables: { slug: tableSlug },
  });
  const teacher = data?.table.teachers.find(t => t.id === id);
  const [name, setName] = useName(teacher?.name, id, data?.table.id);

  useEffect(() => {
    document.title = name;
    return (): void => {
      document.title = 'Table.az';
    };
  }, [id, name]);

  if (!teacher || loading) return null;

  return (
    <Container>
      <InfoContainer>
        <NameLabel>{translation('teacherName')}</NameLabel>
        <NameInput value={name} onChange={e => setName(e.target.value)} />
      </InfoContainer>
      <Workload tableSlug={tableSlug} teacherId={id} />
      <Workhours tableSlug={tableSlug} teacherId={id} />
    </Container>
  );
}

function useName(
  initialName: TeacherType['name'],
  teacherId: TeacherType['id'],
  tableId: TableType['id'],
): [string, (inputName: string) => void] {
  const [name, setName] = useState<string>(initialName || '');
  const [updateTeacherRequest] = useMutation(graph.UpdateTeacher);

  function updateName(inputName: string): void {
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
