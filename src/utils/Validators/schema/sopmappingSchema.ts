import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BaseSopmappingSchema = z.object({
  templateName: z.string(),
  sopName: z.string(),
  statusName: z.string(),
  sopIds: z.array(z.number()),
  description: z.string(),
  status: z.number(),
  lastUpdatedBy: z.number().optional(),
  createdBy: z.number().optional(),
  sopTemplateId: z.number().optional(),
});

export const SopmapSaveSchema = BaseSopmappingSchema;

export const SopmapUpdateSchema = BaseSopmappingSchema.partial();

// ✅ Types
export type SopmapSaveDTOType = z.infer<typeof SopmapSaveSchema>;
export type SopmapUpdateDTOType = z.infer<typeof SopmapUpdateSchema>;
