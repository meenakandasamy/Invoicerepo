import { z } from 'zod';

const BaseInventoryTransactionSchema = z.object({
  inventoryTransactionId: z.number().optional(),
  inventoryId: z.number().optional(),
  productId: z.number().optional(),
  vendorId: z.number().optional(),
  warehouseId: z.number().optional(),
  transactionType: z.string(),
  quantity: z.number(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  referenceFile: z.string().optional(),
  fileType: z.string().optional(),
  warehouseTransferTo: z.number().optional(),
  inventoryTransferTo: z.number().optional(),
  siteId: z.number().optional(),
  transactionDate: z.string(),
  remarks: z.string(),
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
  status: z.number().optional(),
});

// Exported schemas for creation and update
export const InventoryTransactionSaveSchema = BaseInventoryTransactionSchema;
export const InventoryTransactionUpdateSchema = BaseInventoryTransactionSchema.partial();

// ✅ Types
export type InventoryTransactionDTOType = z.infer<typeof InventoryTransactionSaveSchema>;
export type InventoryTransactionUpdateDTOType = z.infer<typeof InventoryTransactionUpdateSchema>;

