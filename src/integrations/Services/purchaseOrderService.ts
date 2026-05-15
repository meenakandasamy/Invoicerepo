import { baseUrl } from './baseUrl';
import type {
  PurchaseOrderDTO,
  PurchaseOrderUpdateDTO,
} from '@/models/purchaseOrderDTO';
import {
  PurchaseOrderSaveSchema,
  PurchaseOrderUpdateSchema,
} from '@/utils/Validators/Schema/PurchaseOrderSchema';
import { Validator } from '@/utils/Validators/ValidatorData';

export enum PurchaseOrderQuery {
  GET_ALL_PURCHASE_ORDERS = 'getAllPurchaseOrders',
  GET_ALL_PO_DETAILS = 'getAllPoDetails',
  GET_PURCHASE_ORDER_BY_ID = 'getPurchaseOrderById',
  GET_ALL_PAYMENTTERMS = 'paymentterms',
  EDIT_PAYMENT = 'paymentUpdate',
  GET_ALL_POINSTALL = '  getAllPOInstallments',
  GET_YEARS_SUM = 'getYearsSum',
  GET_TOTAL_SUM = 'getTotalSum',
  GET_ALL_DASHBOARD = 'getAllDashboard',
}

enum PurchaseOrderEndpoints {
  getAllPoDetails = import.meta.env.VITE_GET_ALL_PO_DETAILS,
  getPurchaseOrderById = import.meta.env.VITE_GET_PURCHASE_ORDER_BY_ID,
  getYearsSum = import.meta.env.VITE_GET_YEARS_SUM,
  getTotalSum = import.meta.env.VITE_GET_TOTAL_SUM,
  getAllDashboard = import.meta.env.VITE_GET_ALL_DASHBOARD,
  addPurchaseOrder = import.meta.env.VITE_ADD_PURCHASE_ORDER,
  updatePurchaseOrder = import.meta.env.VITE_UPDATE_PURCHASE_ORDER_BY_ID,
  deletePurchaseOrder = import.meta.env.VITE_DELETE_PURCHASE_ORDER_BY_ID,
  paymentTerms = import.meta.env.VITE_GET_PT_DROPDOWN,
  paymentUpdate = import.meta.env.VITE_PAYMENT_UPDATE,
  getAllPOInstallments = import.meta.env.VITE_GET_ALL_PO_INSTALLMENTS,
}

const FetchAllPoDetails = async () => {
  try {
    const response = await baseUrl.get(
      `${PurchaseOrderEndpoints.getAllPoDetails}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching purchase order:', error.message);
    throw error;
  }
};

const FetchpaymentTerms = async () => {
  try {
    const response = await baseUrl.get(
      `${PurchaseOrderEndpoints.paymentTerms}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payment terms:', error.message);
    throw error;
  }
};

const FetchPurchaseOrderById = async (data: { purchaseOrderId: string }) => {
  try {
    const response = await baseUrl.get(
      `${PurchaseOrderEndpoints.getPurchaseOrderById}/${data.purchaseOrderId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching purchase order by id:', error.message);
    throw error;
  }
};
const fetchAllPOInstallments = async () => {
  try {
    const response = await baseUrl.get(
      `${PurchaseOrderEndpoints.getAllPOInstallments}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};
const FetchYearsSum = async (fromDate: string, toDate: string) => {
  try {
    const response = await baseUrl.get(
      `${PurchaseOrderEndpoints.getYearsSum}`,
      {
        params: { fromDate, toDate },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching years sum:', error.message);
    throw error;
  }
};

const FetchTotalSum = async () => {
  try {
    const response = await baseUrl.get(`${PurchaseOrderEndpoints.getTotalSum}`);

    return response.data[0];
  } catch (error: any) {
    console.error('Error fetching total sum:', error.message);
    throw error;
  }
};

const FetchAllDashboard = async (fromDate: string, toDate: string) => {
  try {
    const response = await baseUrl.get(
      `${PurchaseOrderEndpoints.getAllDashboard}`,
      {
        params: { fromDate, toDate },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all dashboard:', error.message);
    throw error;
  }
};

const AddNewPurchaseOrder = async (data: {
  purchaseOrder: PurchaseOrderDTO;
}) => {
  console.log(PurchaseOrderSaveSchema);

  try {
    const parsedData = Validator.parse(
      PurchaseOrderSaveSchema,
      data.purchaseOrder,
    );
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.post(
      `${PurchaseOrderEndpoints.addPurchaseOrder}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding purchase order:', error.message);
    throw error;
  }
};

const UpdatePurchaseOrderById = async (data: {
  purchaseOrderId: string;
  purchaseOrder: PurchaseOrderUpdateDTO;
}) => {
  try {
    const parsedData = Validator.parse(
      PurchaseOrderUpdateSchema,
      data.purchaseOrder,
    );
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.put(
      `${PurchaseOrderEndpoints.updatePurchaseOrder}/${data.purchaseOrderId}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating purchase order:', error.message);
    throw error;
  }
};
const updatePaymentById = async (data: any) => {
  try {
    const response = await baseUrl.put(
      `${PurchaseOrderEndpoints.paymentUpdate}/${data.poId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating purchase order:', error.message);
    throw error;
  }
};

const DeletePurchaseOrderById = async (data: { purchaseOrderId: string }) => {
  try {
    const response = await baseUrl.delete(
      `${PurchaseOrderEndpoints.deletePurchaseOrder}/${data.purchaseOrderId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting purchase order:', error.message);
    throw error;
  }
};

export const PurschaseOrderService = {
  FetchAllPoDetails,
  FetchpaymentTerms,
  FetchPurchaseOrderById,
  fetchAllPOInstallments,
  FetchYearsSum,
  FetchTotalSum,
  FetchAllDashboard,
  AddNewPurchaseOrder,
  UpdatePurchaseOrderById,
  DeletePurchaseOrderById,
  updatePaymentById,
};
