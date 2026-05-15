import type {
  PurchaseOrderDTOType,
  PurchaseOrderPaymentDTOType,
  PurchaseOrderUpdateDTOType,
} from '@/utils/Validators/Schema/PurchaseOrderSchema';

export interface PurchaseOrderDTO extends PurchaseOrderDTOType {
  siteName: string;
}

export interface PurchaseOrderUpdateDTO extends PurchaseOrderUpdateDTOType {}

export interface PurchaseOrderPaymentDTO extends PurchaseOrderPaymentDTOType {}
