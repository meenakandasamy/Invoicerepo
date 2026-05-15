import { baseUrl } from './baseUrl';

export enum poQueries {
  FETCH_PO_DROPDOWN_BY_VENDOR = 'fetchPODropdownByVendor',
  FETCH_PO_DOC_BY_PO_ID = 'fetchPoDocByPoId',
}

enum PoEndpoints {
  fetchPODropdownByVendor = import.meta.env.VITE_GET_PO_LIST_BY_VENDOR_ID,
  fetchPoDocByPoId = import.meta.env.VITE_GET_PO_DOC_BY_PO_ID,
}

const fetchPoDropdownByVendorId = async (id: string | number) => {
  const response = await baseUrl.get(
    `${PoEndpoints.fetchPODropdownByVendor}/${id}`,
  );
  return response.data;
};

const fetchPoDocByPoId = async (id: string | number) => {
  const response = await baseUrl.get(`${PoEndpoints.fetchPoDocByPoId}/${id}`);
  return response.data;
};

export const poServices = { fetchPoDropdownByVendorId, fetchPoDocByPoId };
