import React, { useState, HTMLAttributes, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';

import graph from '../../../graph';
import { translation, constants } from '../../../utils';
import generateTimetable from '../../../utils/timetable';
import { Table, Preloader, Selector } from '../../ui';
import Timetable, { Cell } from './Timetable';
import TimetableWorker from '../../../utils/timetable/timetable.worker';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  highlightTeachersName: string;
}

const Container = styled.div<ContainerProps>`
  width: 100%;

  @media print {
    width: auto;
  }

  ${({ highlightTeachersName }): string =>
    highlightTeachersName &&
    `
    ${Cell}[data-teachers-name="${highlightTeachersName}"] {
      background-color: #0b4da4db;
      color: #fff;
    }
  `}
`;

const FiltersContainer = styled.header`
  display: flex;
  justify-content: center;
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 20px;

  @media print {
    display: none;
  }
`;

const SectorSelector = styled(Selector)`
  max-width: 450px;
  margin-right: 30px;
`;

const TimetableContainer = styled.div`
  display: flex;
  justify-content: center;

  @media print {
    justify-content: flex-start;
  }
`;

const EmptyTableMessage = styled.p`
  font-size: 26px;
  text-align: center;
  margin-top: 120px;
`;

const timetableGenerator = new TimetableWorker();

const highlightTimeout = null;

interface TimetableFilters {
  shift: number;
  sector?: string;
  educationLevel?: string;
}

const initialFilters: TimetableFilters = {
  shift: 1,
};

function applyFilters({
  timetables,
  filter: { shift, sector, educationLevel },
  table,
}) {
  // Apply shift
  let timetable = timetables[shift - 1];

  // Apply sector
  if (sector !== null) {
    timetable = timetable.map(day =>
      day.map(hours =>
        hours.filter(
          ({ classId }) =>
            table.classes.find(c => c.id === classId)?.sector === sector,
        ),
      ),
    );
  }

  // Apply education level
  if (educationLevel !== null) {
    const { match: educationLevelMatch } = constants.educationLevels.find(
      el => el.value === educationLevel,
    );
    timetable = timetable.map(day =>
      day.map(hours =>
        hours.filter(({ classId }) =>
          educationLevelMatch(table.classes.find(c => c.id === classId)),
        ),
      ),
    );
  }

  return timetable;
}

const allFilter = {
  value: null,
  label: translation('all'),
};

function TableContainer({ table }): React.ReactElement {
  const { data, loading: loadingSubjects } = useQuery(graph.GetSubjects);
  // const [highlightTeachers, setHighlightTeachers] = useState<string>('');
  const [timetables, setTimetables] = useState([]);
  const sectors = useMemo(
    () => [
      allFilter,
      ...constants.sectors.filter(({ value }) =>
        table.classes.find(c => c.sector === value),
      ),
    ],
    [table.classes],
  );

  const shifts = useMemo(
    () =>
      constants.shifts.filter(({ value }) =>
        table.classes.find(c => c.shift === value),
      ),
    [table.classes],
  );

  const educationLevels = useMemo(
    () =>
      constants.educationLevels.filter(({ match }) =>
        table.classes.find(match),
      ),
    [table.classes],
  );

  const [filter, setFilter] = useState({
    ...initialFilters,
    sector: sectors[0].value,
    educationLevel: educationLevels[0].value,
  });

  // const timetableData = useMemo(() => {
  //   return loadingSubjects && generateTimetable(table, data.subjects);
  // }, [loadingSubjects]);

  // if (!timetableData?.timetable) return null;

  // DEV MODE start
  // const timetables = useMemo(
  //   () => generateTimetable(table, data.subjects)?.timetable,
  //   [loadingSubjects],
  // );
  // DEV MODE end

  // if (loadingSubjects || !timetable) return null;

  // const highlightCells = useCallback(teachersName => {
  //   clearTimeout(highlightTimeout);

  //   if (teachersName && teachersName !== highlightTeachers) {
  //     highlightTimeout = setTimeout(
  //       () => setHighlightTeachers(teachersName),
  //       1500,
  //     );
  //   } else if (highlightTeachers) {
  //     setHighlightTeachers('');
  //   }
  // }, []);

  timetableGenerator.onmessage = (e): void => {
    e.data.logs.map(l => console.log(l));
    // Object.keys(e.data.win).forEach(key => {
    //   globalThis[key] = e.data.win[key];
    // });
    setTimetables(e.data.timetable);
  };

  if (!timetables.length || loadingSubjects) {
    if (!loadingSubjects)
      timetableGenerator.postMessage([table, data.subjects]);
    return <Preloader isCentered />;
  }

  const timetable = applyFilters({ timetables, filter, table });
  console.log('timetable :', timetable);

  const isTableEmpty =
    timetable.filter(d => d.filter(h => h.length).length).length === 0;

  return (
    <Container>
      <FiltersContainer>
        {sectors.length > 1 && (
          <SectorSelector
            options={sectors}
            placeholder={translation('sector')}
            value={filter.sector}
            onChange={(sector: string): void =>
              setFilter({ ...filter, sector })
            }
            useSwitcherForOptionsCount={3}
          />
        )}
        {shifts.length > 1 && (
          <SectorSelector
            options={shifts}
            placeholder={translation('shift')}
            value={filter.shift}
            onChange={(shift: number): void => setFilter({ ...filter, shift })}
            useSwitcherForOptionsCount={3}
          />
        )}
        {educationLevels.length > 1 && (
          <SectorSelector
            options={educationLevels}
            placeholder={translation('educationLevel')}
            value={filter.educationLevel}
            onChange={(educationLevel: string): void =>
              setFilter({ ...filter, educationLevel })
            }
            useSwitcherForOptionsCount={4}
          />
        )}
      </FiltersContainer>
      {isTableEmpty ? (
        <EmptyTableMessage>
          {translation('emptyTableMessage')}
        </EmptyTableMessage>
      ) : (
        <TimetableContainer>
          <Timetable timetable={timetable} />
        </TimetableContainer>
      )}
    </Container>
  );
}

export default React.memo(TableContainer);
