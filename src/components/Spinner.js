// src/components/Spinner.js
import React from 'react';
import styles from './Spinner.module.css'; // We'll create this CSS file next

function Spinner({ size = 'medium' }) { // size prop: 'small', 'medium', 'large'
  return (
    <div className={`${styles.spinnerContainer} ${styles[size]}`}>
      <div className={styles.spinner}></div>
    </div>
  );
}

export default Spinner;