import { baseUrl } from './baseUrl';
import type {
  WarehouseUpdateDTOType,
  WarehouseDTOType,
} from '@/utils/Validators/Schema/WarehouseSchema';
import {
  WarehouseSaveSchema,
  WarehouseUpdateSchema,
} from '@/utils/Validators/Schema/WarehouseSchema';
import { Validator } from '@/utils/Validators/ValidatorData';

export enum WarehouseQuery {
  GET_ALL_WAREHOUSES = 'getAllWarehouses',
  GET_WAREHOUSE_BY_ID = 'getWarehouseById',
  GET_ALL_WAREHOUSE_DROPDOWN = 'getAllWarehouseDropdown',
  GET_WAREHOUSE_BY_VENDOR_ID = 'getWarehouseByVendorId',
  GET_ALL_WAREHOUSE_DROPDOWN_MAP = 'getAllWarehouseDropdownMap',
}
enum warehouseEndpoints {
  getAllWarehouse = import.meta.env.VITE_GETALL_WAREHOUSE,
  getWarehouseId = import.meta.env.VITE_GET_WAREHOUSE_BY_ID,
  getAllWarehouseDropdown = import.meta.env.VITE_GET_WAREHOUSE_DROPDOWN,
  getWarehouseDropdownByVendorId = import.meta.env.VITE_GET_WAREHOUSE_BY_VENDOR_ID,
  deleteWarehouse = import.meta.env.VITE_DELETE_WAREHOUSE_BY_ID,
  updateWarehouse = import.meta.env.VITE_UPDATE_WAREHOUSE_BY_ID,
  addWarehouse = import.meta.env.VITE_ADD_WAREHOUSE,
}
 const FetchAllWarehouses = async () => {
  try {
    const response = await baseUrl.get(`${warehouseEndpoints.getAllWarehouse}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouses:', error.message);
    throw error;
  }
};
const FetchWarehouseById = async (data: {
  warehouseId: string;
}) => {
  try {
    const response = await baseUrl.get(
      `${warehouseEndpoints.getWarehouseId}/${data.warehouseId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouse by id:', error.message);
    throw error;
  }
};
const UpdateWarehouseById = async (data: {
  warehouseId: string;
  warehouse: WarehouseUpdateDTOType;
}) => {
  try {
    const parsedData = Validator.parse(WarehouseUpdateSchema, data.warehouse);
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.put(
      `${warehouseEndpoints.updateWarehouse}/${data.warehouseId}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating warehouse:', error.message);
    throw error;
  }
};

const AddNewWarehouse = async (data: {
  warehouse: WarehouseDTOType;
}) => {
  try {
    const parsedData = Validator.parse(WarehouseSaveSchema, data.warehouse);
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.post(
      `${warehouseEndpoints.addWarehouse}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding warehouse:', error.message);
    throw error;
  }
};
const FetchAllWarehousesDropdown = async () => {
  try {
    const response = await baseUrl.get(
      `${warehouseEndpoints.getAllWarehouseDropdown}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouses:', error.message);
    throw error;
  }
};
const FetchWarehousesDropdownByVendorId = async (vendorId: number) => {
  try {
    const response = await baseUrl.get(
      `${warehouseEndpoints.getWarehouseDropdownByVendorId}/${vendorId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouses by Vendor id:', error.message);
    throw error;
  }
};
const DeleteWarehouseById = async (data: { warehouseId: string }) => {
  try {
    const response = await baseUrl.delete(
      `${warehouseEndpoints.deleteWarehouse}/${data.warehouseId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting warehouse:', error.message);
    throw error;
  }
};

export const WarehouseServices = {
  FetchAllWarehouses,
  FetchWarehouseById,
  FetchAllWarehousesDropdown,
  FetchWarehousesDropdownByVendorId,
  UpdateWarehouseById,
  AddNewWarehouse,
  DeleteWarehouseById,
};