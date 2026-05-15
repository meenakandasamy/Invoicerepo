import { baseUrl } from './baseUrl';

export enum ApproverCategoryQueries {
  GET_APPROVER_CATEGORY_DROPDOWN = 'getApproverCategoryDropdown',
}

enum ApproverCategoryEndpoints {
  getApproverCategoryDropdown = import.meta.env
    .VITE_GET_APPROVER_CATEGORY_DROPDOWN,
}

const fetchApproverCategoryDropdown = async () => {
  const response = await baseUrl.get(
    `${ApproverCategoryEndpoints.getApproverCategoryDropdown}`,
  );
  const data = response.data;
  return data;
};

export const ApproverCategoryServices = { fetchApproverCategoryDropdown };
