import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

/**
 * Shared UI Component: Toaster
 * Global toast notification container with modern SaaS styling matching TeamSync design system.
 */
export const Toaster = () => {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{ zIndex: 99999 }}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#ffffff',
          color: '#0f172a',
          fontSize: '13px',
          fontWeight: 500,
          borderRadius: '12px',
          padding: '10px 14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
        error: {
          duration: 3500,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        loading: {
          iconTheme: {
            primary: '#4361ee',
            secondary: '#e0e7ff',
          },
        },
      }}
    />
  );
};

export default Toaster;

