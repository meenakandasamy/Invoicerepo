import { baseUrl } from './baseUrl';
import { Validator } from '@/utils/Validators/ValidatorData';
import type { WarehouseSiteMapDTOType, WarehouseSiteMapUpdateDTOType } from '@/utils/Validators/Schema/WarehouseSiteMapSchema';
import {
  WarehouseSiteMapSaveSchema,
  WarehouseSiteMapUpdateSchema,
} from '@/utils/Validators/Schema/WarehouseSiteMapSchema';
export enum WarehouseSiteMapQuery {
  GET_ALL_WAREHOUSE_MAPPING = 'getAllWarehouseMapping',
  GET_WAREHOUSE_MAP_BY_ID = 'getWarehouseMapById',
}

const warehouseSiteMapEndPoints = {
  getAllWarehouseMapping: import.meta.env.VITE_GETALL_WAREHOUSE_MAPPING,
  addWarehouseSiteMap: import.meta.env.VITE_ADD_WAREHOUSE_MAP,
  updateWarehouseSiteMap: import.meta.env.VITE_UPDATE_WAREHOUSE_MAP_BY_ID,
  getWarehouseSiteMapById: import.meta.env.VITE_GET_WAREHOUSE_MAP_BY_ID,
};

const FetchAllWarehouseMapping = async () => {
  try {
    const response = await baseUrl.get(
      `${warehouseSiteMapEndPoints.getAllWarehouseMapping}`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching Warehouse mapping:', error);
    throw error;
  }
};

// const AddWarehouseSiteMap = async (data: any) => {
//   try {
//     const response = await baseUrl.post(
//       warehouseSiteMapEndPoints.addWarehouseSiteMap,
//       data,
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching Warehouse mapping:', error);
//     throw error;
//   }
// };
const AddWarehouseSiteMap = async (data: { warehouseSiteMap: WarehouseSiteMapDTOType }) => {
  try {
    const parsedData = Validator.parse(WarehouseSiteMapSaveSchema, data.warehouseSiteMap);
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.post(
      `${warehouseSiteMapEndPoints.addWarehouseSiteMap}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Warehouse mapping:', error.message);
    throw error;
  }
};


// const UpdateWarehouseSiteMapById = async (data: any) => {
//   try {
//     const { warehouseId } = data;
//     const response = await baseUrl.put(
//       `${warehouseSiteMapEndPoints.updateWarehouseSiteMap}/${warehouseId}`,
//       data,
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching approver mapping:', error);
//     throw error;
//   }
// };
const UpdateWarehouseSiteMapById = async (data: {
  warehouseId: string;
  warehouseSiteMap: WarehouseSiteMapUpdateDTOType;
}) => {
  try {
    const parsedData = Validator.parse(WarehouseSiteMapUpdateSchema, data.warehouseSiteMap);
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.put(
      `${warehouseSiteMapEndPoints.updateWarehouseSiteMap}/${data.warehouseId}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating Inventory:', error.message);
    throw error;
  }
};
const FetchWarehouseSiteMapById = async (warehouseSiteMapId: string) => {
  try {
    const response = await baseUrl.get(
      `${warehouseSiteMapEndPoints.getWarehouseSiteMapById}/${warehouseSiteMapId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Warehouse Site map by ID:', error.message);
    throw error;
  }
};

export const WarehouseSiteMapServices = {
  FetchAllWarehouseMapping,
  UpdateWarehouseSiteMapById,
  AddWarehouseSiteMap,
  FetchWarehouseSiteMapById,
};
