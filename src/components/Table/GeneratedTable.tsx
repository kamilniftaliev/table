import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';

import graph from '../../graph';
import { translation, Timetable } from '../../utils';

import { Table, Button } from '../ui';

const TableContainer = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 10px;
  overflow-x: auto;
  max-width: 95vw;
`;

const TableWrapper = styled(Table.default)`
  width: auto;
  border: 3px solid #000;
`;

const Cell = styled(Table.CellTD)`
  padding: 5px;
  min-width: 120px;
  white-space: nowrap;

  &:first-child {
    min-width: 20px;
    width: 20px;
  }

  border-right: 3px solid #000;
  transition-duration: .4s;
  transition-delay: ${({ classIndex = 0 }) => (classIndex / 15)}s;
`;

const Container = styled.div`

  ${({ highlightTeachersName }) => highlightTeachersName && `
    ${Cell}[data-teachers-name="${highlightTeachersName}"] {
      background-color: #576cd3;
      color: #fff;
    }
  `}
`;

const Row = styled(Table.Row)`
  border-bottom: 2px solid #000;

  ${({ isStartOfDay }) =>
    isStartOfDay &&
    `
    border-top: 3px solid #000;
  `}
`;

const ControlContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const GenerateTimeTableButton = styled(Button.default)``;

function getTeachersName(teachers) {
  if (!teachers?.length) return ''

  if (teachers.length === 1) return teachers[0].name

  return `${teachers[0].name} və ${teachers[1].name}`;
}

function tableGenerator(table) {
  const tableRef = useRef(null);
  const [timetable, setTimetable] = useState(null);
  const { classes } = table;

  // if (timetable) console.table('timetable :', timetable);

  function generateTimeTable() {
    if (!timetable) setTimetable(Timetable.generate(table));
  }

  generateTimeTable();

  return (
    <TableContainer>
      <ControlContainer>
        <GenerateTimeTableButton onClick={generateTimeTable}>
          {translation('generateTimeTable')}
        </GenerateTimeTableButton>
      </ControlContainer>
      {timetable && (
        <TableWrapper ref={tableRef} >
          <Table.Header>
            <Row>
              {classes.map(({ id, title }, i) => (
                <Cell as="th" isStartOfDay colSpan={i === 0 ? 2 : 1} key={id}>
                  {title}
                </Cell>
              ))}
            </Row>
          </Table.Header>
          <Table.Body>
            {timetable.map(day => day.map((hourClasses, hourIndex) => (
              <Row isStartOfDay={hourIndex === 0} key={hourIndex}>
                {hourClasses.map(
                  ({ subjectId, teachers }, classIndex) => (
                    <React.Fragment key={classIndex}>
                      {classIndex === 0 && <Cell>{hourIndex + 1}</Cell>}
                      <Cell
                        highlightColumn
                        classIndex={classIndex}
                        data-teachers-name={getTeachersName(teachers)}
                        title={getTeachersName(teachers)}
                      >
                        {Timetable.getSubjectTitleById(subjectId) || subjectId}
                      </Cell>
                    </React.Fragment>
                  ),
                )}
              </Row>
            )))}
          </Table.Body>
        </TableWrapper>
      )}
    </TableContainer>
  );
}

function getShiftFromTable(
  {
    classes,
    teachers,
    ...rest
  },
  shift,
) {
  return {
    ...rest,
    classes: classes.filter(c => c.shift === shift),
    teachers: teachers.map(teacher => ({
      ...teacher,
      workhours: teacher.workhours.map(hours => shift === 1 ? hours.slice(0, 8) : hours.slice(8)),
      workload: teacher.workload.filter(w => classes.find(c => c.id === w.classId)?.shift === shift)
    })),
  }
}

function GeneratedTable(table): React.ReactElement {
  const [highlightTeachers, setHighlightTeachers] = useState<string>('');

  const firstShift = getShiftFromTable(table, 1);
  const secondShift = getShiftFromTable(table, 2);
  let highlightTimeout = null;

  function highlightCells(event): void {
    clearTimeout(highlightTimeout);

    // eslint-disable-next-line prefer-destructuring
    const teachersName = event.target?.dataset?.teachersName;

    if (teachersName) {
      highlightTimeout = setTimeout(() => setHighlightTeachers(teachersName), 1500);
    } else if (highlightTeachers) {
      setHighlightTeachers('');
    }
  }

  return (
    <Container highlightTeachersName={highlightTeachers} onMouseMove={highlightCells}>
      {tableGenerator(firstShift)}
      {tableGenerator(secondShift)}
    </Container>
  )
}

export default React.memo(GeneratedTable);
