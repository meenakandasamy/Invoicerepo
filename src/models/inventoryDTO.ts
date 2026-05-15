import type {
  InventoryDTOType,
  InventoryUpdateDTOType,
} from '@/utils/Validators/Schema/InventorySchema';

export interface InventorytDTO extends InventoryDTOType {
  warehouseName: string;
  productName: string;
}

export interface InventoryUpdateDTO extends InventoryUpdateDTOType {
  warehouseName: string;
  productName: string;
}