import { baseUrl } from './baseUrl';

export enum ApproverCreationQuery {
  GETALL_APPROVERS = 'getAllApprovers',
  ADD_NEW_APPROVER = 'addNewApprover',
  UPDATE_APPROVER = 'updateExistApprover',
  DELETE_APPROVER = 'deleteApprover',
}

enum ApproverCreationEndPoints {
  getAllApprovers = import.meta.env.VITE_GET_ALL_LEVEL_APPROVERS,
  addNewApprover = import.meta.env.VITE_ADD_LEVEL_APPROVER,
  updateExistApprover = import.meta.env.VITE_UPDATE_LEVEL_APPROVER,
  deleteApprover = import.meta.env.VITE_DELETE_LEVEL_APPROVER,
}

const fetchAllApprovers = async () => {
  try {
    const response = await baseUrl.get(
      `${ApproverCreationEndPoints.getAllApprovers}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching approvers:', error);
    throw error;
  }
};

const addNewApprover = async (data: any) => {
  try {
    const response = await baseUrl.post(
      `${ApproverCreationEndPoints.addNewApprover}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error adding approver:', error);
    throw error;
  }
};

const updateExistApprover = async (data: any) => {
  const { approverLevelId } = data;
  try {
    const response = await baseUrl.put(
      `${ApproverCreationEndPoints.updateExistApprover}/${approverLevelId}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating approver:', error);
    throw error;
  }
};

const deleteApprover = async (approverLevelId: string) => {
  try {
    const response = await baseUrl.delete(
      `${ApproverCreationEndPoints.deleteApprover}/${approverLevelId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting approver:', error);
    throw error;
  }
};

export const approvalCreationAPIs = {
  fetchAllApprovers,
  addNewApprover,
  updateExistApprover,
  deleteApprover,
};
