import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { getContext } from '@/integrations/tanstack-query/root-provider';

const { queryClient } = getContext();

export interface QueryConfig {
  queryKey: string;
  api: (data?: any) => Promise<any>;
  setState?: any;
  id?: string | object | number;
}

// Refetch queries
const refetchQuery = (queryKey: string) =>
  queryClient.refetchQueries({
    queryKey: [queryKey],
  });


// Invalidate queries
const invalidateQuery = (queryKey: string) =>
  queryClient.invalidateQueries({
    queryKey: [queryKey],
  });

  const applySetState = (
  setState: ((value: any) => void) | Array<(value: any) => void> | undefined,
  value: any
) => {
  if (!setState) return;
  if (Array.isArray(setState)) {
    setState.forEach((setter) => setter(value));
  } else {
    setState(value);
  }
};

const useQueryFn = (queryConfig: QueryConfig) => {
  const { queryKey, api, setState, id } = queryConfig;
  const { data, isLoading, isError } = useQuery({
    queryKey: id ? [queryKey, id] : [queryKey],
    queryFn: async () => {
      const response = await api(id);
      applySetState(setState, response);
      return response;
    },
    enabled: id ? !!id : true,
  });

  return { data, isLoading, isError };
};


// Multi-query hook
const useQueriesFn = (queryConfig: Array<QueryConfig>) => {
  const response = useQueries({
    queries: queryConfig.map(({ queryKey, api, setState, id }) => ({
      queryKey: id ? [queryKey, id] : [queryKey],
      queryFn: async () => {
        const responseData = await api(id);
        applySetState(setState, responseData);
        return responseData;
      },
      enabled: id ? !!id : true,
    })),
  });

  const isLoading = response.some((res) => res.isLoading);
  const isError = response.some((res) => res.isError);
  const status = response.map((res) => res.status);
  const data = response.map((res) => res.data);
  return { data, isLoading, status, isError };
};


const useQueriesFnWithId = (queryConfig: Array<QueryConfig>) => {
  const response = useQueries({
    queries: queryConfig.map(({ queryKey, api, setState, id }) => ({

      queryKey: [queryKey, id],
      queryFn: async () => {
        const responseData = await api(id);
        applySetState(setState, responseData);
        return responseData;
      },
      enabled: !!id,
    })),
  });
  const isLoading = response.some((res) => res.isLoading);
  const isError = response.some((res) => res.isError);
  return { response, isLoading, isError };
};


const useDependentQueries = (
  dependentStatus: Array<'success' | 'pending' | 'error'>,
  dependentResponse: Array<any>,
  dependentLogic: (response: any, response2: any) => any,
  queryConfig: Array<QueryConfig>,
) => {
  const isStatusSuccess = dependentStatus.every((status) => status === 'success');

  const response = useQueries({
    queries: queryConfig.map(({ queryKey, api, setState }) => ({
      queryKey: [queryKey],
      queryFn: async () => {
        const responseData = await api();
        const formattedData = dependentLogic(responseData, dependentResponse);
        applySetState(setState, formattedData);
        return formattedData;
      },
      enabled: isStatusSuccess,
    })),
  });

  const isLoading = isStatusSuccess && response.some((res) => res.isLoading);
  const isError = isStatusSuccess && response.some((res) => res.isError);
  const data = response.map((res) => res.data);

  return {
    response: isStatusSuccess ? data : [],
    isLoading,
    isError,
  };
};


const useDependentQueriesWithId = (
  dependentStatus: Array<'success' | 'pending' | 'error'>,
  dependentResponse: Array<any>,
  dependentLogic: (response: any, response2: any) => any,
  queryConfig: Array<QueryConfig>,
) => {
  const isStatusSuccess = dependentStatus.every((status) => status === 'success');

  const response = useQueries({
    queries: queryConfig.map(({ queryKey, api, setState, id }) => ({
      queryKey: [queryKey, id],
      queryFn: async () => {
        const responseData = await api(id);
        const formattedData = dependentLogic(responseData, dependentResponse);
        applySetState(setState, formattedData);
        return formattedData;
      },
      enabled: isStatusSuccess && !!id,
    })),
  });

  const isLoading = isStatusSuccess && response.some((res) => res.isLoading);
  const isError = isStatusSuccess && response.some((res) => res.isError);
  const data = response.map((res) => res.data);

  return {
    response: isStatusSuccess ? data : [],
    isLoading,
    isError,
  };
};

// Mutation hook
const useMutationFn = (api: any, refetch: any) => {
  const mutation = useMutation({
    mutationFn: (data: any) => api(data),
    onSuccess: () => {
      refetchQuery(refetch);
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
  return mutation;
};

export {
  useQueryFn,
  useMutationFn,
  useQueriesFn,
  useQueriesFnWithId,
  useDependentQueries,
  useDependentQueriesWithId,
  invalidateQuery,
  refetchQuery,
};
