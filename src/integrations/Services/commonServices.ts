import { Eirasaas_BaseUrl,baseUrl } from './baseUrl';

export enum EIRASAAS_API_QUERIES {
  GET_SITELIST_BY_USER = 'getSiteListByUser',
  GET_SITELIST_BY_COMPANY = 'getSiteListByCompany',
  GET_SITELIST_BY_CUSTOMER = 'getSiteListByCustomer',
  GET_USERS_BY_COMPANY_ID = 'getUsersByCompanyId',
  GET_USERS_DETAILS_BY_COMPANY_ID = 'getUsersDetailsByCompanyId',
  GET_USERS_BY_CUSTOMER_ID = 'getUsersByCustomerId',
  GET_ALL_PRODUCT_TYPE= 'GetproductType',
}
enum EirasaasEndPoints {
  GET_SITELIST_BY_USER = import.meta.env
    .VITE_EIRASAAS_SITELIST_DROPDOWN_BY_USER_ID,
  GET_SITELIST_BY_COMPANY = import.meta.env
    .VITE_EIRASAAS_SITELIST_DROPDOWN_BY_COMPANY_ID,
  GET_SITELIST_BY_CUSTOMER = import.meta.env
    .VITE_EIRASAAS_SITELIST_DROPDOWN_BY_CUSTOMER_ID,
  GET_USERS_BY_COMPANY_ID = import.meta.env
    .VITE_EIRASAAS_GET_USERS_BY_COMPANY_ID,
  GET_USERS_DETAILS_BY_COMPANY_ID = import.meta.env
    .VITE_EIRASAAS_GET_USERS_DETAILS_BY_COMPANY_ID,
  GET_USERS_BY_CUSTOMER_ID = import.meta.env
    .VITE_EIRASAAS_GET_USERS_BY_CUSTOMER_ID,
     GET_ALL_PRODUCT_TYPE = import.meta.env
    .VITE_GET_ALL_PRODUCT_TYPE,
}

const GetSiteListDropdownByUser = async (userId: string) => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_SITELIST_BY_USER}/${userId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};
const GetproductType = async () => {
  try {
    const response = await baseUrl.get(
      `${EirasaasEndPoints.GET_ALL_PRODUCT_TYPE }`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};
const GetSiteListDropdownByCompany = async (companyId: string) => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_SITELIST_BY_COMPANY}/${companyId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};

const GetSiteListDropdownByCustomer = async (customerId: string) => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_SITELIST_BY_CUSTOMER}/${customerId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};
const FetchUsersByCompanyId = async (companyId: string) => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_USERS_BY_COMPANY_ID}/${companyId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};

const FetchUsersDetailsByCompanyId = async (companyId: string) => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_USERS_DETAILS_BY_COMPANY_ID}/${companyId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};

const FetchUsersByCustomerId = async (customerId: string) => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_USERS_BY_CUSTOMER_ID}/${customerId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};

export const EirasaasAPIs = {
  GetSiteListDropdownByCompany,
  GetSiteListDropdownByCustomer,
  GetSiteListDropdownByUser,
  FetchUsersByCompanyId,
  FetchUsersDetailsByCompanyId,
  FetchUsersByCustomerId,
  GetproductType
};
