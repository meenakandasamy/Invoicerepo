import { baseUrl } from './baseUrl';
import { CostCentreServices } from './costCentreServices';
import { CostHeaderServices } from './costHeaderServices';
import { VendorServices } from './vendorServices';
import type { VendorAdvance } from '@/types/vendorAdvance';
import type {
  VendorAdvanceApprovalType,
  VendorAdvanceType,
} from '@/utils/Validators/schema/VendorAdvanceSchema';

export enum VendorAdvanceQueries {
  GET_ALL = 'getAllVendorAdvances',
  GET_BY_ID = 'getVendorAdvanceById',
  CREATE = 'createVendorAdvance',
  UPDATE = 'updateVendorAdvance',
  APPROVE = 'approveVendorAdvance',
  REJECT = 'rejectVendorAdvance',
  GET_LOGS_BY_ID = 'getVendorAdvanceLogsById',
  GET_BY_VENDOR_ID_DROPDOWN = 'getVendorAdvanceByVendorId',
  GET_BY_COST_IDS = 'getVendorAdvanceByCostIds',
  GET_BY_COST_IDS_FOR_ADMIN = 'getVendorAdvanceByCostIdsForAdmin',
  GET_BYORG_ID = 'getVendorAdvanceByOrgd',
}

enum VendorAdvanceEndpoints {
  GET_ALL = import.meta.env.VITE_GET_ALL_VENDOR_ADVANCE,
  GET_BY_ID = import.meta.env.VITE_GET_VENDOR_ADVANCE_BY_ID,
  CREATE = import.meta.env.VITE_CREATE_VENDOR_ADVANCE,
  UPDATE = import.meta.env.VITE_UPDATE_VENDOR_ADVANCE,
  APPROVE = import.meta.env.VITE_APPROVE_VENDOR_ADVANCE,
  REJECT = import.meta.env.VITE_REJECT_VENDOR_ADVANCE,
  GET_LOGS_BY_ID = import.meta.env.VITE_VENDOR_ADVANCE_LOGS_BY_ID,
  GET_BY_VENDOR_ID_DROPDOWN = import.meta.env
    .VITE_GET_VENDOR_ADVANCE_BY_VENDOR_ID,
  GET_BY_COST_IDS = import.meta.env.VITE_GET_VENDOR_ADVANCE_BY_COST_IDS,
  GET_BY_COST_IDS_FOR_ADMIN = import.meta.env
    .VITE_GET_VENDOR_ADVANCE_BY_COST_IDS_FOR_ADMIN,
  getVendorAdvanceByOrgd = import.meta.env.VITE_GET_VENDOR_ADVANCE_BY_ORG_ID,
}

// -------------------------------------------
// CRUD SERVICE METHODS FOR VENDOR ADVANCE
// -------------------------------------------

// GET ALL
const fetchAllVendorAdvances = async () => {
  const response = await baseUrl.get(`${VendorAdvanceEndpoints.GET_ALL}`);
  return response.data;
};
const fetchVendorAdvanceByOrgd = async (orgId: string | number) => {
  const response = await baseUrl.get(
    `${VendorAdvanceEndpoints.getVendorAdvanceByOrgd}/${orgId}`,
  );
  return response.data;
};

// GET SINGLE BY ID
const fetchVendorAdvanceById = async (id: string | number) => {
  try {
    const costCentres = await CostCentreServices.fetchCostCentreDropdown();
    const costHeaders = await CostHeaderServices.fetchCostHeaderDropdown();
    const vendor = await VendorServices.FetchAllVendorsDropdown();
    const response = await baseUrl.get(
      `${VendorAdvanceEndpoints.GET_BY_ID}/${id}`,
    );
    const currVendor = vendor.find(
      (v: any) => v.vendorId === response.data.vendorId,
    );

    const result = {
      ...response.data,
      vendorName: currVendor?.vendorName ?? null,
      vendorEmail: currVendor?.emailId ?? null,
      vendorCode: currVendor?.vendorCode ?? null,
      gstStatus: currVendor?.gstNo ? 'Registered' : 'Unregistered',
      costCentreNames: costCentres
        .filter((item: any) =>
          response.data.costCentreIds?.includes(item.costCentreId),
        )
        .map((item: any) => item.costCentreName),

      costHeaderNames: costHeaders
        .filter((item: any) =>
          response.data.costHeaderIds?.includes(item.costHeaderId),
        )
        .map((item: any) => item.costHeaderName),
    };
    console.log(result);

    return result;
  } catch (error: any) {
    console.error('Error fetching vendor by ID:', error.message);
    throw error;
  }
};

// CREATE
const createVendorAdvance = async (payload: VendorAdvanceType) => {
  const response = await baseUrl.post(
    `${VendorAdvanceEndpoints.CREATE}`,
    payload,
  );
  return response.data;
};

// UPDATE
const updateVendorAdvance = async (
  id: string | number,
  payload: Partial<VendorAdvanceType>,
) => {
  const response = await baseUrl.put(
    `${VendorAdvanceEndpoints.UPDATE}/${id}`,
    payload,
  );
  return response.data;
};

// GET BY VENDOR ID DROPDOWN
const fetchVendorAdvanceDropDownByVendorId = async (id: string | number) => {
  const response = await baseUrl.get(
    `${VendorAdvanceEndpoints.GET_BY_VENDOR_ID_DROPDOWN}/${id}`,
  );
  const formattedData = response.data.map((item: VendorAdvance) => ({
    ...item,
    label: `${item.vendorAdvanceCode} - ${item.amountApproved}`,
  }));

  return formattedData;
};

// GET EXPENSES BY COST IDS
// Example usage: costCentreIds=[3], costHeaderIds=[1]
const fetchVendorAdvanceByCostIds = async (
  costCentreIds: Array<number>,
  costHeaderIds: Array<number>,
  createdBy?: number,
) => {
  const params = new URLSearchParams();
  params.append('costCentreIds', costCentreIds.join(','));
  params.append('costHeaderIds', costHeaderIds.join(','));
  if (createdBy) params.append('createdBy', createdBy.toString());

  const response = await baseUrl.get(
    `${VendorAdvanceEndpoints.GET_BY_COST_IDS}?${params.toString()}`,
  );
  return response.data;
};

// GET EXPENSES BY COST IDS FOR ADMIN
const fetchExpensesByCostIdsForAdmin = async (
  costCentreIds: Array<number>,
  costHeaderIds: Array<number>,
  createdBy?: number,
) => {
  const params = new URLSearchParams();
  params.append('costCentreIds', costCentreIds.join(','));
  params.append('costHeaderIds', costHeaderIds.join(','));
  if (createdBy) params.append('createdBy', createdBy.toString());

  const response = await baseUrl.get(
    `${VendorAdvanceEndpoints.GET_BY_COST_IDS_FOR_ADMIN}?${params.toString()}`,
  );
  return response.data;
};

// -------------------------------------------
// APPROVE/REJECT SERVICE METHODS FOR VENDOR ADVANCE
// -------------------------------------------

// APPROVE
const approveVendorAdvance = async (payload: VendorAdvanceApprovalType) => {
  const response = await baseUrl.post(
    `${VendorAdvanceEndpoints.APPROVE}`,
    payload,
  );
  return response.data;
};

// REJECT
const rejectVendorAdvance = async (payload: VendorAdvanceApprovalType) => {
  const response = await baseUrl.post(
    `${VendorAdvanceEndpoints.REJECT}`,
    payload,
  );
  return response.data;
};

// -------------------------------------------
// Vendor Advance Logs Service
// -------------------------------------------

const fetchVendorAdvanceLogsById = async (id: string | number) => {
  const response = await baseUrl.get(
    `${VendorAdvanceEndpoints.GET_LOGS_BY_ID}/${id}`,
  );
  return response.data;
};

export const VendorAdvanceServices = {
  fetchAllVendorAdvances,
  fetchVendorAdvanceByOrgd,
  fetchVendorAdvanceById,
  createVendorAdvance,
  updateVendorAdvance,
  approveVendorAdvance,
  rejectVendorAdvance,
  fetchVendorAdvanceLogsById,
  fetchVendorAdvanceDropDownByVendorId,
  fetchVendorAdvanceByCostIds,
  fetchExpensesByCostIdsForAdmin,
};
