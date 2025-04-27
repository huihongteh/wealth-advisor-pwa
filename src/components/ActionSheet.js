// src/components/ActionSheet.js
import React, { useEffect } from 'react';
import styles from './ActionSheet.module.css';

function ActionSheet({ isOpen, onClose, actions = [] }) { // Default actions to empty array

  // Effect to add/remove body class to prevent scrolling behind the modal
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('noScroll');
    } else {
      document.body.classList.remove('noScroll');
    }
    // Cleanup function to remove class if component unmounts while open
    return () => {
      document.body.classList.remove('noScroll');
    };
  }, [isOpen]);

  if (!isOpen) {
    return null; // Don't render anything if not open
  }

  return (
    // Use React Portal later if needed for stacking context issues, simple div for now
    <div className={styles.actionSheetContainer} role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose}></div>

      {/* Sheet Content */}
      <div className={styles.sheet}>
        <div className={styles.actionsGroup}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              // Apply destructive style conditionally
              className={`${styles.actionButton} ${action.destructive ? styles.destructiveButton : ''}`}
              disabled={action.disabled} // Optional: pass disabled state
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className={styles.cancelGroup}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionSheet;