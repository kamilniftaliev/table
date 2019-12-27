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

const timetableGenerator = new TimetableWorker();

let highlightTimeout = null;

function TableContainer({ table }: Props): React.ReactElement {
  const { data, loading: loadingSubjects } = useQuery(graph.GetSubjects);
  const [highlightTeachers, setHighlightTeachers] = useState<string>('');
  const [timetable, setTimetable] = useState([]);
  const highlightCells = useCallback(teachersName => {
    // if (!loadingSubjects) timetableGenerator.postMessage([table, data?.subjects]);
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

  timetableGenerator.onmessage = (e): void => setTimetable(e.data);

  if (!timetable.length && data?.subjects) {
    timetableGenerator.postMessage([table, data.subjects]);
    return <Preloader isCentered />;
  }

  console.log('timetable :', timetable);

  return (
    <Container
      highlightTeachersName={highlightTeachers}
      onMouseMove={(e): void => highlightCells(e.target?.dataset?.teachersName)}
    >
      {timetable &&
        timetable.map(t => <Timetable key={t[0][0].length} timetable={t} />)}
    </Container>
  );
}

export default React.memo(TableContainer);
