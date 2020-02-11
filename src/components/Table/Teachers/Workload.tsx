import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQuery } from 'react-apollo';

import { Table, Selector, Button, Modal } from '../../ui';

import {
  Table as TableType,
  Teacher,
  Workload as WorkloadModel,
} from '../../../models';

import { translation, setTableStats } from '../../../utils';
import graph from '../../../graph';

const Container = styled.div``;

const TableContainer = styled(Table.default)`
  width: auto;
  z-index: 1;
`;

const TableCell = styled(Table.TD)`
  padding: 5px;
  border: none;
`;

const SubjectTitleCell = styled(TableCell).attrs(() => ({
  align: 'left',
}))`
  width: 150px;
  padding-left: 10px;
`;

const Title = styled.p`
  font-size: 20px;
  font-weight: 400;
  margin-top: 0;
  text-align: center;
`;

const AddWorkloadModal = styled(Modal.default)`
  width: 300px;
  padding: 50px 70px;
`;

const AddWorkloadButton = styled(Button.Add)`
  margin: 20px auto;
`;

export const SectionTitle = styled.p`
  text-align: center;
  font-size: 22px;
  font-weight: 400;
`;

const AddSubjectWorkloadButton = styled(Button.Add)`
  margin: 0;
  font-size: 22px;
  padding: 0px 10px;
`;

export interface Props {
  tableSlug: TableType['slug'];
  teacherId: Teacher['id'];
}

function Workload({ tableSlug, teacherId }: Props): React.ReactElement {
  const { data: tableData, loading: loadingTable } = useQuery(graph.GetTable, {
    variables: { slug: tableSlug },
  });
  const teacher = tableData.table.teachers.find(t => t.id === teacherId);

  const [newWorkload, setNewWorkload] = useState<WorkloadModel>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { data: subjectsData, loading: loadingSubjects } = useQuery(
    graph.GetSubjects,
  );
  const [workload, updateWorkload] = useWorkload(
    teacher.workload,
    tableSlug,
    teacher.id,
  );

  const teacherClasses = useMemo(
    () =>
      tableData.table.classes.filter(c =>
        teacher.workload.find(w => c.id === w.classId && w.hours),
      ),
    [],
  );

  const teacherSubjects = useMemo(
    () =>
      subjectsData.subjects.filter(s =>
        teacher.workload.find(w => s.id === w.subjectId && w.hours),
      ),
    [],
  );

  if (loadingTable || loadingSubjects) return null;

  return (
    <Container>
      {!!teacherClasses.length && (
        <>
          <SectionTitle>{translation('workloadTitle')}</SectionTitle>
          <TableContainer>
            <Table.Header>
              <Table.Row>
                <Table.Head>{translation('classes')}</Table.Head>
                {teacherClasses.map(({ id, number, letter }) => (
                  <Table.Head key={id}>
                    {number}
                    {letter}
                  </Table.Head>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {teacherSubjects.map(({ id: subjectId, title }) => (
                <Table.Row key={subjectId}>
                  <SubjectTitleCell align="left">{title.ru}</SubjectTitleCell>
                  {teacherClasses.map(({ id: classId }) => {
                    const defaultHours = workload[subjectId]
                      ? workload[subjectId][classId]
                      : 0;
                    return (
                      <TableCell key={classId}>
                        <Selector
                          styles={hourSelectorStyles}
                          options={hoursOptions}
                          placeholder=""
                          onChange={(hours: number): void =>
                            updateWorkload({
                              variables: {
                                tableId: tableData.table.id,
                                teacherId: teacher.id,
                                subjectId,
                                classId,
                                hours,
                              },
                            })
                          }
                          value={defaultHours || ''}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell
                    onClick={() => {
                      setShowModal(true);
                      setNewWorkload({ subjectId });
                    }}
                  >
                    <AddSubjectWorkloadButton>+</AddSubjectWorkloadButton>
                  </TableCell>
                </Table.Row>
              ))}
            </Table.Body>
          </TableContainer>
        </>
      )}
      <AddWorkloadButton onClick={(): void => setShowModal(true)}>
        {translation('addNewWorkload')}
      </AddWorkloadButton>
      {showModal && (
        <AddWorkloadModal
          onClose={(): void => {
            setShowModal(false);
            setNewWorkload(null);
          }}
          steps={[
            (nextStep): React.ReactElement => {
              if (newWorkload?.subjectId) {
                nextStep();
                return null;
              }

              return (
                <>
                  <Title>{translation('selectSubject')}</Title>
                  <Selector
                    key="0"
                    placeholder={translation('selectSubject')}
                    options={subjectsData.subjects.map(s => ({
                      value: s.id,
                      label: s.title.ru,
                    }))}
                    onChange={(subjectId): void => {
                      setNewWorkload({
                        ...newWorkload,
                        subjectId,
                      });
                      nextStep();
                    }}
                  />
                </>
              );
            },
            (nextStep): React.ReactElement => (
              <>
                <Title>{translation('selectClass')}</Title>
                <Selector
                  key="1"
                  placeholder={translation('selectClass')}
                  options={tableData.table.classes.map(c => ({
                    value: c.id,
                    label: `${c.number}${c.letter}`,
                  }))}
                  onChange={(classId): void => {
                    setNewWorkload({
                      ...newWorkload,
                      classId,
                    });
                    nextStep();
                  }}
                />
              </>
            ),
            (nextStep): React.ReactElement => (
              <>
                <Title>{translation('selectHours')}</Title>
                <Selector
                  key="2"
                  placeholder={translation('selectHours')}
                  options={hoursOptions
                    .slice(1)
                    .map(h => ({ ...h, label: translation('hour', h.value) }))}
                  onChange={(hours): void => {
                    setNewWorkload(null);
                    updateWorkload({
                      variables: {
                        ...newWorkload,
                        tableId: tableData.table.id,
                        teacherId: teacher.id,
                        hours,
                      },
                    });
                    nextStep();
                  }}
                />
              </>
            ),
          ]}
        />
      )}
    </Container>
  );
}

const hoursOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => ({
  value: num,
  label: num,
}));

const hourSelectorStyles = {
  dropdownIndicator: (): object => ({ display: 'none' }),
  clearIndicator: (): object => ({ display: 'none' }),
  indicatorSeparator: (): object => ({ display: 'none' }),
  input: (): object => ({
    position: 'absolute',
    top: 0,
    left: 0,
    color: 'transparent',
  }),
  valueContainer: (): object => ({ width: 50, zIndex: 999999999999 }),
  container: (provided: object): object => ({
    ...provided,
    width: 50,
    margin: 'auto',
    zIndex: 999999999999,
  }),
  control: (provided: object): object => ({
    ...provided,
    cursor: 'pointer',
    minHeight: '30px',
    width: 50,
    zIndex: 999999999999,
    borderColor: '#f9f7f7',
  }),
  option: (provided: object): object => ({
    ...provided,
    cursor: 'pointer',
  }),
  singleValue: (provided: object): object => ({
    ...provided,
    width: '100%',
  }),
};

function useWorkload(
  initialWorkload: WorkloadModel[],
  tableSlug: string,
  teacherId: string,
): [any, any] {
  const { data: subjectsData } = useQuery(graph.GetSubjects);
  const [updateWorkload] = useMutation(graph.UpdateWorkload, {
    update(cache, { data: { updateWorkload: response } }) {
      const { table } = cache.readQuery({
        query: graph.GetTable,
        variables: { slug: tableSlug },
      });

      const teacher = table.teachers.find((t: Teacher) => t.id === teacherId);

      const workIndex = teacher.workload.findIndex(
        (w: WorkloadModel) =>
          w.subjectId === response.subjectId && w.classId === response.classId,
      );

      if (workIndex !== -1) {
        teacher.workload[workIndex] = response;
      } else {
        teacher.workload.push(response);
      }

      cache.writeQuery({
        query: graph.GetTable,
        data: { table: setTableStats(table, subjectsData.subjects) },
      });
    },
  });

  const workload = initialWorkload.reduce((acc, w) => {
    return {
      ...acc,
      [w.subjectId]: {
        ...acc[w.subjectId],
        [w.classId]: w.hours,
      },
    };
  }, {});

  return [workload, updateWorkload];
}

export default React.memo(Workload);
