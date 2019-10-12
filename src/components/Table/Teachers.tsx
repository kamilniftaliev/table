import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';
// import { NavLink } from 'react-router-dom';

import graph from '../../graph';
// import { translation } from '../../utils';

// import { Content } from '../ui';

interface Teacher {
  id: string;
  name: string;
  workHours: [[true | false]];
}

interface Class {
  id: string;
  title: string;
}

interface Props {
  timetable: any;
  teachers: [Teacher];
  classes: any;
}

// const Container = styled.section`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   padding: 10px;
// `;

function GeneratedTable(table: Props): React.ReactElement {
  const { teachers } = table;

  console.log('teachers :', teachers);

  return <>Teachers</>;
}

export default React.memo(GeneratedTable);
