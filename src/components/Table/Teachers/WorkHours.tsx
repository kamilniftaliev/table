import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation } from 'react-apollo';

import { Table, Checkbox } from '../../ui';

import { translation } from '../../../utils';
import graph from '../../../graph';

const TableCell = styled(Table.TD)`
  padding: 10px;
`;

const ShiftTitle = styled.p`
  margin-top: 30px;
  margin-bottom: 5px;
  text-align: center;
  font-size: 22px;
  font-weight: 400;
`;

const daysOfWeek = [1, 2, 3, 4, 5, 6, 7];
const lessonsCount = 16;
const lessonHours = Array(lessonsCount)
  .fill(null)
  .map((a, i) => i + 1);

function renderWorkhours({
  hours,
  tableId,
  teacher,
  updateWorkhour,
}): React.ReactElement {
  return (
    <Table.default>
      <Table.Header>
        <Table.Row>
          <Table.Head>{translation('days')}</Table.Head>
          {daysOfWeek.map(day => (
            <Table.Head key={day}>{day}</Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {hours.map((hour, index) => (
          <Table.Row key={hour}>
            <TableCell align="left">
              {translation('lesson')} 
              {' '}
              {index + 1}
            </TableCell>
            {daysOfWeek.map(day => {
              const initialValue = !!teacher.workhours[day - 1][hour - 1];

              const updater = value =>
                updateWorkhour({
                  variables: {
                    tableId,
                    teacherId: teacher.id,
                    day: `${day - 1}`,
                    hour: `${hour - 1}`,
                    value,
                  },
                });

              return (
                <TableCell onClick={() => updater(!initialValue)} key={day}>
                  <Checkbox checked={initialValue} onChange={updater} />
                </TableCell>
              );
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.default>
  );
}

function Workhours({ teacher, tableSlug, tableId }) {
  const updateWorkhour = useWorkhours(tableSlug, teacher.id);

  return (
    <>
      <ShiftTitle>
        {translation('shift')}
        {' '}
1
      </ShiftTitle>
      {renderWorkhours({
        hours: lessonHours.slice(0, 8),
        tableId,
        teacher,
        updateWorkhour,
      })}
      <ShiftTitle>
        {translation('shift')}
        {' '}
2
      </ShiftTitle>
      {renderWorkhours({
        hours: lessonHours.slice(8),
        tableId,
        teacher,
        updateWorkhour,
      })}
    </>
  );
}

function useWorkhours(tableSlug, teacherId) {
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [updateWorkhour] = useMutation(graph.UpdateWorkhour, {
    update(
      cache,
      {
        data: {
          updateWorkhour: { day, hour, value },
        },
      },
    ) {
      if (cache.readQuery) {
        const { table } = cache.readQuery({
          query: graph.GetTable,
          variables: { slug: tableSlug },
        });

        const teacherIndex = table.teachers.findIndex(t => t.id === teacherId);

        table.teachers[teacherIndex].workhours[day][hour] = value;

        cache.writeQuery({
          query: graph.GetTable,
          data: { table },
        });
        setInProgress(false);
      }
    },
  });

  return (props): void => {
    if (inProgress) return;
    setInProgress(true);
    updateWorkhour(props);
  };
}

export default React.memo(Workhours);
