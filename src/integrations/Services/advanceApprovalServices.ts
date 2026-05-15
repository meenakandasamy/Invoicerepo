import { baseUrl } from './baseUrl';

export enum advanceApprovalQueries {
  getAllApprovalListsQueries = 'getAllApprovalLists',
  getAdvanceApprovalByRelationId = 'getAdvanceApprovalByRelationId',
  getAdvanceRequestByUserId = 'getAdvanceRequestByUserId',
  getPurchaseListQueryByAdvId = 'getPurchaseListByAdvId',
}

const advanceApprovalEndPoints = {
  getAllApprovalLists: import.meta.env.VITE_GET_ALL_ADVANCE_APPROVERLIST,
  addNewAdvanceApproval: import.meta.env.VITE_ADD_NEW_ADVANCE_APPROVAL,
  updateAvdanceApproval: import.meta.env
    .VITE_PUT_ADVANCE_APPROVAL_BY_APPROVALID,
  getAdvanceApprovalByRelationId: import.meta.env
    .VITE_GET_ADVANCE_REQUESTS_BY_RELATION,
  rejectAdvanceRequest: import.meta.env.VITE_PUT_REJECT_ADVANCE_APPROVAL,
  approveAdvanceRequest: import.meta.env.VITE_PUT_APPROVE_ADVANCE_APPROVAL,
  getAdvanceRequestByUserId: import.meta.env
    .VITE_GET_ADVANCE_REQUESTS_BY_USERID,
  getPurchaseListByAdvId: import.meta.env.VITE_GET_PURCHASELIST_BY_ADVANCE_ID,
};
const getAllApprovalLists = async () => {
  try {
    const response = await baseUrl.get(
      advanceApprovalEndPoints.getAllApprovalLists,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching approval list:', error);
    throw error;
  }
};
const addNewAdvanceApproval = async (data: any) => {
  try {
    const response = await baseUrl.post(
      advanceApprovalEndPoints.addNewAdvanceApproval,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error adding approval list:', error);
    throw error;
  }
};
const updateExistingAdvanceApproval = async (data: any) => {
  try {
    const { advApprovalId } = data;
    const response = await baseUrl.put(
      `${advanceApprovalEndPoints.updateAvdanceApproval}/${advApprovalId}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating approval list:', error);
    throw error;
  }
};

const fetchAdvanceRequestByRelationId = async (relationId: string) => {
  try {
    const response = await baseUrl.get(
      `${advanceApprovalEndPoints.getAdvanceApprovalByRelationId}/${relationId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating approval list:', error);
    throw error;
  }
};

const fetchAdvanceRequestByUserId = async (userId: string) => {
  try {
    const response = await baseUrl.get(
      `${advanceApprovalEndPoints.getAdvanceRequestByUserId}/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating approval list:', error);
    throw error;
  }
};

const rejectAdvanceRequest = async (data: any) => {
  try {
    const response = await baseUrl.put(
      `${advanceApprovalEndPoints.rejectAdvanceRequest}/${data.id}`,
      data.comment,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating approval list:', error);
    throw error;
  }
};

const approveAdvanceRequest = async (data: any) => {
  try {
    const response = await baseUrl.put(
      `${advanceApprovalEndPoints.approveAdvanceRequest}/${data.id}`,
      data.comment,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating approval list:', error);
    throw error;
  }
};

const getPurchaseListByAdvId = async (advId: string) => {
  try {
    const response = await baseUrl.get(
      `${advanceApprovalEndPoints.getPurchaseListByAdvId}/${advId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating approval list:', error);
    throw error;
  }
};
export const advanceApprovalServices = {
  getAllApprovalLists,
  addNewAdvanceApproval,
  updateExistingAdvanceApproval,
  fetchAdvanceRequestByRelationId,
  rejectAdvanceRequest,
  approveAdvanceRequest,
  fetchAdvanceRequestByUserId,
  getPurchaseListByAdvId,
};
