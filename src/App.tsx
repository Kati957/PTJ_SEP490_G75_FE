import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppRoutes } from './routes/AppRoutes';
import './global.css';
import { fetchMe, initializationComplete } from './features/auth/slice';
import type { AppDispatch } from './app/store';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchMe());
    } else {
      // Nếu không có token, báo cho slice biết là đã khởi tạo xong
      dispatch(initializationComplete());
    }
  }, [dispatch]);

  return (
    <AppRoutes />
  );
};

export default App;