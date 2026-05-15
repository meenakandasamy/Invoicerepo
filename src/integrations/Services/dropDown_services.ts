import { baseUrl } from './baseUrl';

export enum dropDownApiQueries {
  GET_PAYMENT_TERM_DROPDOWN = 'getPaymentTermDropdown',
  GET_VENDOR_DROPDOWN = 'getVendorDropdown',
  GET_PRODUCTS_DROPDOWN_BY_VENDOR = 'getProductsDropdownByVendor',
  GET_WAREHOUSE_DROPDOWN = 'getWarehouseDropdown',
  GET_APPROVER_STATUS_DROPDOWN = 'getApproverStatusDropdown',
}
enum dropDownServiceEndPoints {
  getPaymentTermDropdown = import.meta.env.VITE_GET_PT_DROPDOWN,
  getVendorDropdown = import.meta.env.VITE_GET_VENDOR_DROPDOWN,
  getProductDropDown = import.meta.env.VITE_GET_PRODUCTS_DROPDOWN_BY_VENDOR,
  getWarehouseDropdown = import.meta.env.VITE_GET_WAREHOUSE_DROPDOWN,
  getApproverStatusDropdown = import.meta.env.VITE_GET_APPROVER_STATUS_DROPDOWN,
}

const FetchPaymentTermDropdown = async () => {
  const response = await baseUrl.get(
    `${dropDownServiceEndPoints.getPaymentTermDropdown}`,
  );
  return response.data;
};

const FetchVendorDropdown = async () => {
  try {
    const response = await baseUrl.get(
      `${dropDownServiceEndPoints.getVendorDropdown}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching vendor dropdown:', error.message);
    throw error;
  }
};

const GetProductsDropdownByVendor = async (vendorId: string | number) => {
  try {
    const response = await baseUrl.get(
      `${dropDownServiceEndPoints.getProductDropDown}/${vendorId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching vendor dropdown:', error.message);
    throw error;
  }
};
const FetchWarehouseDropdown = async () => {
  try {
    const response = await baseUrl.get(
      `${dropDownServiceEndPoints.getWarehouseDropdown}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouse dropdown:', error.message);
    throw error;
  }
};

const FetchApproverStatusDropdown = async () => {
  try {
    const response = await baseUrl.get(
      `${dropDownServiceEndPoints.getApproverStatusDropdown}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouse dropdown:', error.message);
    throw error;
  }
};

export const DropDownServices = {
  FetchPaymentTermDropdown,
  FetchVendorDropdown,
  GetProductsDropdownByVendor,
  FetchWarehouseDropdown,
  FetchApproverStatusDropdown,
};
