import { baseUrl } from './baseUrl';
import type {
  CostHeaderDTOType,
  CostHeaderUpdateDTOType,
} from '@/utils/Validators/schema/costHeaderSchema';
import {
  CostHeaderSaveSchema,
  CostHeaderUpdateSchema,
} from '@/utils/Validators/schema/costHeaderSchema';
import { Validator } from '@/utils/Validators/ValidatorData';

export enum CostHeaderQueries {
  GET_ALL_COST_HEADERS = 'getAllCostHeaders',
  GET_COST_HEADER_DROPDOWN = 'getCostHeaderDropdown',
  GET_COST_HEADER_BY_ID = 'getCostHeaderById',
  GET_COST_HEADERS_BY_LEVEL_AND_VENDOR = 'getCostHeadersByLevelAndVendor',
  GET_COST_HEADERS_BY_VENDOR = 'getCostHeadersByVendor',
  GET_COST_HEADERS_BY_COMPANY = 'getCostHeadersByCompany',
  GET_COST_HEADERS_BY_CUSTOMER = 'getCostHeadersByCustomer',
}

enum CostHeaderEndpoints {
  getAllCostHeaders = import.meta.env.VITE_GETALL_COST_HEADER,
  getCostHeaderDropdown = import.meta.env.VITE_GET_COST_HEADER_DROPDOWN,
  getCostHeaderById = import.meta.env.VITE_GET_COST_HEADER_BY_ID,
  addCostHeader = import.meta.env.VITE_ADD_COST_HEADER,
  updateCostHeader = import.meta.env.VITE_UPDATE_COST_HEADER_BY_ID,
  getCostHeadersByLevelAndVendor = import.meta.env
    .VITE_GET_COST_HEADERS_BY_LEVEL_AND_VENDOR,
  getCostHeadersByVendor = import.meta.env.VITE_GET_COST_HEADERS_BY_VENDOR,
  getCostHeadersByCompany = import.meta.env.VITE_GET_COST_HEADERS_BY_COMPANY,
  getCostHeadersByCustomer = import.meta.env.VITE_GET_COST_HEADERS_BY_CUSTOMER,
}

const fetchCostHeaderDropdown = async () => {
  const response = await baseUrl.get(
    `${CostHeaderEndpoints.getCostHeaderDropdown}`,
  );
  return response.data;
};

const fetchAllCostHeaders = async () => {
  try {
    const response = await baseUrl.get(
      `${CostHeaderEndpoints.getAllCostHeaders}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost headers:', error.message);
    throw error;
  }
};

const fetchCostHeadersByLevelAndVendor = async (
  levelId: number,
  vendorId: number,
) => {
  const params = new URLSearchParams({
    levelId: levelId.toString(),
    vendorId: vendorId.toString(),
  });

  const response = await baseUrl.get(
    `${CostHeaderEndpoints.getCostHeadersByLevelAndVendor}?${params.toString()}`,
  );
  return response.data;
};

const postCostHeader = async (payload: any) => {
  const response = await baseUrl.post(
    `${CostHeaderEndpoints.addCostHeader}`,
    payload,
  );
  return response.data;
};

const putCostHeader = async (data: {
  costHeaderId: string;
  costHeader: CostHeaderUpdateDTOType;
}) => {
  try {
    const parsedData = Validator.parse(CostHeaderUpdateSchema, data.costHeader);
    if (!parsedData.success) throw new Error(parsedData.error);
    const response = await baseUrl.put(
      `${CostHeaderEndpoints.updateCostHeader}/${data.costHeaderId}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating cost header:', error.message);
    throw error;
  }
};

const fetchCostHeadersByVendor = async (vendorId: number) => {
  const response = await baseUrl.get(
    `${CostHeaderEndpoints.getCostHeadersByVendor}/${vendorId}`,
  );
  return response.data;
};

const fetchCostHeadersByCompany = async (companyId: number) => {
  const response = await baseUrl.get(
    `${CostHeaderEndpoints.getCostHeadersByCompany}/${companyId}`,
  );
  return response.data;
};

const fetchCostHeadersByCustomer = async (customerId: number) => {
  const response = await baseUrl.get(
    `${CostHeaderEndpoints.getCostHeadersByCustomer}/${customerId}`,
  );
  return response.data;
};

export const CostHeaderServices = {
  fetchCostHeaderDropdown,
  fetchAllCostHeaders,
  fetchCostHeadersByLevelAndVendor,
  fetchCostHeadersByVendor,
  postCostHeader,
  putCostHeader,
  fetchCostHeadersByCompany,
  fetchCostHeadersByCustomer,
};
