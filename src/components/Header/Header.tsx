import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-apollo';

import { Domain } from '../ui';

import { translation, Auth } from '../../utils';
import graph from '../../graph';

const Container = styled.header`
  display: flex;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  padding-left: 20px;
  padding-right: 20px;
  width: 100%;
  overflow: hidden;
  background-color: #fff;
  border-bottom: 1px solid #e3e5e9;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
`;

const Username = styled.span`
  font-size: 22px;
  margin-right: 30px;
`;

const Logout = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;

// const Menu = styled.nav`
//   display: flex;
// `;

// const menuItemLineHeight = 8;

// const MenuItem = styled(NavLink)`
//   position: relative;
//   padding: 15px;
//   color: #2a3646;
//   font-weight: 500;
//   font-size: 18px;

//   &.active {
//     &:before {
//       display: block;
//       width: 100%;
//       content: '';
//       height: ${menuItemLineHeight}px;
//       border-radius: ${menuItemLineHeight / 2}px;
//       position: absolute;
//       bottom: -${menuItemLineHeight / 2}px;
//       left: 0;
//       background-color: #0b75d7;
//     }
//   }
// `;

function Header(): React.ReactElement {
  const { data, loading } = useQuery(graph.GetUser);

  if (loading) return null;

  return (
    <Container>
      <Domain />
      {/* <Menu>
        <MenuItem to="/" exact>
          {translation('tables')}
        </MenuItem>
      </Menu> */}
      <UserInfo>
        <Username>{data?.user?.name}</Username>
        <Logout onClick={Auth.logout}>{translation('logout')}</Logout>
      </UserInfo>
    </Container>
  );
}

export default React.memo(Header);
