import { z } from 'zod';

// Base Product Schema (for reuse)
const BaseProductSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  description: z.string(),
  hsnCode: z.string().optional(),
  sacCode: z.string().optional (),
  
  vendorId: z.array(z.number()),
  vendorName: z.array(z.string()).optional(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
  status: z.number(),
  productTypeId: z.number(),

  productTypeName:z.string(),
   
});

// Exported schemas for creation and update
export const ProductSaveSchema = BaseProductSchema;
export const ProductUpdateSchema = BaseProductSchema.partial();

// ✅ Types
export type ProductDTOType = z.infer<typeof ProductSaveSchema>;
export type ProductUpdateDTOType = z.infer<typeof ProductUpdateSchema>;
