// src/components/AvatarPlaceholder.js
import React from 'react';
import styles from './AvatarPlaceholder.module.css';

// Simple hash function to generate a somewhat consistent color index based on name
// (Doesn't guarantee unique colors, but provides variation)
const simpleHashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash); // Ensure positive index
};

// Predefined background colors
const colors = [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FF9800', // Orange
    '#9C27B0', // Purple
    '#F44336', // Red
    '#00BCD4', // Cyan
    '#FFC107', // Amber
    '#3F51B5', // Indigo
    '#E91E63', // Pink
    '#009688', // Teal
];

function AvatarPlaceholder({ name, size = 50 }) { // Default size 50px
  // Get the first letter, default to '?' if name is empty/null
  const firstLetter = name ? name.trim().charAt(0).toUpperCase() : '?';

  // Get a color based on the name's hash code
  const colorIndex = name ? simpleHashCode(name) % colors.length : 0;
  const backgroundColor = colors[colorIndex];

  // Calculate font size based on container size (approximate)
  const fontSize = Math.max(12, Math.round(size * 0.45)); // Ensure minimum size

  return (
    <div
      className={styles.avatarPlaceholder}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: backgroundColor,
        fontSize: `${fontSize}px`,
        lineHeight: `${size}px`, // Vertically center letter
      }}
      aria-label={`Avatar for ${name || 'Unknown Client'}`} // Accessibility
    >
      {firstLetter}
    </div>
  );
}

export default AvatarPlaceholder;