import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';

import graph from '../../graph';
import { translation, Timetable } from '../../utils';

import { Table, Button } from '../ui';

const TableContainer = styled.section`
  padding: 10px;
`;

const TableWrapper = styled(Table.default)`
  border: 3px solid #000;
`;

const Cell = styled(Table.CellTD)`
  padding: 5px;
  min-width: 120px;

  &:first-child {
    min-width: 20px;
    width: 20px;
  }

  border-right: 3px solid #000;
`;

const Head = styled(Cell).attrs(() => ({
  as: 'th',
}))``;

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

function GeneratedTable(table): React.ReactElement {
  const [timetable, setTimetable] = useState(null);
  const { classes } = table;

  console.table('timetable :', timetable);

  function generateTimeTable() {
    setTimetable(Timetable.generate(table));
  }

  return (
    <TableContainer>
      <ControlContainer>
        <GenerateTimeTableButton onClick={generateTimeTable}>
          {translation('generateTimeTable')}
        </GenerateTimeTableButton>
      </ControlContainer>
      {timetable && (
        <TableWrapper>
          <Table.Header>
            <Row>
              {classes.map(({ id, title }, i) => (
                <Head isStartOfDay colSpan={i === 0 ? 2 : 1} key={id}>
                  {title}
                </Head>
              ))}
            </Row>
          </Table.Header>
          <Table.Body>
            {timetable.map(day => {
              return day.map((hourClasses, hourIndex) => {
                return (
                  <Row isStartOfDay={hourIndex === 0} key={hourIndex}>
                    {hourClasses.map(({ lessonTitle }, classIndex) => (
                      <React.Fragment key={classIndex}>
                        {classIndex === 0 && <Cell>{hourIndex + 1}</Cell>}
                        <Cell>{lessonTitle}</Cell>
                      </React.Fragment>
                    ))}
                  </Row>
                );
              });
            })}
          </Table.Body>
        </TableWrapper>
      )}
    </TableContainer>
  );
}

export default React.memo(GeneratedTable);