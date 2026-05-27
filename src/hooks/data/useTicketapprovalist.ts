import { useQuery } from '@tanstack/react-query';
import { useApprovaluserList } from './useApprovaluserlist';
import {
  TicketApprovalQueries,
  TicketApprovalServices,
} from '@/integrations/Services/ticketApprovalServices';

export const useTicketApproval = (session: Session) => {
  const { data: userList } = useApprovaluserList(session);

  console.log(session);

  const allDependenciesLoaded = !!userList;

  return useQuery({
    queryKey: [TicketApprovalQueries.GET_TICKET_APPROVAL_USERID],
    queryFn: async () => {
      if (!allDependenciesLoaded) {
        throw new Error('Dependent data not loaded yet');
      }

      const response = await TicketApprovalServices.fetchgetallTicketApproval(
        session.userId
      );
      return response?.map((item: any) => {
        const match = userList.find(
          (a: any) => a.siteId === item.siteId
        );

        const approverLevel = match?.approverLevel ?? null;

        const approverstatus =
          (item.stateName === 'Closed' && approverLevel === 1) ||
          (approverLevel === 2 && item.currentLevel !== null);

        return {
          ...item,

          priority:
            item.priority === 1
              ? 'Low'
              : item.priority === 2
                ? 'Medium'
                : 'High',

          tickets: item.ticketCode,

          approverLevel,

          approverstatus,

          currentLevelstatus:
            item.currentLevel > 0
              ? `${item.currentLevel} Approved`
              : item.currentLevel < 0
                ? 'Reassigned'
                : null,

          assignedBy: item.assignedBy ?? '-',
        };
      });
    },
   
    enabled: allDependenciesLoaded,
  });
};