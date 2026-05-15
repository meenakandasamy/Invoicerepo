import { baseUrl } from './baseUrl';
// import type { RentApprovalType } from '@/utils/Validators/schema/RentSchema';

export enum RentQueries {
  GET_RENT = 'getRent',
  CREATE_RENT = 'createRent',
  UPDATE_RENT = 'updateRent',
  DELETE_RENT = 'deleteRent',
  GET_RENT_BY_ID = 'getRentById',
  GET_LOGS_BY_ID = 'getRentLogsById',
  APPROVE_RENT = 'approveRent',
  REJECT_RENT = 'rejectRent',
  GET_RENT_BY_LEVEL = 'getRentByLevel',
  GET_RENT_BY_COST_IDS = 'getRentByCostIds',
  GET_RENT_BY_COST_IDS_FOR_ADMIN = 'getRentByCostIdsForAdmin',
}

enum RentEndpoints {
  getRent = import.meta.env.VITE_GET_RENT,
  createRent = import.meta.env.VITE_CREATE_RENT,
  updateRent = import.meta.env.VITE_UPDATE_RENT,
  deleteRent = import.meta.env.VITE_DELETE_RENT,
  getRentById = import.meta.env.VITE_GET_RENT_BY_ID,
  getRentLogsById = import.meta.env.VITE_GET_RENT_LOGS_BY_ID,
  approveRent = import.meta.env.VITE_APPROVE_RENT,
  rejectRent = import.meta.env.VITE_REJECT_RENT,
  getRentByLevel = import.meta.env.VITE_GET_RENT_BY_LEVEL,
  getRentByCostIds = import.meta.env.VITE_GET_RENT_BY_COST_IDS,
  getRentByCostIdsForAdmin = import.meta.env
    .VITE_GET_RENT_BY_COST_IDS_FOR_ADMIN,
}

// -------------------------------------------
// CRUD SERVICE METHODS FOR RENT
// -------------------------------------------

// GET ALL
const fetchRents = async () => {
  const response = await baseUrl.get(`${RentEndpoints.getRent}`);
  return response.data;
};

// GET SINGLE BY ID
const fetchRentById = async (id: string | number) => {
  const response = await baseUrl.get(`${RentEndpoints.getRentById}/${id}`);
  return response.data;
};

const fetchVendorRentLogsById = async (id: string | number) => {
  const response = await baseUrl.get(`${RentEndpoints.getRentLogsById}/${id}`);
  return response.data;
};

// GET RENTS BY LEVEL
const fetchRentsByLevel = async (level: string | number) => {
  const response = await baseUrl.get(
    `${RentEndpoints.getRentByLevel}/${level}`,
  );
  return response.data;
};

// GET RENTS BY COST IDS
const fetchRentsByCostIds = async (
  costCentreIds: Array<number>,
  costHeaderIds: Array<number>,
  createdBy?: number,
) => {
  const params = new URLSearchParams();
  params.append('costCentreIds', costCentreIds.join(','));
  params.append('costHeaderIds', costHeaderIds.join(','));
  if (createdBy) params.append('createdBy', createdBy.toString());

  const response = await baseUrl.get(
    `${RentEndpoints.getRentByCostIds}?${params.toString()}`,
  );
  return response.data;
};

// GET RENTS BY COST IDS FOR ADMIN
const fetchRentsByCostIdsForAdmin = async (
  costCentreIds: Array<number>,
  costHeaderIds: Array<number>,
  createdBy?: number,
) => {
  const params = new URLSearchParams();
  params.append('costCentreIds', costCentreIds.join(','));
  params.append('costHeaderIds', costHeaderIds.join(','));
  if (createdBy) params.append('createdBy', createdBy.toString());

  const response = await baseUrl.get(
    `${RentEndpoints.getRentByCostIdsForAdmin}?${params.toString()}`,
  );
  return response.data;
};

// CREATE
const createRent = async (payload: any) => {
  const response = await baseUrl.post(`${RentEndpoints.createRent}`, payload);
  return response.data;
};

// UPDATE
const updateRent = async (id: string | number, payload: any) => {
  const response = await baseUrl.put(
    `${RentEndpoints.updateRent}/${id}`,
    payload,
  );
  return response.data;
};

// DELETE
const deleteRent = async (id: string | number) => {
  const response = await baseUrl.delete(`${RentEndpoints.deleteRent}/${id}`);
  return response.data;
};

// -------------------------------------------
// CRUD SERVICE METHODS FOR RENT LOGS
// -------------------------------------------

// GET LOGS BY ID
const fetchRentLogsById = async (id: string | number) => {
  const response = await baseUrl.get(`${RentEndpoints.getRentLogsById}/${id}`);
  return response.data;
};

// -------------------------------------------
// APPROVE/REJECT SERVICE METHODS FOR RENT
// -------------------------------------------

const approveRent = async (payload: any) => {
  const response = await baseUrl.post(`${RentEndpoints.approveRent}`, payload);
  return response.data;
};

const rejectRent = async (payload: any) => {
  const response = await baseUrl.post(`${RentEndpoints.rejectRent}`, payload);
  return response.data;
};

export const RentServices = {
  fetchRents,
  fetchRentById,
  fetchVendorRentLogsById,
  fetchRentsByLevel,
  fetchRentsByCostIds,
  fetchRentsByCostIdsForAdmin,
  createRent,
  updateRent,
  deleteRent,
  fetchRentLogsById,
  approveRent,
  rejectRent,
};
