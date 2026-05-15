import { useQuery } from '@tanstack/react-query';
import { useApproverCategory } from './useApproverCategory';
import {
  LevelApproverQuery,
  levelApproverServices,
} from '@/integrations/Services/levelApproverServices';

export const useApproverDetails = (id: string | number) => {
  const { data: categoryData } = useApproverCategory();

  return useQuery<approverDropdownType, Error>({
    queryKey: [LevelApproverQuery.GET_APPROVER_BY_USER_ID],
    queryFn: async () => {
      try {
        const data = await levelApproverServices.getApproversByUserId(
          id as string,
        );
        const categoryNames = data.map((item: any) => {
          return (
            categoryData?.find((c) => c.categoryId === item.categoryId)
              ?.categoryName || ''
          );
        });
        const LevelIDs = data.map((item: any) => item.levelId);

        function getValidOrganizationId(arr: any) {
          const ids = arr
            .map((item: any) => item.organizationId)
            .filter((id: any) => id != null); // removes null & undefined

          if (ids.length === 0) return null;

          const firstId = ids[0];

          const allSame = ids.every((id) => id === firstId);

          return allSame ? firstId : null;
        }

        const organizationId = getValidOrganizationId(data);
        console.log(organizationId, 'organizationId');

        sessionStorage.setItem('levelId', data[0]?.levelId.toString());
        sessionStorage.setItem('levelIds', JSON.stringify(LevelIDs));
        sessionStorage.setItem('categoryName', JSON.stringify(categoryNames));
        sessionStorage.setItem('organizationId', organizationId || '1');

        const categoryLevelMap: Record<
          string,
          Record<
            number,
            { costCentreIds: Array<number>; costHeaderIds: Array<number> }
          >
        > = {};

        data.forEach((item: any) => {
          const categoryObj = categoryData?.find(
            (c) => c.categoryId === item.categoryId,
          );

          const categoryName = categoryObj?.categoryName || 'Unknown';
          const levelId = item.levelId;

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!categoryLevelMap[categoryName]) {
            categoryLevelMap[categoryName] = {};
          }

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!categoryLevelMap[categoryName][levelId]) {
            categoryLevelMap[categoryName][levelId] = {
              costCentreIds: [],
              costHeaderIds: [],
            };
          }

          categoryLevelMap[categoryName][levelId].costCentreIds = Array.from(
            new Set([
              ...categoryLevelMap[categoryName][levelId].costCentreIds,
              ...item.costCentreIds,
            ]),
          );

          categoryLevelMap[categoryName][levelId].costHeaderIds = Array.from(
            new Set([
              ...categoryLevelMap[categoryName][levelId].costHeaderIds,
              ...item.costHeaderIds,
            ]),
          );
        });

        // Save to sessionStorage
        sessionStorage.setItem(
          'levelCentreHeaderMap',
          JSON.stringify(categoryLevelMap),
        );

        const finalResult = combineApproverData(data);

        return finalResult;
      } catch (err: any) {
        console.error(err);
        throw new Error(err?.message || 'Error fetching approver details');
      }
    },
    enabled: !!id && !!categoryData,
    retry: 1,
    meta: {
      successMessage: 'Approver details loaded successfully!',
      toastSuccess: false,
      errorMessage: 'Failed to load approver details',
    },
  });
};

function combineApproverData(
  data: Array<approverDropdownType>,
): approverDropdownType {
  // Helper to merge arrays uniquely
  const mergeUnique = (arr: Array<number>) => [...new Set(arr.flat())];

  return {
    createdDate: data[0]?.createdDate,
    lastUpdatedDate: data[data.length - 1]?.lastUpdatedDate,
    approverLevelId: data[0]?.approverLevelId || 0,
    approverName: data[0]?.approverName || '',
    emailId: data[0]?.emailId || '',
    customerId: data[0]?.customerId || 0,
    createdBy: data[0]?.createdBy || 0,
    lastUpdatedBy: data[0]?.lastUpdatedBy || 0,
    status: data[0]?.status || 0,
    companyId: data[0]?.companyId || 0,
    userId: data[0]?.userId || 0,
    levelId: data[0]?.levelId || 0,
    costCentreIds: mergeUnique(
      data.map((i) => i.costCentreIds) as unknown as Array<number>,
    ),
    costHeaderIds: mergeUnique(
      data.map((i) => i.costHeaderIds) as unknown as Array<number>,
    ),
    categoryId: mergeUnique(data.map((i) => i.categoryId) as Array<number>),
  };
}
