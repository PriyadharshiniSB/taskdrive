import React from 'react';

// Custom TaskDrive mark: a folder silhouette with an integrated checkmark,
// rather than a generic stock icon. The checkmark is cut out of the folder
// tab as negative space, so the two concepts (files + tasks) read as one
// shape instead of two icons glued together.
const Logo = ({ size = 28, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="taskdrive-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#16324F" />
          <stop offset="100%" stopColor="#C2703D" />
        </linearGradient>
      </defs>

      {/* Folder body */}
      <path
        d="M6 14C6 11.7909 7.79086 10 10 10H18.5L22 14H38C40.2091 14 42 15.7909 42 18V34C42 36.2091 40.2091 38 38 38H10C7.79086 38 6 36.2091 6 34V14Z"
        fill="url(#taskdrive-grad)"
      />

      {/* Checkmark cut into the folder as negative space */}
      <path
        d="M16 25L21.5 30.5L33 19"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;