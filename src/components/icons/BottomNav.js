// src/components/BottomNav.js
import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling
import styles from './BottomNav.module.css';
import ClientsIcon from './icons/ClientsIcon'; // Import icons
import SettingsIcon from './icons/SettingsIcon';

function BottomNav() {
  // Helper to determine active style class
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? `${styles.navItem} ${styles.active}` : styles.navItem;
  };

  return (
    <nav className={styles.bottomNavContainer}>
      <NavLink to="/" className={getNavLinkClass} end> {/* 'end' ensures only exact match is active */}
        <ClientsIcon />
        <span className={styles.label}>Clients</span>
      </NavLink>

      <NavLink to="/settings" className={getNavLinkClass}>
        <SettingsIcon />
        <span className={styles.label}>Settings</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;