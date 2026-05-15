import { useQuery } from '@tanstack/react-query';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useUserList } from './useUserList';
import {
  ApproverCreationQuery,
  approvalCreationAPIs,
} from '@/integrations/Services/approverCreationServices';

export const useApproverList = (session: Session) => {
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: userList } = useUserList(session);

  const allDependenciesLoaded = !!costCenters && !!costHeaders && !!userList;

  return useQuery<Array<any>, Error>({
    queryKey: [ApproverCreationQuery.GETALL_APPROVERS],
    queryFn: async () => {
      if (!allDependenciesLoaded) return [];
      try {
        const response = await approvalCreationAPIs.fetchAllApprovers();
        return response;
      } catch (error: any) {
        throw new Error(error?.message || 'Error fetching approvers');
      }
    },
  });
};
