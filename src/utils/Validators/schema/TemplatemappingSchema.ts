import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BaseTemplatemappingSchema = z.object({
  sopIds: z.array(z.number()),
  sopTemplateId: z.number().optional(),
  description: z.string(),
  status: z.number(),
  lastUpdatedBy: z.number().optional(),
  createdBy: z.number().optional(),

});

export const TemplatemappingSaveSchema = BaseTemplatemappingSchema;

export const TemplatemappingUpdateSchema = BaseTemplatemappingSchema.partial();

// ✅ Types
export type TemplatemappingSaveDTOType = z.infer<typeof TemplatemappingSaveSchema>;
export type TemplatemappingUpdateDTOType = z.infer<typeof TemplatemappingUpdateSchema>;
