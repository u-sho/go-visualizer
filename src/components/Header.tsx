// src/components/Header.tsx
"use client";

import React from 'react';

export const Header = () => {
  return (
    <header className="bg-gray-800 text-white fixed top-0 left-0 w-full p-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Go Visualizer</h1>
      </div>
    </header>
  );
};
