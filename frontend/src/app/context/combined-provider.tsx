'use client'

import React, { ReactNode } from 'react';
import { ModelProvider } from './model';
import { EndpointProvider } from './endpoint';

export const CombinedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ModelProvider>
      <EndpointProvider>
        {children}
      </EndpointProvider>
    </ModelProvider>
  );
};
