
import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
`;

const MainContent = styled.main`
  margin-left: 250px;
  padding: 2rem;
  width: calc(100% - 250px);
`;

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>{children}</MainContent>
    </LayoutContainer>
  );
};

export default Layout;
