import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.is_staff) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};