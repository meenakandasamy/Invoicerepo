import { useQuery } from '@tanstack/react-query';
import { useApproverCategory } from './useApproverCategory';
import { useApproverStatus } from './useApproverStatus';
import { useCostCenters } from './useCostCenter';
import { useCostHeaders } from './useCostHeader';
import { useUserList } from './useUserList';
import type { Row } from '@/types/table';
import {
  ApproverCreationQuery,
  approvalCreationAPIs,
} from '@/integrations/Services/approverCreationServices';
import { formatDate } from '@/utils/common/DateUtil';

export const useApproverCreation = (session: Session) => {
  const { data: costCenters } = useCostCenters();
  const { data: costHeaders } = useCostHeaders();
  const { data: userList } = useUserList(session);
  const { data: categoryData } = useApproverCategory();
  const { data: status } = useApproverStatus();

  const allDependenciesLoaded =
    !!costCenters && !!costHeaders && !!userList && !!categoryData && !!status;
  function groupApprovers(data: any) {
    const map: any = {};
    const zerothLevelMap: Record<number, any> = {};

    data.forEach((item: Row) => {
      if (item.levelId === 0) {
        const approver = {
          userId: item.userId,
          levelId: '0',
          approverLevelId: item.approverLevelId,
          userName: item.approverName,
          emailId: item.emailId,
          customerId: item.customerId,
          companyId: item.companyId,
        };

        if (!zerothLevelMap[item.categoryId]) {
          zerothLevelMap[item.categoryId] = [];
        }
        const isDuplicate = zerothLevelMap[item.categoryId].some(
          (u: any) => u.userId === item.userId,
        );
        if (!isDuplicate) {
          zerothLevelMap[item.categoryId].push(approver);
        }
      }
    });

    data.forEach((item: Row) => {
      const key = `${JSON.stringify(item.costCentreIds) || ''}_${JSON.stringify(item.costHeaderIds) || ''}_${item.categoryId || ''}`;
      if (!map[key]) {
        map[key] = {
          costCentreIds: item.costCentreIds,
          costHeaderIds: item.costHeaderIds,
          categoryId: item.categoryId,

          costCentreName:
            costCenters?.filter((centre: { costCentreId: any }) =>
              item.costCentreIds.includes(centre.costCentreId),
            )[0]?.costCentreName || '',
          costHeaderName:
            costHeaders?.filter((header: { costHeaderId: any }) =>
              item.costHeaderIds.includes(header.costHeaderId),
            )[0]?.costHeaderName || '',
          categoryName:
            categoryData?.filter(
              (category: { categoryId: any }) =>
                item.categoryId === category.categoryId,
            )[0]?.categoryName || '',

          approverDetails: [],
          approverBackup: [],
        };
        if (zerothLevelMap[item.categoryId]) {
          map[key].approverDetails.push(...zerothLevelMap[item.categoryId]);
          map[key].approverBackup.push(...zerothLevelMap[item.categoryId]);
        }
      }

      console.log(item, 'itemTest');

      if (item.levelId !== 0 && item.levelId !== null) {
        const existingApprover = {
          userId: item.userId,
          levelId: item.levelId?.toString(),
          approverLevelId: item.approverLevelId,
          userName: item.approverName,
          emailId: item.emailId,
          customerId: item.customerId,
          companyId: item.companyId,
        };
        map[key].approverDetails.push(existingApprover);
        map[key].approverBackup.push(existingApprover);
      }
    });

    // Now format each grouped item
    const result = Object.values(map).map((group: any) => {
      // sort by levelId ASC
      group.approverDetails.sort(
        (a: { levelId: number }, b: { levelId: number }) =>
          a.levelId - b.levelId,
      );

      group.approverDetails.forEach(
        (appr: { userName: any }, index: number) => {
          group[`approverName${appr.levelId}`] = appr.userName;
        },
      );
      console.log(group, 'groupTest');

      return group;
    });

    return result;
  }

  function dependentLogic(response: Array<Row>) {
    try {
      const manipulatedData = response.map((item: any) => {
        const { status, userId, createdDate, lastUpdatedDate, ...rest } = item;
        const userDetails: any =
          userList && userList.find((user) => user.userId === userId);
        return {
          statusName: status === 1 ? 'Active' : 'Inactive',
          userName: userDetails?.userName,
          userId: userId,
          formattedCreatedDate: formatDate(createdDate, 'yyyy-mm-dd'),
          formattedLastUpdatedDate: formatDate(lastUpdatedDate, 'yyyy-mm-dd'),
          status,
          ...rest,
        };
      });
      const groupedResponse = groupApprovers(manipulatedData);

      return groupedResponse;
    } catch (error) {
      console.error(error);
    }
  }

  return useQuery<Array<any>>({
    queryKey: [ApproverCreationQuery.GETALL_APPROVERS],
    queryFn: async () => {
      if (!allDependenciesLoaded) return [];

      try {
        const response = await approvalCreationAPIs.fetchAllApprovers();
        const responseData = dependentLogic(response);
        console.log(responseData, 'responseData');

        return responseData || [];
      } catch (error: any) {
        throw new Error(error?.message || 'Error fetching approvers');
      }
    },
    enabled: allDependenciesLoaded,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    meta: {
      successMessage: 'Approver data fetched successfully',
      toastSuccess: false,
      errorMessage: 'Failed to fetch approver data',
    },
  });
};
