import { z } from 'zod';

const BaseWarehouseSiteMapSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  warehouseId: z.array(z.number()),
  siteId: z.array(z.number()),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
});

// Exported schemas for creation and update
export const WarehouseSiteMapSaveSchema = BaseWarehouseSiteMapSchema;
export const WarehouseSiteMapUpdateSchema = BaseWarehouseSiteMapSchema.partial();

// ✅ Types
export type WarehouseSiteMapDTOType = z.infer<typeof WarehouseSiteMapSaveSchema>;
export type WarehouseSiteMapUpdateDTOType = z.infer<typeof WarehouseSiteMapUpdateSchema>;