import React, { useEffect } from 'react';
import { AppRouter } from './router/AppRouter.jsx';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { Toaster } from '../shared/components/ui/Toaster.jsx';

export const App = () => {
  const { token, checkAuth } = useAuth();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [checkAuth, token]);

  return (
    <>
      <Toaster />
      <AppRouter />
    </>
  );
};

export default App;
