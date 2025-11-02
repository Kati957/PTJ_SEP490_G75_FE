import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

export const useAuth = () => {
  const { user, isAuthenticated, status } = useSelector((state: RootState) => state.auth);

  return {
    user,
    isAuthenticated,
    status,
  };
};
