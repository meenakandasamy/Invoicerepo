import { useQuery } from '@tanstack/react-query';
import { useUserList } from './useUserList';
import {
  VendorQuery,
  VendorServices,
} from '@/integrations/Services/vendorServices';

export const useVendorLogs = (session: Session, id: string | number) => {
  const { data: userList } = useUserList(session);
  const allDependenciesLoaded = !!userList;

  return useQuery<Array<any>, Error>({
    queryKey: [VendorQuery.GET_VENDOR_LOGS_BY_ID, id],

    queryFn: async () => {
      if (!id || !allDependenciesLoaded) return [];

      try {
        const response = await VendorServices.fetchVendorLogsById(id);
        const sorted = [...response].sort((a, b) =>
          b.occuredOn.localeCompare(a.occuredOn),
        );
        return sorted.map((log) => {
          const formattedAction = log.action
            ? log.action.charAt(0).toUpperCase() +
              log.action.slice(1).toLowerCase()
            : '-';

          const occuredOn = new Date(log.occuredOn);
          const dateObj = new Date(occuredOn.getTime() + 5.5 * 60 * 60 * 1000);
          const formattedDate =
            `${String(dateObj.getDate()).padStart(2, '0')}-` +
            `${String(dateObj.getMonth() + 1).padStart(2, '0')}-` +
            `${dateObj.getFullYear()} ` +
            `${String(dateObj.getHours()).padStart(2, '0')}:` +
            `${String(dateObj.getMinutes()).padStart(2, '0')}`;

          const formattedChanges = log.changes
            ? (log.changes as string)
                // split by period followed by space, ignoring periods inside numbers
                .split(/\. (?=[A-Z0-9])/)
                .map((c) => c.trim())
                .filter((c) => c.length > 0)
                .map((c, i) => {
                  // ensure each line ends with a period
                  const line = c.endsWith('.') ? c : c + '.';
                  return `${i + 1}. ${line}`;
                })
                .join('\n')
            : '-';

          return {
            ...log,
            action: formattedAction,
            occuredOn: formattedDate,
            changes: formattedChanges,
            updatedByName:
              userList.find((user) => user.userId === log.updatedBy)
                ?.userName || '-',
          };
        });
      } catch (error: any) {
        throw new Error(error?.message || 'Error fetching vendor logs');
      }
    },
    enabled: !!id,
    retry: 1,
    meta: {
      successMessage: 'Vendor logs loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load vendor logs',
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
