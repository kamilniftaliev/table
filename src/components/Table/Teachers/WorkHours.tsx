import React from 'react';
import styled from 'styled-components';
import { useMutation } from 'react-apollo';

import { Table, Checkbox } from '../../ui';

import { translation } from '../../../utils';
import graph from '../../../graph';

const TableCell = styled(Table.TD)`
  padding: 10px;
`;

const daysOfWeek = [1, 2, 3, 4, 5, 6, 7];
const lessonHours = [1, 2, 3, 4, 5, 6, 7, 8];

function WorkHours({ teacher, tableSlug, tableId, classes, subjects }) {
  const updateWorkhour = useWorkhours(tableSlug, teacher.id);

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
        {lessonHours.map(hour => (
          <Table.Row key={hour}>
            <TableCell align="left">
              {translation('lesson')} {hour}
            </TableCell>
            {daysOfWeek.map(day => (
              <TableCell key={day}>
                <Checkbox
                  checked={teacher.workhours[day - 1][hour - 1]}
                  onChange={value =>
                    updateWorkhour({
                      variables: {
                        tableId,
                        teacherId: teacher.id,
                        day: `${day - 1}`,
                        hour: `${hour - 1}`,
                        value,
                      },
                    })
                  }
                />
              </TableCell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table.default>
  );
}

function useWorkhours(tableSlug, teacherId) {
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
      }
    },
  });

  return updateWorkhour;
}

export default React.memo(WorkHours);
