import { baseUrl } from './baseUrl';
import { CostHeaderServices } from './costHeaderServices';
import { CostCentreServices } from './costCentreServices';
import type {
  VendorDTOType,
  VendorUpdateDTOType,
} from '@/utils/Validators/schema/VendorSchema';

export enum VendorQuery {
  GET_ALL_VENDORS = 'getAllVendors',
  GET_VENDOR_BY_COMPANY_ID = 'getVendorByCompanyId',
  GET_VENDOR_BY_CUSTOMER_ID = 'getVendorByCustomerId',
  GET_VENDOR_BY_ORG_ID = 'getVendorByOrgId',
  GET_VENDOR_BY_ID = 'getVendorById',
  GET_ALL_VENDOR_DROPDOWN = 'getAllVendorsDropdown',
  GET_ALL_APPROVED_VENDORS = 'getAllApprovedVendors',
  APPROVE_VENDOR = 'approveVendor',
  REJECT_VENDOR = 'rejectVendor',
  GET_VENDOR_LOGS_BY_ID = 'getVendorLogsById',
}

enum VendorEndpoints {
  getAllVendors = import.meta.env.VITE_GETALL_VENDORS,
  getVendorByCompanyId = import.meta.env.VITE_GET_VENDOR_BY_COMPANY_ID,
  getVendorByCustomerId = import.meta.env.VITE_GET_VENDOR_BY_CUSTOMER_ID,
  getVendorByOrgId = import.meta.env.VITE_GET_VENDOR_BY_ORG_ID,
  getVendorById = import.meta.env.VITE_GET_VENDOR_BY_ID,
  getAllVendorsDropdown = import.meta.env.VITE_GET_VENDOR_DROPDOWN,
  getAllApprovedVendors = import.meta.env.VITE_GETALL_APPROVED_VENDORS,
  addVendor = import.meta.env.VITE_ADD_VENDOR,
  updateVendor = import.meta.env.VITE_UPDATE_VENDOR_BY_ID,
  deleteVendor = import.meta.env.VITE_DELETE_VENDOR_BY_ID,
  generateVendorFormToken = import.meta.env.VITE_GENERATE_VENDOR_FORM_TOKEN,
  validateVendorFormToken = import.meta.env.VITE_VALIDATE_VENDOR_FORM_TOKEN,
  saveVendorForm = import.meta.env.VITE_ADD_VENDOR_FORM,
  approveVendor = import.meta.env.VITE_APPROVE_VENDOR,
  rejectVendor = import.meta.env.VITE_REJECT_VENDOR,
  getVendorLogsById = import.meta.env.VITE_GET_VENDOR_LOGS_BY_ID,
}

const FetchAllVendors = async () => {
  try {
    const response = await baseUrl.get(`${VendorEndpoints.getAllVendors}`);
    if (response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
  } catch (error: any) {
    console.error('Error fetching all vendors:', error.message);
    throw error;
  }
};

const FetchVendorByCompanyId = async (companyId: string | number) => {
  try {
    const response = await baseUrl.get(
      `${VendorEndpoints.getVendorByCompanyId}/${companyId}`,
    );
    if (response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
  } catch (error: any) {
    console.error('Error fetching vendor by company ID:', error.message);
    throw error;
  }
};

const FetchVendorByCustomerId = async (customerId: string | number) => {
  try {
    const response = await baseUrl.get(
      `${VendorEndpoints.getVendorByCustomerId}/${customerId}`,
    );
    if (response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
  } catch (error: any) {
    console.error('Error fetching vendor by customer ID:', error.message);
    throw error;
  }
};

const FetchVendorByOrgId = async (orgId: string | number) => {
  try {
    const response = await baseUrl.get(
      `${VendorEndpoints.getVendorByOrgId}/${orgId}`,
    );
    if (response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
  } catch (error: any) {
    console.error('Error fetching vendor by org ID:', error.message);
    throw error;
  }
};

const FetchVendorById = async (data: { vendorId: string | number }) => {
  try {
    const costCentres = await CostCentreServices.fetchCostCentreDropdown();
    const costHeaders = await CostHeaderServices.fetchCostHeaderDropdown();

    const response = await baseUrl.get(
      `${VendorEndpoints.getVendorById}/${data.vendorId}`,
    );

    const vendor = response.data;

    const result = {
      ...vendor,
      costCentreName: costCentres
        .filter((item: any) =>
          vendor.costCentreIds?.includes(item.costCentreId),
        )
        .map((item: any) => item.costCentreName),

      costHeaderName: costHeaders
        .filter((item: any) =>
          vendor.costHeaderIds?.includes(item.costHeaderId),
        )
        .map((item: any) => item.costHeaderName),
    };

    return result;
  } catch (error: any) {
    console.error('Error fetching vendor by ID:', error.message);
    throw error;
  }
};

const AddNewVendor = async (data: { vendor: VendorDTOType }) => {
  try {
    // console.log('Data Before Validation:', data.vendor);
    // const parsedData = Validator.parse(VendorSaveSchema, data.vendor);
    // if (!parsedData.success) {
    //   throw new Error(parsedData.error);
    // }
    const response = await baseUrl.post(
      `${VendorEndpoints.addVendor}`,
      data.vendor,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

const UpdateVendorById = async (data: {
  vendorId: string;
  vendor: VendorUpdateDTOType;
}) => {
  try {
    // console.log('Data Before Validation:', data.vendor);
    // const parsedData = Validator.parse(VendorUpdateSchema, data.vendor);
    // if (!parsedData.success) {
    //   throw new Error(parsedData.error);
    // }
    const response = await baseUrl.put(
      `${VendorEndpoints.updateVendor}/${data.vendorId}`,
      data.vendor,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};

const DeleteVendorById = async (data: { vendorId: string }) => {
  try {
    const response = await baseUrl.delete(
      `${VendorEndpoints.deleteVendor}/${data.vendorId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

const FetchAllVendorsDropdown = async () => {
  try {
    const response = await baseUrl.get(
      `${VendorEndpoints.getAllVendorsDropdown}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching vendors:', error.message);
    throw error;
  }
};

const FetchAllApprovedVendors = async () => {
  try {
    const response = await baseUrl.get(
      `${VendorEndpoints.getAllApprovedVendors}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all approved vendors:', error.message);
    throw error;
  }
};

const approveVendor = async (payload: any) => {
  const response = await baseUrl.post(
    `${VendorEndpoints.approveVendor}`,
    payload,
  );
  return response.data;
};

const rejectVendor = async (payload: any) => {
  const response = await baseUrl.post(
    `${VendorEndpoints.rejectVendor}`,
    payload,
  );
  return response.data;
};

const GenerateVendorFormToken = async (data: {
  userId: number;
  hashingKey: string;
  encryptionKey?: string;
}): Promise<{
  createdDate: string;
  lastUpdatedDate: string;
  vendorFormId: number;
  userId: number;
  hashingKey: string;
  isCompleted: boolean;
}> => {
  try {
    const response = await baseUrl.post(
      `${VendorEndpoints.generateVendorFormToken}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching vendors:', error.message);
    throw error;
  }
};

const ValidateVendorFormToken = async (data: {
  userId: number;
  hashingKey: string;
  encryptionKey?: string;
}): Promise<{
  isCompletedFlag: boolean;
}> => {
  try {
    const response = await baseUrl.post(
      `${VendorEndpoints.validateVendorFormToken}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching vendors:', error.message);
    throw error;
  }
};

interface SaveVendorFormData extends VendorDTOType {
  userId: number;
  hashingKey: string;
  encryptionKey: string;
}

const SaveVendorForm = async (data: SaveVendorFormData) => {
  try {
    const response = await baseUrl.post(
      `${VendorEndpoints.saveVendorForm}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error saving vendor form:', error);
    throw error;
  }
};

const fetchVendorLogsById = async (vendorId: string | number) => {
  try {
    const response = await baseUrl.get(
      `${VendorEndpoints.getVendorLogsById}/${vendorId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching vendor logs:', error.message);
    throw error;
  }
};

export const VendorServices = {
  FetchAllVendors,
  FetchVendorByCompanyId,
  FetchVendorByCustomerId,
  FetchVendorByOrgId,
  FetchAllApprovedVendors,
  FetchVendorById,
  AddNewVendor,
  UpdateVendorById,
  DeleteVendorById,
  FetchAllVendorsDropdown,
  approveVendor,
  rejectVendor,
  GenerateVendorFormToken,
  ValidateVendorFormToken,
  SaveVendorForm,
  fetchVendorLogsById,
};
