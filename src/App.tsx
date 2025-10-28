import React from 'react';
import { AppRoutes } from './routes/AppRoutes';
import './global.css';

const App: React.FC = () => {
  // Component này chỉ cần render AppRoutes
  return (
    <AppRoutes />
  );
};

export default App;