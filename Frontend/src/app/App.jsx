import React, { useEffect } from 'react';
import { AppRouter } from './router/AppRouter.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';

export const App = () => {
  const { token, checkAuth } = useAuth();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, []);

  return <AppRouter />;
};

export default App;
