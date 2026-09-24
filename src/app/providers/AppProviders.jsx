import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store.js';
import { QueryProvider } from './QueryProvider.jsx';

export const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <QueryProvider>
        {children}
      </QueryProvider>
    </Provider>
  );
};
