import React from 'react';

interface ProgressProps {
  value: number; // Value should be between 0 and 100
}

const Progress: React.FC<ProgressProps> = ({ value }) => {
  const percentage = Math.min(Math.max(value, 0), 100); // Ensure value is between 0 and 100

  return (
    <div className="relative w-full h-2 bg-gray-200 rounded">
      <div
        className="absolute top-0 left-0 h-2 bg-black rounded"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default Progress;
