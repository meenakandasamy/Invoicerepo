import { baseUrl } from './baseUrl';
import type { LevelApproverDTO } from '@/models/levelApproverDTO';

export enum LevelApproverQuery {
  GET_ALL_LEVEL_APPROVERS = 'getAllLevelApprovers',
  GET_LEVEL_APPROVER_BY_ID = 'getLevelApproverById',
  ADD_LEVEL_APPROVER = 'addLevelApprover',
  EDIT_LEVEL_APPROVER = 'editLevelApprover',
  DELETE_LEVEL_APPROVER = 'deleteLevelApprover',
  GET_APPROVER_BY_COMPANY = 'getApproversByCompany',
  GET_APPROVER_BY_CUSTOMER = 'getApproversByCustomer',
  GET_APPROVER_BY_USER_ID = 'getApproversByUserId',
}

const getAllLevelApprovers = import.meta.env.VITE_GETALL_LEVEL_APPROVERS;
const getLevelApproverById = import.meta.env.VITE_GET_LEVEL_APPROVER_BY_ID;
const addLevelApprover = import.meta.env.VITE_ADD_LEVEL_APPROVER;
const updateLevelApprover = import.meta.env.VITE_UPDATE_LEVEL_APPROVER_BY_ID;
const deleteLevelApprover = import.meta.env.VITE_DELETE_LEVEL_APPROVER_BY_ID;
const getApproversByCompany = import.meta.env.VITE_GET_APPROVER_BY_COMPANY;
const getApproversByCustomer = import.meta.env.VITE_GET_APPROVER_BY_CUSTOMER;
const getApproversByUser = import.meta.env.VITE_GET_APPROVER_BY_USER_ID;

export const fetchAllLevelApprovers = async () => {
  try {
    const response = await baseUrl.get(`${getAllLevelApprovers}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching level approver:', error.message);
    throw error;
  }
};

export const fetchLevelApproverById = async (levelApproverId: string) => {
  try {
    const response = await baseUrl.get(
      `${getLevelApproverById}/${levelApproverId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching level approver by id:', error.message);
    throw error;
  }
};

export const addNewLevelApprover = async (data: LevelApproverDTO) => {
  try {
    const response = await baseUrl.post(`${addLevelApprover}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error adding level approver:', error.message);
    throw error;
  }
};

export const updateLevelApproverById = async (
  levelApproverId: string,
  data: LevelApproverDTO,
) => {
  try {
    const response = await baseUrl.put(
      `${updateLevelApprover}/${levelApproverId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating level approver:', error.message);
    throw error;
  }
};

export const deleteLevelApproverById = async (levelApproverId: string) => {
  try {
    const response = await baseUrl.delete(
      `${deleteLevelApprover}/${levelApproverId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting level approver:', error.message);
    throw error;
  }
};

const getApproversByCompanyId = async (id: string) => {
  try {
    const response = await baseUrl.get(`${getApproversByCompany}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting level approver:', error.message);
    throw error;
  }
};

const getApproversByCustomerId = async (id: string) => {
  try {
    const response = await baseUrl.get(`${getApproversByCustomer}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting level approver:', error.message);
    throw error;
  }
};

const getApproversByUserId = async (id: string) => {
  try {
    const response = await baseUrl.get(`${getApproversByUser}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching level approver:', error.message);
    throw error;
  }
};

export const levelApproverServices = {
  getApproversByCompanyId,
  getApproversByCustomerId,
  getApproversByUserId,
  fetchAllLevelApprovers,
  fetchLevelApproverById,
  addNewLevelApprover,
  updateLevelApproverById,
  deleteLevelApproverById,
};
