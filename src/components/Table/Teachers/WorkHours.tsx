import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from 'react-apollo';

// Components
import { Table, Checkbox } from '../../ui';

// Utils
import { translation, constants } from '../../../utils';
import graph from '../../../graph';
import { Table as TableType } from '../../../models';
import { Props, SectionTitle as DefaultSectionTitle } from './Workload';

interface ContainerProps
  extends React.DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  shifts: number;
}

const Container = styled.div<ContainerProps>`
  display: inline-grid;
  column-gap: 10%;
  justify-items: center;
  // max-width: 1040px;
  grid-template-areas: ${({ shifts }): string => {
    const areas = constants.shifts.slice(0, shifts).reduce(
      (acc, { value: shift }) => ({
        header: acc.header.concat('header'),
        workhours: acc.workhours.concat(`workhours-shift-${shift}`),
      }),
      { header: [], workhours: [] },
    );

    return `'${areas.header.join(' ')}'\n'${areas.workhours.join(' ')}'`;
  }};
`;

const SectionTitle = styled(DefaultSectionTitle)`
  grid-area: header;
`;

const TableHead = styled(Table.Head)`
  position: relative;
  text-align: center;
  cursor: pointer;

  label {
    position: absolute;
    visibility: hidden;
    right: 0;
    left: 0;
  }

  &:hover label {
    visibility: visible;
  }
`;

const TableCell = styled(Table.TD)`
  padding: 10px;
  cursor: pointer;

  &:first-of-type {
    position: relative;
    text-align: center;

    label {
      position: absolute;
      visibility: hidden;
      right: 5px;
      top: 10px;
    }

    &:hover label {
      visibility: visible;
    }
  }
`;

const ShiftTitle = styled.p`
  margin-top: 30px;
  margin-bottom: 5px;
  text-align: center;
  font-size: 22px;
  font-weight: 400;
`;

interface WorkhoursTableContainer
  extends React.DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  area: string;
}

const WorkhoursTableContainer = styled.div<WorkhoursTableContainer>`
  width: 450px;
  grid-area: ${({ area }): string => area};
`;

const HourCellTitle = styled.span`
  vertical-align: top;
`;

const daysOfWeek = [1, 2, 3, 4, 5, 6, 7];
const lessonsCount = 16;
const lessonHours = Array(lessonsCount)
  .fill(null)
  .map((a, i) => i + 1);

function Workhours({
  tableSlug,
  teacherId,
  shifts,
}: Props): React.ReactElement {
  const updateWorkhour = useWorkhours(tableSlug, teacherId);
  const { data, loading } = useQuery(graph.GetTable, {
    variables: { slug: tableSlug },
  });
  if (loading) return null;

  const {
    table: { teachers, id: tableId },
  } = data;

  const { workhours } = teachers.find(t => t.id === teacherId);

  return (
    <Container shifts={shifts}>
      <SectionTitle>{translation('workhoursTitle')}</SectionTitle>
      {constants.shifts.slice(0, shifts).map(({ value: shift, label }, si) => {
        const firstHourIndex = si * 8;
        return (
          <WorkhoursTableContainer
            key={label}
            area={`workhours-shift-${shift}`}
          >
            {shifts > 1 && <ShiftTitle>{label}</ShiftTitle>}
            <Table.default>
              <Table.Header>
                <Table.Row>
                  <Table.Head>{translation('days')}</Table.Head>
                  {daysOfWeek.map((day, dayIndex) => {
                    // Find 1 disabled hour
                    // @TODO
                    const isDayChecked =
                      workhours[dayIndex]
                        .slice(firstHourIndex, firstHourIndex + 8)
                        .findIndex(hour => !hour) === -1;

                    return (
                      <TableHead
                        key={day}
                        onClick={(): void =>
                          updateWorkhour({
                            variables: {
                              tableId,
                              teacherId,
                              day: dayIndex,
                              hour: firstHourIndex,
                              everyHour: true,
                              value: !isDayChecked,
                            },
                          })
                        }
                      >
                        <HourCellTitle>
                          {translation('weekDay', day, true)}
                        </HourCellTitle>
                        <Checkbox checked={isDayChecked} />
                      </TableHead>
                    );
                  })}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {lessonHours
                  .slice(firstHourIndex, firstHourIndex + 8)
                  .map(h => {
                    const hour = h - 1;
                    // Find 1 disabled day
                    const isHourChecked = !workhours.find(day => !day[hour]);

                    return (
                      <Table.Row key={hour}>
                        <TableCell
                          align="left"
                          onClick={(): void =>
                            updateWorkhour({
                              variables: {
                                tableId,
                                teacherId,
                                day: 0,
                                hour,
                                everyDay: true,
                                value: !isHourChecked,
                              },
                            })
                          }
                        >
                          <HourCellTitle>
                            {`${translation('lesson')} ${h}`}
                          </HourCellTitle>
                          <Checkbox checked={isHourChecked} />
                        </TableCell>
                        {daysOfWeek.map((key, day) => {
                          const value = !!workhours[day][hour];

                          return (
                            <TableCell
                              key={key}
                              onClick={(): void =>
                                updateWorkhour({
                                  variables: {
                                    tableId,
                                    teacherId,
                                    day,
                                    hour,
                                    value: !value,
                                  },
                                })
                              }
                            >
                              <Checkbox checked={value} />
                            </TableCell>
                          );
                        })}
                      </Table.Row>
                    );
                  })}
              </Table.Body>
            </Table.default>
          </WorkhoursTableContainer>
        );
      })}
    </Container>
  );
}

interface TableQueryProps {
  table: TableType;
}

function useWorkhours(
  tableSlug: string,
  teacherId: string,
): (props: object) => void {
  const [updateWorkhour, { loading }] = useMutation(graph.UpdateWorkhour, {
    update(
      cache,
      {
        data: {
          updateWorkhour: { day, hour, value, everyHour, everyDay },
        },
      },
    ) {
      const { table }: TableQueryProps = cache.readQuery({
        query: graph.GetTable,
        variables: { slug: tableSlug },
      });

      const teacher = table.teachers.find(t => t.id === teacherId);
      let updatedHoursCount = 0;

      // If given hour of every day is updated
      if (everyDay) {
        teacher.workhours.forEach((dayHours, dayIndex) => {
          if (dayHours[hour] !== value) {
            if (dayIndex < 7) updatedHoursCount += 1;

            // eslint-disable-next-line no-param-reassign
            dayHours[hour] = value;
          }
        });
      } else if (everyHour) {
        // If given day of every hour is updated
        let shiftWorkhours = teacher.workhours[day].slice(0, 9);

        // If not first hour - meaning not first shift
        if (hour) shiftWorkhours = teacher.workhours[day].slice(8, 16);

        updatedHoursCount = shiftWorkhours.filter(dayHour => dayHour !== value)
          .length;
        teacher.workhours[day].fill(value, hour ? 8 : 0, hour ? 16 : 8);
      } else {
        teacher.workhours[day][hour] = value;
        updatedHoursCount = 1;
      }

      teacher.workhoursAmount += value ? updatedHoursCount : -updatedHoursCount;

      cache.writeQuery({
        query: graph.GetTable,
        data: { table },
      });
    },
  });

  return (props): void => {
    if (loading) return;
    updateWorkhour(props);
  };
}

export default React.memo(Workhours);
