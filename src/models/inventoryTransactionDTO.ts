import type {
  InventoryTransactionDTOType,
  InventoryTransactionUpdateDTOType,
} from '@/utils/Validators/Schema/InventoryTransactionSchema';


export interface InventoryTransactionDTO extends InventoryTransactionDTOType {
  vendorName: string;
  warehouseName: string;
  productName: string;
  siteName: string;
  inventoryTransferToName: string;
}

export interface InventoryTransactionUpdateDTO extends InventoryTransactionUpdateDTOType {
  vendorName: string;
  vendorId: number;
  warehouseName: string;
  warehouseId: number;
  productName: string;
  productId: number;
  referenceFileName: string;
  inventoryTransferToName: string;
}
