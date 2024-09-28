// src/components/VisualButton.tsx
'use client';

import React, { useState } from 'react';

export const VisualButton = () => {
  const [color, setColor] = useState('black');

  const toggleColor = () => {
    setColor((prevColor) => (prevColor === 'black' ? 'white' : 'black'));
  };

  return (
    <button
      className={`px-4 py-2 rounded-md border-2 cursor-pointer text-lg ${
        color === 'black'
          ? 'bg-black text-white border-gray-700'
          : 'bg-white text-black border-gray-700'
      }`}
      onClick={toggleColor}
    >
      {color === 'black' ? 'Visualize On' : 'Visualize Off'}
    </button>
  );
};
