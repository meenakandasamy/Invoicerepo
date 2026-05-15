import { z } from 'zod';

// Base Product Schema (for reuse)
const BasewarehouseSchema = z.object({
  warehouseName: z.string(),
  warehouseId: z.number().optional(),
  location: z.string(),
  capacity: z.number(),
  remarks: z.string(),
  status: z.number(),
  warehouseCode: z.string(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
});
export const WarehouseSaveSchema = BasewarehouseSchema;
export const WarehouseUpdateSchema = BasewarehouseSchema.partial();
export type WarehouseDTOType = z.infer<typeof WarehouseSaveSchema>;
export type WarehouseUpdateDTOType = z.infer<typeof WarehouseUpdateSchema>;
