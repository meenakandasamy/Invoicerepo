import { baseUrl } from './baseUrl';

export enum approverSiteMapQuery {
  getAllApproverMappingBYCompany = 'getAllApproverMappingBYCompany',
  getAllApproverMappingBYCustomer = 'getAllApproverMappingBYCustomer',
}

const approverSiteMapEndPoints = {
  getAllApproverMappingBYCompany: import.meta.env
    .VITE_GETALL_MAPPING_BY_COMPANYID,
  getAllApproverMappingBYCustomer: import.meta.env
    .VITE_GETALL_MAPPING_BY_CUSTOMERID,
  siteMapPost: import.meta.env.VITE_POST_SITE_MAP_APPROVER,
  siteMappingPut: import.meta.env.VITE_PUT_SITE_MAP_APPROVER,
};

const getAllApproverMappingByCompany = async (companyId: string) => {
  try {
    const response = await baseUrl.get(
      `${approverSiteMapEndPoints.getAllApproverMappingBYCompany}/${companyId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching approver mapping:', error);
    throw error;
  }
};

const getAllApproverMappingByCustomer = async (customerId: string) => {
  try {
    const response = await baseUrl.get(
      `${approverSiteMapEndPoints.getAllApproverMappingBYCustomer}/${customerId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching approver mapping:', error);
    throw error;
  }
};

const PostMapSiteApprover = async (data: any) => {
  try {
    const response = await baseUrl.post(
      approverSiteMapEndPoints.siteMapPost,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error adding approver mapping:', error);
    throw error;
  }
};

const putApproverSiteMap = async (data: any) => {
  try {
    const { approverLevelId } = data;
    const response = await baseUrl.put(
      `${approverSiteMapEndPoints.siteMappingPut}/${approverLevelId}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating approver mapping:', error);
    throw error;
  }
};

const approverSiteMapServices = {
  getAllApproverMappingByCompany,
  getAllApproverMappingByCustomer,
  PostMapSiteApprover,
  putApproverSiteMap,
};
export default approverSiteMapServices;
