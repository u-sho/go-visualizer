// src/components/StoneButton.tsx
'use client';

import React from 'react';

interface StoneButtonProps {
  color: 'black' | 'white';
  onToggleColor: () => void;
}

export const StoneButton: React.FC<StoneButtonProps> = ({
  color,
  onToggleColor
}) => {
  return (
    <button
      className={`px-4 py-2 rounded-md border-2 cursor-pointer text-lg ${
        color === 'black'
          ? 'bg-black text-white border-gray-700'
          : 'bg-white text-black border-gray-700'
      }`}
      onClick={onToggleColor}
    >
      {color === 'black' ? 'Switch to White' : 'Switch to Black'}
    </button>
  );
};
