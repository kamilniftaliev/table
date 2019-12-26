import React, { useState, Fragment, HTMLAttributes, useMemo } from 'react';
import styled from 'styled-components';
// import { useQuery } from 'react-apollo';

// import graph from '../../graph';
import { translation, Timetable } from '../../utils';
import { Table as TableType, Lesson } from '../../models';
import { Table } from '../ui';

const TableContainer = styled.section`
  padding: 10px;
  overflow-x: auto;
  max-width: 95vw;
`;

const TableWrapper = styled(Table.default)`
  border: 3px solid #000;
`;

interface CellProps extends React.TdHTMLAttributes<number> {
  classIndex: number;
  lessonNotFound?: boolean;
}

const Cell = styled<CellProps>(Table.CellTD)`
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

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  highlightTeachersName: string;
}

const Container = styled.div<ContainerProps>`
  ${({ highlightTeachersName }): string =>
    highlightTeachersName &&
    `
    ${Cell}[data-teachers-name="${highlightTeachersName}"] {
      background-color: #0b4da4db;
      color: #fff;
    }
  `}
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

function tableGenerator(timetable): React.ReactElement {
  return (
    <TableContainer key={timetable[0][0].length}>
      {timetable && (
        <TableWrapper>
          <Table.Header>
            <Row>
              {timetable[0][0].map(({ id, classTitle }, i: number) => (
                <Cell as="th" isStartOfDay colSpan={i === 0 ? 2 : 1} key={id}>
                  {classTitle}
                </Cell>
              ))}
            </Row>
          </Table.Header>
          <Table.Body>
            {timetable.map(day =>
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

const shifts = 2;

function GeneratedTable(table: TableType): React.ReactElement {
  const [highlightTeachers, setHighlightTeachers] = useState<string>('');

  let highlightTimeout = null;

  function highlightCells(event: MouseEvent<HTMLDivElement, MouseEvent>): void {
    clearTimeout(highlightTimeout);

    // eslint-disable-next-line prefer-destructuring
    const teachersName = event.target?.dataset?.teachersName;

    if (teachersName) {
      highlightTimeout = setTimeout(
        () => setHighlightTeachers(teachersName),
        1500,
      );
    } else if (highlightTeachers) {
      setHighlightTeachers('');
    }
  }

  const timetable = useMemo(() => Timetable(table, shifts), [table]);

  return (
    <Container
      highlightTeachersName={highlightTeachers}
      onMouseMove={highlightCells}
    >
      {timetable.map(tableGenerator)}
    </Container>
  );
}

export default React.memo(GeneratedTable);
