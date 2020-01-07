import React, { useState, HTMLAttributes, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';

import graph from '../../../graph';
import { translation } from '../../../utils';
import { Table, Preloader } from '../../ui';
import Timetable, { Cell } from './Timetable';
import TimetableWorker from '../../../utils/timetable/timetable.worker';

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

const TimetableContainer = styled.div``;

const timetableGenerator = new TimetableWorker();

let highlightTimeout = null;

interface TimetableFilters {
  shift: number;
}

const initialFilters: TimetableFilters = {
  shift: 1,
};

function applyFilters(timetables, { shift }: TimetableFilters) {
  const shiftTimetable = timetables[shift - 1];

  return shiftTimetable;
}

function TableContainer({ table }): React.ReactElement {
  const { data, loading: loadingSubjects } = useQuery(graph.GetSubjects);
  const [highlightTeachers, setHighlightTeachers] = useState<string>('');
  const [timetables, setTimetables] = useState([]);
  const [filter, setFilter] = useState(initialFilters);
  const highlightCells = useCallback(teachersName => {
    clearTimeout(highlightTimeout);

    if (teachersName && teachersName !== highlightTeachers) {
      highlightTimeout = setTimeout(
        () => setHighlightTeachers(teachersName),
        1500,
      );
    } else if (highlightTeachers) {
      setHighlightTeachers('');
    }
  }, []);

  timetableGenerator.onmessage = (e): void => setTimetables(e.data);

  if (!timetables.length || loadingSubjects) {
    if (!loadingSubjects)
      timetableGenerator.postMessage([table, data.subjects]);
    return <Preloader isCentered />;
  }

  const timetable = applyFilters(timetables, filter);
  console.log('timetable :', timetable);

  return (
    <Container
      highlightTeachersName={highlightTeachers}
      onMouseMove={(e): void => highlightCells(e.target?.dataset?.teachersName)}
    >
      <TimetableContainer>
        <Timetable key={timetable[0][0].length} timetable={timetable} />
      </TimetableContainer>
    </Container>
  );
}

export default React.memo(TableContainer);
