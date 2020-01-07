import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useMutation, useQuery } from 'react-apollo';

import { Table, Selector, Button, Modal } from '../../ui';

import {
  Table as TableProps,
  Teacher,
  Workload as WorkloadModel,
  Class,
} from '../../../models';

import { translation } from '../../../utils';
import graph from '../../../graph';

const Container = styled.div``;

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

interface Props extends TableProps {
  tableId: string;
  teacher: Teacher;
  classes: Class[];
}

function Workload({
  teacher,
  tableSlug,
  tableId,
  classes,
}: Props): React.ReactElement {
  const [newWorkload, setNewWorkload] = useState<WorkloadModel>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { data, loading: loadingSubjects } = useQuery(graph.GetSubjects);
  const [workload, updateWorkload] = useWorkload(
    teacher.workload,
    tableSlug,
    teacher.id,
  );
  const teacherClasses = useMemo(
    () =>
      classes.filter(c =>
        teacher.workload.find(w => c.id === w.classId && w.hours),
      ),
    [],
  );

  const teacherSubjects = useMemo(
    () =>
      data?.subjects.filter(s =>
        teacher.workload.find(w => s.id === w.subjectId && w.hours),
      ),
    [loadingSubjects],
  );

  if (loadingSubjects) return null;

  return (
    <Container>
      <Table.default>
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
                    <HoursSelector
                      onChange={(hours: number): void =>
                        updateWorkload({
                          variables: {
                            tableId,
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
            </Table.Row>
          ))}
        </Table.Body>
      </Table.default>
      <Button.Add onClick={(): void => setShowModal(true)}>
        {translation('addNewWorkload')}
      </Button.Add>
      {showModal && (
        <AddWorkloadModal
          onClose={(): void => setShowModal(false)}
          steps={[
            (nextStep): React.ReactElement => (
              <>
                <Title>{translation('selectSubject')}</Title>
                <Selector
                  key="0"
                  placeholder={translation('selectSubject')}
                  options={data.subjects.map(s => ({
                    value: s.id,
                    label: s.title.ru,
                  }))}
                  onChange={({ value: subjectId }): void => {
                    setNewWorkload({
                      ...newWorkload,
                      subjectId,
                    });
                    nextStep();
                  }}
                />
              </>
            ),
            (nextStep): React.ReactElement => (
              <>
                <Title>{translation('selectClass')}</Title>
                <Selector
                  key="1"
                  placeholder={translation('selectClass')}
                  options={classes.map(c => ({
                    value: c.id,
                    label: `${c.number}${c.letter}`,
                  }))}
                  onChange={({ value: classId }): void => {
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
                  options={hoursOptions}
                  onChange={({ value: hours }): void => {
                    setNewWorkload(null);
                    updateWorkload({
                      variables: {
                        ...newWorkload,
                        tableId,
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

interface HourSelectorProp {
  value: number;
  onChange: (hours: number) => void;
}

function HoursSelector({
  value,
  onChange,
  ...props
}: HourSelectorProp): React.ReactElement {
  return (
    <Selector
      value={{
        value,
        label: value,
      }}
      styles={{
        dropdownIndicator: (): object => ({ display: 'none' }),
        clearIndicator: (): object => ({ display: 'none' }),
        indicatorSeparator: (): object => ({ display: 'none' }),
        input: (): object => ({
          position: 'absolute',
          top: 0,
          left: 0,
          color: 'transparent',
        }),
        valueContainer: (): object => ({ width: 50 }),
        container: (provided: object): object => ({
          ...provided,
          width: 50,
          margin: 'auto',
        }),
        control: (provided: object): object => ({
          ...provided,
          cursor: 'pointer',
          minHeight: '30px',
          width: 50,
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
      }}
      onChange={({ value: hours }): void => onChange(hours)}
      options={hoursOptions}
      {...props}
    />
  );
}

function useWorkload(
  initialWorkload: WorkloadModel[],
  tableSlug: string,
  teacherId: string,
): [[WorkloadModel], any] {
  const [updateWorkload] = useMutation(graph.UpdateWorkload, {
    update(cache, { data: { updateWorkload: response } }) {
      if (cache.readQuery) {
        const { table } = cache.readQuery({
          query: graph.GetTable,
          variables: { slug: tableSlug },
        });

        const teacherIndex = table.teachers.findIndex(
          (t: Teacher) => t.id === teacherId,
        );

        const workIndex = table.teachers[teacherIndex].workload.findIndex(
          (w: WorkloadModel) =>
            w.subjectId === response.subjectId &&
            w.classId === response.classId,
        );

        if (workIndex !== -1) {
          table.teachers[teacherIndex].workload[workIndex] = response;
        } else {
          table.teachers[teacherIndex].workload.push(response);
        }

        cache.writeQuery({
          query: graph.GetTable,
          data: { table },
        });
      }
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
