import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';
// import { NavLink } from 'react-router-dom';

import graph from '../../graph';
// import { translation } from '../../utils';

// import { Content } from '../ui';

interface Props {
  timetable: any;
}

const TableContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

function GeneratedTable(table: Props): React.ReactElement {
  const { timetable } = table;

  console.log('table :', table);

  return (
    <TableContainer>
      {timetable ? <>AAAAA</> : <>Cedvel yaradin</>}
    </TableContainer>
  );
}

export default React.memo(GeneratedTable);
