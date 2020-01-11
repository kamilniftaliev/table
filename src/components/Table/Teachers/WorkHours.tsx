import React, { useState } from 'react';
import styled from 'styled-components';
import { useMutation } from 'react-apollo';

import { Table, Checkbox } from '../../ui';

import { translation } from '../../../utils';
import graph from '../../../graph';
import { Teacher } from '../../../models';

const Container = styled.div`
  display: grid;
`;

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

const SectionTitle = styled.p`
  text-align: center;
`;

const daysOfWeek = [1, 2, 3, 4, 5, 6, 7];
const lessonsCount = 16;
const lessonHours = Array(lessonsCount)
  .fill(null)
  .map((a, i) => i + 1);

interface RenderWorkhoursProps {
  hours: [number?];
  tableId: string;
  teacher: Teacher;
  updateWorkhour: (value: object) => void;
}

function renderWorkhours({
  shift,
  hours,
  tableId,
  teacher,
  updateWorkhour,
}: RenderWorkhoursProps): React.ReactElement {
  return (
    <div>
      <ShiftTitle>{translation(`shift${shift}`)}</ShiftTitle>
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
                {` ${index + 1}`}
              </TableCell>
              {daysOfWeek.map(day => {
                const initialValue = !!teacher.workhours[day - 1][hour - 1];

                const updater = (value): void =>
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
                  <TableCell
                    onClick={(): void => updater(!initialValue)}
                    key={day}
                  >
                    <Checkbox checked={initialValue} onChange={updater} />
                  </TableCell>
                );
              })}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.default>
    </div>
  );
}

interface Props {
  teacher: Teacher;
  tableSlug: string;
  tableId: string;
}

function Workhours({ teacher, tableSlug, tableId }: Props): React.ReactElement {
  const updateWorkhour = useWorkhours(tableSlug, teacher.id);

  return (
    <Container>
      <SectionTitle>{translation('workhoursTitle')}</SectionTitle>
      {renderWorkhours({
        hours: lessonHours.slice(0, 8),
        shift: 1,
        tableId,
        teacher,
        updateWorkhour,
      })}
      {renderWorkhours({
        hours: lessonHours.slice(8),
        shift: 2,
        tableId,
        teacher,
        updateWorkhour,
      })}
    </Container>
  );
}

function useWorkhours(
  tableSlug: string,
  teacherId: string,
): RenderWorkhoursProps['updateWorkhour'] {
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
    },
  });

  return (props): void => {
    if (inProgress) return;
    setInProgress(true);
    updateWorkhour(props);
  };
}

export default React.memo(Workhours);
