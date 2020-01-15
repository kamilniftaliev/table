import React, { Fragment } from 'react';
import styled from 'styled-components';

import { translation } from '../../../utils';
import { Table as TableType, Lesson } from '../../../models';
import { Table } from '../../ui';

const TableContainer = styled.section`
  padding: 10px;
  overflow-x: auto;
  max-width: 95vw;
`;

const TableWrapper = styled(Table.default)`
  border: 3px solid #000;
  overflow: hidden;
`;

interface CellProps extends React.TdHTMLAttributes<number> {
  classIndex: number;
  lessonNotFound?: boolean;
}

export const Cell = styled<CellProps>(Table.CellTD)`
  padding: 5px;
  min-width: 120px;
  white-space: nowrap;

  &:first-child {
    min-width: 20px;
    width: 20px;
  }

  ${({ lessonNotFound }): string =>
    lessonNotFound &&
    `
    background-color: #ff6f6f;
    color: transparent;
  `}

  border-right: 3px solid #000;
  transition-duration: 0.4s;
  transition-delay: ${({ classIndex = 0 }): number => classIndex / 15}s;
`;

interface RowProps extends React.HTMLProps {
  isStartOfDay: boolean;
}

const Row = styled<RowProps>(Table.Row)`
  border-bottom: 2px solid #000;

  ${({ isStartOfDay }): string =>
    isStartOfDay &&
    `
    border-top: 3px solid #000;
  `}
`;

interface Props {
  timetable: TableType;
}

function Timetable({ timetable }: Props): React.ReactElement {
  return (
    <TableContainer>
      {timetable && (
        <TableWrapper>
          <Table.Header>
            <Row>
              {timetable[0][0][0].map(({ id, classTitle }, i: number) => (
                <Cell as="th" isStartOfDay colSpan={i === 0 ? 2 : 1} key={id}>
                  {classTitle}
                </Cell>
              ))}
            </Row>
          </Table.Header>
          <Table.Body>
            {timetable[0].map(day =>
              day.map((hourClasses: Lesson[], hourIndex: number) => (
                // eslint-disable-next-line react/no-array-index-key
                <Row isStartOfDay={hourIndex === 0} key={hourIndex}>
                  {hourClasses.map(
                    (
                      { id, subjectTitle, teachersName },
                      classIndex: number,
                    ) => (
                      <Fragment key={id}>
                        {classIndex === 0 && <Cell>{hourIndex + 1}</Cell>}
                        <Cell
                          highlightColumn
                          classIndex={classIndex}
                          data-teachers-name={teachersName}
                          title={teachersName}
                          lessonNotFound={subjectTitle === '-'}
                        >
                          {subjectTitle}
                        </Cell>
                      </Fragment>
                    ),
                  )}
                </Row>
              )),
            )}
          </Table.Body>
        </TableWrapper>
      )}
    </TableContainer>
  );
}

export default React.memo(Timetable);
