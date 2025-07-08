
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import FeatherIcon from "../common/FeatherIconWrapper";

const SidebarContainer = styled.nav`
  width: 250px;
  background: var(--card-background);
  border-right: 1px solid var(--border-color);
  height: 100vh;
  position: fixed;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  h2 {
    margin: 0;
    color: var(--primary-color);
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 1rem 0;
  margin: 0;
`;

const NavItem = styled.li`
  a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
    transition: background 0.2s, color 0.2s;

    &.active,
    &:hover {
      background: var(--primary-color);
      color: white;

      svg {
        color: white; /* Ensure icon color changes on hover/active */
      }
    }

    svg {
      color: var(--text-color-light); /* Default icon color */
    }
  }
`;

const Sidebar = () => {
  return (
    <SidebarContainer>
      <SidebarHeader>
        <h2>Transaction Tracker</h2>
      </SidebarHeader>
      <NavList>
        <NavItem>
          <NavLink to="/"><FeatherIcon name="Home" size={18} />Dashboard</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/friends"><FeatherIcon name="Users" size={18} />Friends</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/transactions"><FeatherIcon name="List" size={18} />Transactions</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/utilities"><FeatherIcon name="Tool" size={18} />Utilities</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/store-management"><FeatherIcon name="ShoppingBag" size={18} />Store Management</NavLink>
        </NavItem>
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
