import { baseUrl } from './baseUrl';
import type {
  InventoryTransactionDTOType,
  InventoryTransactionUpdateDTOType,
} from '@/utils/Validators/Schema/InventoryTransactionSchema';
import {
  InventoryTransactionSaveSchema,
  InventoryTransactionUpdateSchema,
} from '@/utils/Validators/Schema/InventoryTransactionSchema';
import { Validator } from '@/utils/Validators/ValidatorData';

export enum InventoryTransactionQuery {
  GET_ALL_INVENTORY_TRANSACTIONS = 'getAllInventoryTransaction',
  GET_INVENTORY_TRANSACTION_BY_ID = 'getInventoryTransactionById',
  GET_INVT_TRANSACTION_BY_WAREHOUSE_ID = 'getInventoryTransactionByWarehouseId',
  GET_INVT_TRANSACTION_BY_SITE_ID = 'getInventoryTransactionBySiteId',
}
enum inventoryTransactionEndpoints {
  getAllInventoryTransaction = import.meta.env.VITE_GETALL_INVT_TRANSACTION,
  getInventoryTransactionId = import.meta.env.VITE_GET_INVT_TRANSACTION_BY_ID,
  getInventoryTransactionByWarehouseId = import.meta.env.VITE_GET_INVT_TRANSACTION_BY_WAREHOUSE_ID,
  getInventoryTransactionBySiteId = import.meta.env.VITE_GET_INVT_TRANSACTION_BY_SITE_ID,
  updateInventoryTransaction = import.meta.env.VITE_UPDATE_INVT_TRANSACTION_BY_ID,
  addInventoryTransaction = import.meta.env.VITE_ADD_INVT_TRANSACTION,
}
const FetchAllInventoryTransactions = async () => {
  try {
    const response = await baseUrl.get(`${inventoryTransactionEndpoints.getAllInventoryTransaction}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching inventoryTransactions:', error.message);
    throw error;
  }
};
const FetchInventoryTransactionById = async (data: { inventoryTransactionId: string }) => {
  try {
    const response = await baseUrl.get(
      `${inventoryTransactionEndpoints.getInventoryTransactionId}/${data.inventoryTransactionId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventory Transaction by id:', error.message);
    throw error;
  }
};

const FetchInventoryTransactionByWarehouseId = async (warehouseId: string) => {
  try {
    const response = await baseUrl.get(
      `${inventoryTransactionEndpoints.getInventoryTransactionByWarehouseId}/${warehouseId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventory Transactions by warehouse ID:', error.message);
    throw error;
  }
};
const FetchInventoryTransactionBySiteId = async (siteId: string) => {
  try {
    const response = await baseUrl.get(
      `${inventoryTransactionEndpoints.getInventoryTransactionBySiteId}/${siteId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventory Transactions by site ID:', error.message);
    throw error;
  }
};
const UpdateInventoryTransactionById = async (data: {
  inventoryTransactionId: string;
  inventoryTransaction: InventoryTransactionUpdateDTOType;
}) => {
  try {
    const parsedData = Validator.parse(InventoryTransactionUpdateSchema, data.inventoryTransaction);
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.put(
      `${inventoryTransactionEndpoints.updateInventoryTransaction}/${data.inventoryTransactionId}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating Inventory Transactions:', error.message);
    throw error;
  }
};

const AddNewInventoryTransaction = async (data: { inventoryTransaction: InventoryTransactionDTOType }) => {
  try {
    const parsedData = Validator.parse(InventoryTransactionSaveSchema, data.inventoryTransaction);
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    console.log(parsedData.data, 'parsedData');
    
    const response = await baseUrl.post(
      `${inventoryTransactionEndpoints.addInventoryTransaction}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding Inventory Transaction:', error.message);
    throw error;
  }
};

export const InventoryTransactionServices = {
  FetchAllInventoryTransactions,
  FetchInventoryTransactionByWarehouseId,
  FetchInventoryTransactionBySiteId,
  FetchInventoryTransactionById,
  UpdateInventoryTransactionById,
  AddNewInventoryTransaction,
};