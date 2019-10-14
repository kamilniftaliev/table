import React, { lazy, Suspense, useState } from 'react';
import styled from 'styled-components';

import { translation } from '../../../utils';
import { Preloader } from '../../ui';

const Workload = lazy(() =>
  import(/* webpackChunkName: "workload" */ './Workload'),
);
const WorkHours = lazy(() =>
  import(/* webpackChunkName: "workhours" */ './WorkHours'),
);

const Container = styled.div``;

const WorkloadTitle = styled.span`
  font-size: 24px;
  font-weight: 400;
`;

interface Props {
  tableId: string;
  slug: string;
}

function Teachers({
  classes,
  subjects,
  teachers,
  tableId,
  tableSlug,
  slug,
  teachersPath,
}: Props): React.ReactElement {
  const teacher = teachers.find(t => t.slug === slug);
  const [tab, setTab] = useState<string>('workload');

  if (!teacher) return null;

  return (
    <>
      <WorkloadTitle onClick={() => setTab('workload')}>
        {translation('workloadTitle')}
      </WorkloadTitle>
      <WorkloadTitle onClick={() => setTab('workHours')}>
        {translation('workHoursTitle')}
      </WorkloadTitle>
      <Container>
        <Suspense fallback={<Preloader isCentered />}>
          {tab === 'workload' && (
            <Workload
              teacher={teacher}
              tableId={tableId}
              tableSlug={tableSlug}
              classes={classes}
              subjects={subjects}
            />
          )}

          {tab === 'workHours' && (
            <WorkHours
              teacher={teacher}
              tableId={tableId}
              tableSlug={tableSlug}
              classes={classes}
              subjects={subjects}
            />
          )}
        </Suspense>
      </Container>
    </>
  );
}

export default React.memo(Teachers);
