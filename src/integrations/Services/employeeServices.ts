import { baseUrl } from './baseUrl';

export enum EmployeeQueries {
  GET_ALL_EMPLOYEE_REIMBURSEMENT = 'get_all_employee_reimbursement',
  GET_REIMBURSEMENT_BY_ORG_ID = 'get_reimbursement_by_org_id',
  CREATE_EMPLOYEE_REIMBURSEMENT = 'create_employee_reimbursement',
  GET_EMPLOYEE_REIMBURSEMENT_BY_ID = 'get_employee_reimbursement',
  UPDATE_EMPLOYEE_REIMBURSEMENT = 'update_employee_reimbursement',
  APPROVE_EMPLOYEE_REIMBURSEMENT = 'approve_employee_reimbursement',
  REJECT_EMPLOYEE_REIMBURSEMENT = 'reject_employee_reimbursement',
  GET_REIMBRUSHMENT_LOGS_BY_ID = 'get_reimbursement_logs_by_id',
  GET_REIMBRUSHMENT_SPLIT_BY_ID = 'get_reimbursement_split_by_id',

  //   Advance Queries

  GET_ALL_EMPLOYEE_ADVANCE = 'get_all_employee_advance',
  CREATE_EMPLOYEE_ADVANCE = 'create_employee_advance',
  GET_EMPLOYEE_ADVANCE_BY_ID = 'get_employee_advance',
  UPDATE_EMPLOYEE_ADVANCE = 'update_employee_advance',
  APPROVE_EMPLOYEE_ADVANCE = 'approve_employee_advance',
  REJECT_EMPLOYEE_ADVANCE = 'reject_employee_advance',
}

enum EmployeeEndpoints {
  getAllEmployeeReimbursement = import.meta.env
    .VITE_GET_ALL_EMPLOYEE_REIMBURSEMENT,
  get_reimbursement_by_org_id = import.meta.env
    .VITE_GET_REIMBURSEMENT_BY_ORG_ID,
  createEmployeeReimbursement = import.meta.env
    .VITE_CREATE_EMPLOYEE_REIMBURSEMENT,
  getEmployeeReimbursementById = import.meta.env
    .VITE_GET_EMPLOYEE_REIMBURSEMENT,
  updateEmployeeReimbursement = import.meta.env
    .VITE_UPDATE_EMPLOYEE_REIMBURSEMENT,
  approveReimbursement = import.meta.env.VITE_APPROVE_REIMBURSEMENT,
  rejectReimbursement = import.meta.env.VITE_REJECT_REIMBURSEMENT,
  getReimbursementLogsById = import.meta.env.VITE_GET_REIMBURSEMENT_LOGS_BY_ID,
  getReimbursementSplitById = import.meta.env
    .VITE_GET_REIMBURSEMENT_SPLIT_BY_ID,

  // Advance Endpoints

  getAllEmployeeAdvance = import.meta.env.VITE_GET_ALL_EMPLOYEE_ADVANCE,
  createEmployeeAdvance = import.meta.env.VITE_CREATE_EMPLOYEE_ADVANCE,
  getEmployeeAdvanceById = import.meta.env.VITE_GET_EMPLOYEE_ADVANCE,
  updateEmployeeAdvance = import.meta.env.VITE_UPDATE_EMPLOYEE_ADVANCE,
  approveAdvance = import.meta.env.VITE_APPROVE_ADVANCE,
  rejectAdvance = import.meta.env.VITE_REJECT_ADVANCE,
}

// ------------------------------- Reimbursement Services --------------------------------------

const FetchAllEmployeeReimbursement = async () => {
  try {
    const response = await baseUrl.get(
      `${EmployeeEndpoints.getAllEmployeeReimbursement}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all Employee Reimbursement:', error.message);
    throw error;
  }
};

const FetchReimbursementByOrgId = async (id: string | number) => {
  try {
    const response = await baseUrl.get(
      `${EmployeeEndpoints.get_reimbursement_by_org_id}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all Employee Reimbursement:', error.message);
    throw error;
  }
};

const fetchReimbursementById = async (id: string | number) => {
  const response = await baseUrl.get(
    `${EmployeeEndpoints.getEmployeeReimbursementById}/${id}`,
  );
  return response.data;
};

const createEmployeeReimbursement = async (payload: any) => {
  const response = await baseUrl.post(
    `${EmployeeEndpoints.createEmployeeReimbursement}`,
    payload,
  );
  return response.data;
};

const updateEmployeeReimbursement = async (
  id: string | number,
  payload: any,
) => {
  const response = await baseUrl.put(
    `${EmployeeEndpoints.updateEmployeeReimbursement}/${id}`,
    payload,
  );
  return response.data;
};

const approveReimbursement = async (payload: any) => {
  const response = await baseUrl.post(
    `${EmployeeEndpoints.approveReimbursement}`,
    payload,
  );
  return response.data;
};

const rejectReimbursement = async (payload: any) => {
  const response = await baseUrl.post(
    `${EmployeeEndpoints.rejectReimbursement}`,
    payload,
  );
  return response.data;
};

const fetchReimbrushmentLogsById = async (id: string | number) => {
  try {
    const response = await baseUrl.get(
      `${EmployeeEndpoints.getReimbursementLogsById}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching reimbrushment logs:', error);
    throw error;
  }
};

const fetchReimbrushmentSplitById = async (id: string | number) => {
  try {
    const response = await baseUrl.get(
      `${EmployeeEndpoints.getReimbursementSplitById}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// ------------------------------------ Advance Services ---------------------------------------------

const fetchAllEmployeeAdvance = async () => {
  try {
    const response = await baseUrl.get(
      `${EmployeeEndpoints.getAllEmployeeAdvance}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all Employee Advance:', error.message);
    throw error;
  }
};

const createEmployeeAdvance = async (payload: any) => {
  const response = await baseUrl.post(
    `${EmployeeEndpoints.createEmployeeAdvance}`,
    payload,
  );
  return response.data;
};

const fetchEmployeeAdvanceById = async (id: string | number) => {
  const response = await baseUrl.get(
    `${EmployeeEndpoints.getEmployeeAdvanceById}/${id}`,
  );
  return response.data;
};

const updateEmployeeAdvance = async (id: string | number, payload: any) => {
  const response = await baseUrl.put(
    `${EmployeeEndpoints.updateEmployeeAdvance}/${id}`,
    payload,
  );
  return response.data;
};

const approveAdvance = async (payload: any) => {
  const response = await baseUrl.post(
    `${EmployeeEndpoints.approveAdvance}`,
    payload,
  );
  return response.data;
};

const rejectAdvance = async (payload: any) => {
  const response = await baseUrl.post(
    `${EmployeeEndpoints.rejectAdvance}`,
    payload,
  );
  return response.data;
};

// Export Functions

export const EmployeeServices = {
  FetchAllEmployeeReimbursement,
  FetchReimbursementByOrgId,
  createEmployeeReimbursement,
  fetchReimbursementById,
  updateEmployeeReimbursement,
  approveReimbursement,
  rejectReimbursement,
  fetchReimbrushmentLogsById,
  fetchReimbrushmentSplitById,

  //   Advance Services

  fetchAllEmployeeAdvance,
  createEmployeeAdvance,
  fetchEmployeeAdvanceById,
  updateEmployeeAdvance,
  approveAdvance,
  rejectAdvance,
};
