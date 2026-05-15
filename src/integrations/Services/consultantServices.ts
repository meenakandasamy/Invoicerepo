import { baseUrl } from './baseUrl';

export enum ConsultantQueries {
  GET_All_Consultant_Salary = 'GET_All_CONSULTANT_SALARY',
  GET_Consultant_Salary_BY_ORG_ID = 'getConsultantSalaryByOrgId',
  Fetch_Consultant_Salary_By_Id = 'Fetch_Consultant_Salary_By_Id',
  CREATE_CONSULTANT_SALARY = 'CREATE_CONSULTANT_SALARY',
  UPDATE_CONSULTANT_SALARY = 'UPDATE_CONSULTANT_SALARY',
  APPROVE_CONSULTANT_SALARY = 'APPROVE_CONSULTANT_SALARY',
  REJECT_CONSULTANT_SALARY = 'REJECT_CONSULTANT_SALARY',
  GET_CONSULTANT_SALARY_LOGS_BY_ID = 'GET_CONSULTANT_SALARY_LOGS_BY_ID',
}

enum ConsultantEndpoints {
  getAllConsultantSalary = import.meta.env.VITE_GET_ALL_CONSULTANT_SALARY,
  getConsultantSalaryByOrgId = import.meta.env
    .VITE_GET_CONSULTANT_SALARY_BY_ORG_ID,
  getConsultantSalaryById = import.meta.env.VITE_GET_CONSULTANT_SALARY_BY_ID,
  createConsultantSalary = import.meta.env.VITE_CREATE_CONSULTANT_SALARY,
  updateConsultantSalary = import.meta.env.VITE_UPDATE_CONSULTANT_SALARY,
  approveConsultantSalary = import.meta.env.VITE_APPROVE_CONSULTANT_SALARY,
  rejectConsultantSalary = import.meta.env.VITE_REJECT_CONSULTANT_SALARY,
  getConsultantSalaryLogsById = import.meta.env
    .VITE_GET_CONSULTANT_SALARY_LOGS_BY_ID,
}

const fetchAllConsultantSalary = async () => {
  try {
    const response = await baseUrl.get(
      `${ConsultantEndpoints.getAllConsultantSalary}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching consultants:', error);
    throw error;
  }
};

const FetchReimbursementByOrgId = async (id: string | number) => {
  try {
    const response = await baseUrl.get(
      `${ConsultantEndpoints.getConsultantSalaryByOrgId}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all Employee Reimbursement:', error.message);
    throw error;
  }
};

const fetchConsultantSalaryById = async (id: number | string) => {
  try {
    const response = await baseUrl.get(
      `${ConsultantEndpoints.getConsultantSalaryById}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching consultants:', error);
    throw error;
  }
};

const createConsultantSalary = async (payload: any) => {
  try {
    const response = await baseUrl.post(
      `${ConsultantEndpoints.createConsultantSalary}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching consultants:', error);
    throw error;
  }
};

const updateConsultantSalary = async (id: number | string, payload: any) => {
  try {
    const response = await baseUrl.put(
      `${ConsultantEndpoints.updateConsultantSalary}/${id}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching consultants:', error);
    throw error;
  }
};

const approveConsultantSalary = async (payload: any) => {
  try {
    const response = await baseUrl.post(
      `${ConsultantEndpoints.approveConsultantSalary}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching consultants:', error);
    throw error;
  }
};

const rejectConsultantSalary = async (payload: any) => {
  try {
    const response = await baseUrl.post(
      `${ConsultantEndpoints.rejectConsultantSalary}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching consultants:', error);
    throw error;
  }
};

const fetchConsultantSalaryLogsById = async (id: number | string) => {
  try {
    const response = await baseUrl.get(
      `${ConsultantEndpoints.getConsultantSalaryLogsById}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching consultants:', error);
    throw error;
  }
};

export const ConsultantServices = {
  fetchAllConsultantSalary,
  FetchReimbursementByOrgId,
  fetchConsultantSalaryById,
  createConsultantSalary,
  updateConsultantSalary,
  approveConsultantSalary,
  rejectConsultantSalary,
  fetchConsultantSalaryLogsById,
};
