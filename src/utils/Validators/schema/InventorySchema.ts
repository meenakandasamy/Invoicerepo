import { z } from 'zod';

// Base Inventory Schema (for reuse)
const BaseInventorySchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  inventoryId: z.number().optional(),
  vendorId: z.number(),
  productId: z.number(),
  warehouseId: z.number(),
  quantityAvailable: z.number(),
  lastCountedAt: z.string().transform((val) => val.split('T')[0]),
  quantityReserved: z.number(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
  status: z.number(),
});

// Exported schemas for creation and update
export const InventorySaveSchema = BaseInventorySchema;
export const InventoryUpdateSchema = BaseInventorySchema.partial();

// ✅ Types
export type InventoryDTOType = z.infer<typeof InventorySaveSchema>;
export type InventoryUpdateDTOType = z.infer<typeof InventoryUpdateSchema>;