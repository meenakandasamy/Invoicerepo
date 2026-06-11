import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BaseTemplatemappingSchema = z.object({
  siteId: z.number(),
  sopTemplateId: z.number(),
  description: z.string(),
  status: z.number(),
  lastUpdatedBy: z.number(),
  createdBy: z.number(),
  sopTemplateMapId: z.number().optional(),
});

export const TemplatemappingSaveSchema =z.array( BaseTemplatemappingSchema)

export const TemplatemappingUpdateSchema = BaseTemplatemappingSchema.partial()

// ✅ Types
export type TemplatemappingSaveDTOType = z.infer<
  typeof TemplatemappingSaveSchema
>;
export type TemplatemappingUpdateDTOType = z.infer<
  typeof TemplatemappingUpdateSchema
>;
