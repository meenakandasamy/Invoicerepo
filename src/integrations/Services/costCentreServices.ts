import { baseUrl } from './baseUrl';

export enum CostCentreQueries {
  GET_ALL_COST_CENTRE_MAPPINGS = 'getAllCostCentreMappings',
  GET_COST_CENTRE_DROPDOWN = 'getCostCentreDropdown',
  GET_COST_CENTRES_BY_LEVEL_AND_VENDOR = 'getCostCentresByLevelAndVendor',
  GET_COST_CENTRES_BY_VENDOR = 'getCostCentresByVendor',
  GET_COST_CENTRES_BY_COMPANY = 'getCostCentresByCompany',
  GET_COST_CENTRES_BY_CUSTOMER = 'getCostCentresByCustomer',
}

enum CostCentreEndpoints {
  getAllCostCentreMappings = import.meta.env.VITE_GETALL_COST_CENTRE_MAPPINGS,
  addCostCentreMapping = import.meta.env.VITE_ADD_COST_CENTRE_MAPPING,
  putCostCentreMapping = import.meta.env.VITE_UPDATE_COST_CENTRE_MAPPING_BY_ID,
  getCostCentreDropdown = import.meta.env.VITE_GET_COST_CENTRE_DROPDOWN,
  getCostCentresByLevelAndVendor = import.meta.env
    .VITE_GET_COST_CENTRES_BY_LEVEL_AND_VENDOR,
  getCostCentresByVendor = import.meta.env.VITE_GET_COST_CENTRES_BY_VENDOR,
  getCostCentresByCompany = import.meta.env.VITE_GET_COST_CENTRES_BY_COMPANY,
  getCostCentresByCustomer = import.meta.env.VITE_GET_COST_CENTRES_BY_CUSTOMER,
}

const fetchCostCentreDropdown = async () => {
  const response = await baseUrl.get(
    `${CostCentreEndpoints.getCostCentreDropdown}`,
  );
  return response.data;
};

const fetchAllCostCentreMappings = async () => {
  try {
    const response = await baseUrl.get(
      `${CostCentreEndpoints.getAllCostCentreMappings}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};

const fetchCostCentresByLevelAndVendor = async (
  levelId: number,
  vendorId: number,
) => {
  const params = new URLSearchParams({
    levelId: levelId.toString(),
    vendorId: vendorId.toString(),
  });

  const response = await baseUrl.get(
    `${CostCentreEndpoints.getCostCentresByLevelAndVendor}?${params.toString()}`,
  );
  return response.data;
};

const postCostCentreSiteMap = async (data: any) => {
  try {
    const response = await baseUrl.post(
      `${CostCentreEndpoints.addCostCentreMapping}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error posting cost centre mapping:', error);
    throw error;
  }
};

const putCostCentreSiteMap = async (data: any) => {
  try {
    const { costCentreId } = data;
    const response = await baseUrl.put(
      `${CostCentreEndpoints.putCostCentreMapping}/${costCentreId}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating cost centre mapping:', error);
    throw error;
  }
};

const fetchCostCentresByVendor = async (vendorId: number) => {
  const response = await baseUrl.get(
    `${CostCentreEndpoints.getCostCentresByVendor}/${vendorId}`,
  );
  return response.data;
};

const fetchCostCentresByCompany = async (companyId: number) => {
  const response = await baseUrl.get(
    `${CostCentreEndpoints.getCostCentresByCompany}/${companyId}`,
  );
  return response.data;
};

const fetchCostCentresByCustomer = async (customerId: number) => {
  const response = await baseUrl.get(
    `${CostCentreEndpoints.getCostCentresByCustomer}/${customerId}`,
  );
  return response.data;
};

export const CostCentreServices = {
  postCostCentreSiteMap,
  putCostCentreSiteMap,
  fetchCostCentreDropdown,
  fetchAllCostCentreMappings,
  fetchCostCentresByLevelAndVendor,
  fetchCostCentresByVendor,
  fetchCostCentresByCompany,
  fetchCostCentresByCustomer,
};
