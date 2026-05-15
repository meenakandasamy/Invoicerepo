import { baseUrl } from './baseUrl';
import type { PurchaseListDTO } from '@/models/purchaseListDTO';

export enum PurchaseListQuery {
  GET_ALL_PURCHASE_LISTS = 'getAllPurchaseLists',
  GET_PURCHASE_LIST_BY_ID = 'getPurchaseListById',
  GET_PURCHASE_LIST_BY_REQID = 'getPurchaseListByReqId',
}

export const PurchaseEndPoints = {
  getAllPurchaseLists: import.meta.env.VITE_GETALL_PURCHASE_LISTS,
  getPurchaseListByReqId: import.meta.env.VITE_GET_PURCHASE_LIST_BY_REQID,
  getPurchaseListById: import.meta.env.VITE_GET_PURCHASE_LIST_BY_ID,
  addPurchaseList: import.meta.env.VITE_ADD_PURCHASE_LIST,
  updatePurchaseList: import.meta.env.VITE_UPDATE_PURCHASE_LIST_BY_ID,
  deletePurchaseList: import.meta.env.VITE_DELETE_PURCHASE_LIST_BY_ID,
};

const fetchAllPurchaseLists = async () => {
  try {
    const response = await baseUrl.get(
      `${PurchaseEndPoints.getAllPurchaseLists}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching purchase list:', error.message);
    throw error;
  }
};

const fetchPurchaseListByReqId = async (reqId: string) => {
  try {
    const response = await baseUrl.get(
      `${PurchaseEndPoints.getPurchaseListByReqId}/${reqId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching purchase list by req id:', error.message);
    throw error;
  }
};

const fetchPurchaseListById = async (purchaseListId: string) => {
  try {
    const response = await baseUrl.get(
      `${PurchaseEndPoints.getPurchaseListById}/${purchaseListId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching purchase list by id:', error.message);
    throw error;
  }
};

const addNewPurchaseList = async (data: PurchaseListDTO) => {
  try {
    const response = await baseUrl.post(
      `${PurchaseEndPoints.addPurchaseList}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding purchase list:', error.message);
    throw error;
  }
};

const updatePurchaseListById = async (
  purchaseListId: string,
  data: PurchaseListDTO,
) => {
  try {
    const response = await baseUrl.put(
      `${PurchaseEndPoints.updatePurchaseList}/${purchaseListId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating purchase list:', error.message);
    throw error;
  }
};

const deletePurchaseListById = async (purchaseListId: string) => {
  try {
    const response = await baseUrl.delete(
      `${PurchaseEndPoints.deletePurchaseList}/${purchaseListId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting purchase list:', error.message);
    throw error;
  }
};

export const purchaseListServices = {
  fetchAllPurchaseLists,
  fetchPurchaseListByReqId,
  fetchPurchaseListById,
  addNewPurchaseList,
  updatePurchaseListById,
  deletePurchaseListById,
};
