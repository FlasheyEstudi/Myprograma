import { useAuth } from '@/stores/auth.store';

export const useIsAuthenticated = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};

export const useCurrentUser = () => {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
};

export const useIsAdmin = () => {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  return { isAdmin, isLoading };
};

export const useIsSuperAdmin = () => {
  const { user, isLoading } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  return { isSuperAdmin, isLoading };
};