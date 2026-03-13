import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/selectors';

export const usePermissions = () => {
  const user = useAppSelector(selectUser);

  return {
    isAdmin: user?.is_staff || false,
    isSuperuser: user?.is_superuser || false,
    canViewAllUsers: user?.is_staff || false,
    canEditUsers: user?.is_staff || false,
    canDeleteUsers: user?.is_superuser || false,
    canMakeAdmin: user?.is_superuser || false,
  };
};