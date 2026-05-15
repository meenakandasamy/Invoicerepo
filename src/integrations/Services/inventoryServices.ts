import { baseUrl } from './baseUrl';
import type {
  InventoryDTOType,
  InventoryUpdateDTOType,
} from '@/utils/Validators/Schema/InventorySchema';
import {
  InventorySaveSchema,
  InventoryUpdateSchema,
} from '@/utils/Validators/Schema/InventorySchema';
import { Validator } from '@/utils/Validators/ValidatorData';
import { formatDate } from '@/utils/common/DateUtil';

export enum InventoryQuery {
  GET_ALL_INVENTORIES = 'getAllInventories',
  GET_INVENTORY_BY_ID = 'getInventoryById',
  GET_LIST_BY_WAREHOUSE_ID = 'getInventoriesByWarehouseId',
  GET_ALL_INVT_BY_WAREHOUSE_ID = 'getAllInventoriesByWarehouseId',
  GET_ALL_INVT_BY_PRODUCT_ID = 'getAllInventoriesByProductId',
  GET_INVT_DROPDOWN='getInventoriesDropdown',
  GET_INVT_BY_WAREHOUSE_AND_PRODUCT_IDS='getInventoriesByWarehouseAndProductIds',
  GET_PRODUCTS_DROPDOWN_BY_WAREHOUSE_ID = 'getAllProductsByWarehouseId',
  
}
enum InventoryEndpoints {
  getAllInventory = import.meta.env.VITE_GETALL_INVENTORIES,
  getInventoryId = import.meta.env.VITE_GET_INVT_BY_ID,
  getInventoryDropdown = import.meta.env.VITE_GET_INVT_DROPDOWN,
  getAllInventoriesByWarehouseId = import.meta.env.VITE_GET_INVT_BY_WAREHOUSE_ID,
  getInvDetailsByWarehouseId = import.meta.env.VITE_GET_INVT_DETAILS_BY_WAREHOUSE_ID,
  getAllInventoriesByProductId = import.meta.env.VITE_GET_INVT_BY_PRODUCT_ID,
  getAllInventoriesByWarehouseAndProductIds = import.meta.env.VITE_GET_INVT_BY_WAREHOUSE_AND_PRODUCT_IDS,
  getProductsDropdownByWarehouseId = import.meta.env.VITE_GET_PRODUCTS_DROPDOWN_BY_WAREHOUSE_ID,
  updateInventory = import.meta.env.VITE_UPDATE_INVT_BY_ID,
  addInventory = import.meta.env.VITE_ADD_INVENTORY,
}
const FetchAllInventories = async () => {
  try {
    const response = await baseUrl.get(`${InventoryEndpoints.getAllInventory}`);
    response.data.lastCountedAt = formatDate(response.data.lastCountedAt || new Date().toISOString(), 'yyyy-mm-dd');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventories:', error.message);
    throw error;
  }
};

const FetchInventoryDropdown = async () => {
  try {
    const response = await baseUrl.get(
      `${InventoryEndpoints.getInventoryDropdown}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventory dropdown:', error.message);
    throw error;
  }
};
const FetchInventoryById = async (inventoryId: string) => {
  console.log(inventoryId);
  
  try {
    const response = await baseUrl.get(
      `${InventoryEndpoints.getInventoryId}/${inventoryId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventory by id:', error.message);
    throw error;
  }
};

const FetchInventoriesByWarehouseId = async (warehouseId: string ) => {
  try {
    const response = await baseUrl.get(
      `${InventoryEndpoints.getAllInventoriesByWarehouseId}/${warehouseId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventories by warehouse ID:', error.message);
    throw error;
  }
};
const FetchInvDetailsByWarehouseId = async (warehouseId: string) => {
  try {
    const response = await baseUrl.get(
      `${InventoryEndpoints.getInvDetailsByWarehouseId}/${warehouseId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventories by warehouse ID:', error.message);
    throw error;
  }
};
const FetchInventoriesByProductId = async (data: { productId: string }) => {
  try {
    const response = await baseUrl.get(
      `${InventoryEndpoints.getAllInventoriesByProductId}/${data.productId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventories by product ID:', error.message);
    throw error;
  }
};
const FetchInventoriesByWarehouseAndProductIds = async (data:{warehouseId: string, productId: string }) => {
  try {
    const response = await baseUrl.get(
      `${InventoryEndpoints.getAllInventoriesByWarehouseAndProductIds}?warehouseId=${data.warehouseId}&productId=${data.productId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Inventories by product ID:', error.message);
    throw error;
  }
};
const FetchProductsDropdownByWarehouseId = async (warehouseId: string) => {
  try {
    const response = await baseUrl.get(
      `${InventoryEndpoints.getProductsDropdownByWarehouseId}/${warehouseId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products for selected warehouse:', error.message);
    throw error;
  }
};

const UpdateInventoryById = async (data: {
  inventoryId: string;
  inventory: InventoryUpdateDTOType;
}) => {
  try {
    const parsedData = Validator.parse(InventoryUpdateSchema, data.inventory);
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.put(
      `${InventoryEndpoints.updateInventory}/${data.inventoryId}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating Inventory:', error.message);
    throw error;
  }
};

const AddNewInventory = async (data: { inventory: InventoryDTOType }) => {
  try {
    const parsedData = Validator.parse(InventorySaveSchema, data.inventory);
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.post(
      `${InventoryEndpoints.addInventory}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding Inventory:', error.message);
    throw error;
  }
};

export const InventoryServices = {
  FetchAllInventories,
  FetchInventoryById,
  FetchInventoryDropdown,
  FetchInventoriesByProductId,
  FetchInventoriesByWarehouseId,
  FetchInvDetailsByWarehouseId,
  FetchProductsDropdownByWarehouseId,
  FetchInventoriesByWarehouseAndProductIds,
  UpdateInventoryById,
  AddNewInventory,
};