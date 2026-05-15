import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      const status =
        error?.status ||
        error?.response?.status ||
        error?.data?.status;

      // Skip errors if it's a 404
      if (status === 404) return;
      let message = (error as Error).message || 'Something went wrong';
      if (query.meta?.errorMessage) message = query.meta.errorMessage as string;
      toast.error(message);
    },

    onSuccess: (_data: unknown, query) => {
      const successMessage = query.meta?.successMessage as string | undefined;
      const toastSuccess = query.meta?.toastSuccess as boolean | undefined;
      if (successMessage && toastSuccess) toast.success(successMessage);
    },
  }),
});

export function getContext() {
  return {
    queryClient,
  };
}

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
