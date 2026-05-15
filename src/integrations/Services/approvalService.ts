import { baseUrl } from '../Services/baseUrl';

export enum ApprovalQuery {
  GET_ALL_APPROVALS = 'getAllApprovals',
  GET_ALL_APPROVALS_DROPDOWN = 'getAllApprovalsDropdown',
  GET_REQUESTORCODE_DROPDOWN_BY_SITE = 'getRequestorCodeDropdownBySite',
  ADD_NEW_APPROVAL = 'addNewApproval',
  UPDATE_APPROVAL_BY_ID = 'updateApprovalById',
  DELETE_APPROVAL_BY_ID = 'deleteApprovalById',
  GET_APPROVAL_BY_ID = 'getApprovalById',
  GET_PURCHASELIST_BY_REQID = 'getPurchaseByReqId',
  GET_APPROVAL_BY_USER_ID = 'getApprovalsByUserId',
  GET_APPROVAL_BY_RELATION_ID = 'getApprovalsByRelationId',
}

enum ApprovalEndPoints {
  getAllApprovals = import.meta.env.VITE_GETALL_APPROVAL_LIST,
  getAllApprovalsDropdown = import.meta.env.VITE_GET_APPROVAL_DROPDOWN,
  getRequestorCodeBySite = import.meta.env
    .VITE_GET_REQUESTORCODE_DROPDOWN_BY_SITE,
  addApproval = import.meta.env.VITE_ADD_NEW_APPROVAL,
  updateApproval = import.meta.env.VITE_UPDATE_APPROVAL_BY_ID,
  deleteApproval = import.meta.env.VITE_DELETE_APPROVAL_BY_ID,
  getApprovalById = import.meta.env.VITE_GET_APPROVAL_BY_ID,
  getPurchaseByReqId = import.meta.env.VITE_GET_PURCHASELIST_BY_REQID,
  getApprovalsByUserId = import.meta.env.VITE_GET_APPROVAL_BY_USER_ID,
  getApprovalsByRelationId = import.meta.env.VITE_GET_APPROVAL_BY_RELATION_ID,
  approvePoRequest = import.meta.env.VITE_PO_APPROVED,
  rejectPoRequest = import.meta.env.VITE_PO_REJECTED,
}

const fetchAllApprovals = async () => {
  const response = await baseUrl.get(`${ApprovalEndPoints.getAllApprovals}`);
  return response.data;
};

const fetchAllApprovalsDropdown = async () => {
  const response = await baseUrl.get(
    `${ApprovalEndPoints.getAllApprovalsDropdown}`,
  );
  return response.data;
};

const fetchRequestorCodeDropdownBySite = async (siteId: string) => {
  try {
    const response = await baseUrl.get(
      `${ApprovalEndPoints.getRequestorCodeBySite}/${siteId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching approval list:', error);
    throw error;
  }
};
const addNewApproval = async (data: any) => {
  const response = await baseUrl.post(`${ApprovalEndPoints.addApproval}`, data);
  return response.data;
};

const updateApprovalById = async (data: any) => {
  const { requestId } = data;
  const response = await baseUrl.put(
    `${ApprovalEndPoints.updateApproval}/${requestId}`,
    data,
  );
  return response.data;
};

const fetchApprovalsByRelationId = async (id: string) => {
  const response = await baseUrl.get(
    `${ApprovalEndPoints.getApprovalsByRelationId}/${id}`,
  );
  return response.data;
};

const approvePoRequest = async (data: any) => {
  const response = await baseUrl.put(
    `${ApprovalEndPoints.approvePoRequest}/${data.id}`,
    data.comment,
  );
  return response.data;
};

const rejectPoRequest = async (data: any) => {
  const response = await baseUrl.put(
    `${ApprovalEndPoints.rejectPoRequest}/${data.id}`,
    data.comment,
  );
  return response.data;
};

const deleteApprovalById = async (id: string) => {
  const response = await baseUrl.delete(
    `${ApprovalEndPoints.deleteApproval}/${id}`,
  );
  return response.data;
};

const fetchApprovalsByUserId = async (id: string) => {
  const response = await baseUrl.get(
    `${ApprovalEndPoints.getApprovalsByUserId}/${id}`,
  );
  return response.data;
};

const fetchApprovalById = async (id: string) => {
  const response = await baseUrl.get(
    `${ApprovalEndPoints.getApprovalById}/${id}`,
  );
  return response.data;
};

const fetchPurchaseByReqId = async (id: string) => {
  const response = await baseUrl.get(
    `${ApprovalEndPoints.getPurchaseByReqId}/${id}`,
  );
  return response.data;
};

export const ApprovalServices = {
  fetchAllApprovals,
  fetchAllApprovalsDropdown,
  fetchRequestorCodeDropdownBySite,
  addNewApproval,
  fetchApprovalsByRelationId,
  updateApprovalById,
  deleteApprovalById,
  fetchApprovalById,
  fetchPurchaseByReqId,
  fetchApprovalsByUserId,
  approvePoRequest,
  rejectPoRequest,
};
