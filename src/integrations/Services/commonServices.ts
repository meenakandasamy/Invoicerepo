import { Eirasaas_BaseUrl, baseUrl } from './baseUrl';

export enum EIRASAAS_API_QUERIES {
  GET_SITELIST_BY_USER = 'getSiteListByUser',
  GET_SITELIST_BY_COMPANY = 'getSiteListByCompany',
  GET_SITELIST_BY_CUSTOMER = 'getSiteListByCustomer',
  GET_USERS_BY_COMPANY_ID = 'getUsersByCompanyId',
  GET_USERS_DETAILS_BY_COMPANY_ID = 'getUsersDetailsByCompanyId',
  GET_USERS_BY_CUSTOMER_ID = 'getUsersByCustomerId',
  GET_ALL_PRODUCT_TYPE = 'GetproductType',
  GET_TICKET_TYPE = 'FetchTicketType',
  GET_TICKET_CATEGORY = 'FetchTicketCategory',
  GET_ALL_TICKET_CATEGORY = 'Getallcategory',
  GET_ALL_TICKET_STATE = 'Getticketstate',
  GET_USER_LIST_SITEID = 'GetuserlistbysiteId',
  GET_ALL_STATE_LIST = 'GetAllstatelist',
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
  GET_ALL_PRODUCT_TYPE = import.meta.env.VITE_GET_ALL_PRODUCT_TYPE,
  GET_TICKET_TYPE = import.meta.env.VITE_TICKET_TYPE_API,
  GET_TICKET_CATEGORY = import.meta.env.VITE_TICKET_CATEGORY_API,
  GET_ALL_TICKET_CATEGORY = import.meta.env.VITE_GET_ALL_CATEGORY_API,
  GET_ALL_TICKET_STATE = import.meta.env.VITE_TICKET_STATE_LIST,
  GET_USER_LIST_SITEID = import.meta.env.VITE_GET_USER_LIST_BY_SITE,
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
const FetchTicketCategory = async (customerId: string) => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_TICKET_CATEGORY}/${customerId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};
const FetchTicketType = async () => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_TICKET_TYPE}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};
const FetchAllcategory = async () => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_ALL_TICKET_CATEGORY}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};
const FetchAllstate = async () => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_ALL_TICKET_STATE}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching site dropdown:', error);
  }
};
const FetchAlluserlistbySiteid = async (id: any) => {
  try {
    const response = await Eirasaas_BaseUrl.get(
      `${EirasaasEndPoints.GET_USER_LIST_SITEID}/${id}`,
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
  FetchTicketCategory,
  FetchTicketType,
  FetchAllcategory,
  FetchAllstate,
  FetchAlluserlistbySiteid,
};
