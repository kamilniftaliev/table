import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Domain = styled(Link)`
  color: #0e5fca;
  font-size: 28px;
  font-weight: bold;
  padding: 10px;
  text-align: center;
`;

function Component(props): React.ReactElement {
  return (
    <Domain {...props} to="/">
      TABLE.AZ
    </Domain>
  );
}

export default React.memo(Component);
