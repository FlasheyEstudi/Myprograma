import { useState, useCallback } from 'react';
import { useNotifications } from '@/stores/notifications.store';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useApi = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const { addNotification } = useNotifications();

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    options?: {
      showSuccessNotification?: boolean;
      successMessage?: string;
      showErrorMessage?: boolean;
    }
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, isLoading: false, error: null });

      if (options?.showSuccessNotification) {
        addNotification({
          type: 'success',
          title: options.successMessage || 'Operación exitosa',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));

      if (options?.showErrorMessage !== false) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
        });
      }

      throw error;
    }
  }, [addNotification]);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};