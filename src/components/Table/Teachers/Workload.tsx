import React from 'react';
import styled from 'styled-components';
import { useMutation } from 'react-apollo';

import { Table, Selector } from '../../ui';

import { translation } from '../../../utils';
import graph from '../../../graph';

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

function Workload({ teacher, tableSlug, tableId, classes, subjects }) {
  const [workload, updateWorkload] = useWorkload(
    teacher.workload,
    tableSlug,
    teacher.id,
  );

  return (
    <Table.default>
      <Table.Header>
        <Table.Row>
          <Table.Head>{translation('classes')}</Table.Head>
          {classes.map(({ id, title }) => (
            <Table.Head key={id}>{title}</Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {subjects.map(({ id: subjectId, title }) => (
          <Table.Row key={subjectId}>
            <SubjectTitleCell align="left">{title}</SubjectTitleCell>
            {classes.map(({ id: classId }) => {
              const defaultHours = workload[subjectId]
                ? workload[subjectId][classId]
                : 0;
              return (
                <TableCell key={classId}>
                  <HoursSelector
                    onChange={hours =>
                      updateWorkload({
                        variables: {
                          tableId,
                          teacherId: teacher.id,
                          subjectId,
                          classId,
                          hours,
                          prevHours: defaultHours || 0,
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
  );
}

const hoursOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => ({
  value: num,
  label: num,
}));

function HoursSelector({ value, onChange, ...props }) {
  return (
    <Selector
      value={{
        value,
        label: value,
      }}
      styles={{
        dropdownIndicator: () => ({ display: 'none' }),
        clearIndicator: () => ({ display: 'none' }),
        indicatorSeparator: () => ({ display: 'none' }),
        input: () => ({
          position: 'absolute',
          top: 0,
          left: 0,
          color: 'transparent',
        }),
        valueContainer: () => ({ width: 50 }),
        container: provided => ({ ...provided, width: 50, margin: 'auto' }),
        control: provided => ({
          ...provided,
          cursor: 'pointer',
          minHeight: '30px',
          width: 50,
          borderColor: '#f9f7f7',
        }),
        option: provided => ({ ...provided, cursor: 'pointer' }),
        singleValue: provided => ({ ...provided, width: '100%' }),
      }}
      onChange={({ value: hours }) => onChange(hours)}
      options={hoursOptions}
      {...props}
    />
  );
}

function useWorkload(initialWorkload, tableSlug, teacherId) {
  const [updateWorkload] = useMutation(graph.UpdateWorkload, {
    update(cache, { data: { updateWorkload: response } }) {
      if (cache.readQuery) {
        const { table } = cache.readQuery({
          query: graph.GetTable,
          variables: { slug: tableSlug },
        });

        const teacherIndex = table.teachers.findIndex(t => t.id === teacherId);

        const workIndex = table.teachers[teacherIndex].workload.findIndex(
          w =>
            w.subjectId === response.subjectId &&
            w.classId === response.classId,
        );

        if (workIndex != -1) {
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
