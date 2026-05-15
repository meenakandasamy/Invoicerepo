import { baseUrl } from './baseUrl';
import type {
  ProductDTOType,
  ProductUpdateDTOType,
} from '@/utils/Validators/Schema/ProductSchema';
import {
  ProductSaveSchema,
  ProductUpdateSchema,
} from '@/utils/Validators/Schema/ProductSchema';
import { Validator } from '@/utils/Validators/ValidatorData';

export enum ProductQuery {
  GET_ALL_PRODUCTS = 'getAllProduct',
  GET_PRODUCT_BY_ID = 'getProductById',
  GET_PRODUCT_DROPDOWN_BY_VENDOR_ID = 'getProductDropdownByVendorId',
  GET_PRODUCT_DROPDOWN_BY_WAREHOUSE_ID = 'getProductDropdownByWarehouseId',
}
enum ProductEndpoints {
  getAllProduct = import.meta.env.VITE_GETALL_PRODUCTS,
  getProductId = import.meta.env.VITE_GET_PRODUCT_BY_ID,
  getProductDropdownByVendorId = import.meta.env
    .VITE_GET_PRODUCTS_DROPDOWN_BY_VENDOR,
  getProductDropdownByWarehouseId = import.meta.env
    .VITE_GET_PRODUCTS_DROPDOWN_BY_WAREHOUSE_ID,
  deleteProduct = import.meta.env.VITE_DELETE_PRODUCT_BY_ID,
  updateProduct = import.meta.env.VITE_UPDATE_PRODUCT_BY_ID,
  addProduct = import.meta.env.VITE_ADD_PRODUCT,
}
const FetchAllProducts = async () => {
  try {
    const response = await baseUrl.get(`${ProductEndpoints.getAllProduct}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};
const FetchProductById = async (data: { productId: string }) => {
  try {
    const response = await baseUrl.get(
      `${ProductEndpoints.getProductId}/${data.productId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product by id:', error.message);
    throw error;
  }
};
const FetchProductDropdownByVendorId = async (vendorId: number) => {
  try {
    const response = await baseUrl.get(
      `${ProductEndpoints.getProductDropdownByVendorId}/${vendorId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products by Vendor id:', error.message);
    throw error;
  }
};
const FetchProductDropdownByWarehouseId = async (warehouseId: number) => {
  try {
    const response = await baseUrl.get(
      `${ProductEndpoints.getProductDropdownByWarehouseId}/${warehouseId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products by Warehouse id:', error.message);
    throw error;
  }
};
const UpdateProductById = async (data: {
  productId: string;
  product: ProductUpdateDTOType;
}) => {
  try {
    // const parsedData = Validator.parse(ProductUpdateSchema, data.product);
    // if (!parsedData.success) {
    //   throw new Error(parsedData.error);
    // }
    const response = await baseUrl.put(
      `${ProductEndpoints.updateProduct}/${data.productId}`,
      data.product
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating Product:', error.message);
    throw error;
  }
};

const AddNewProduct = async (data: { product: ProductDTOType }) => {
  try {
    console.log(data, 'dataTest');
    
    // const parsedData = Validator.parse(ProductSaveSchema, data.product);
    // if (!parsedData.success) {
    //   throw new Error(parsedData.error);
    // }
    const response = await baseUrl.post(
      `${ProductEndpoints.addProduct}`,
      data.product,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding Product:', error.message);
    throw error;
  }
};

const DeleteproductById = async (data: { productId: string }) => {
  try {
    const response = await baseUrl.delete(
      `${ProductEndpoints.deleteProduct}/${data.productId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product:', error.message);
    throw error;
  }
};

export const ProductServices = {
  FetchAllProducts,
  FetchProductById,
  FetchProductDropdownByVendorId,
  FetchProductDropdownByWarehouseId,
  UpdateProductById,
  AddNewProduct,
  DeleteproductById,
};
