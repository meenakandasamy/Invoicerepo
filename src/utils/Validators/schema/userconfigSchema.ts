import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BasePoloaSchema = z.object({
 firstName : z.string(),
  lastName: z.string().optional(),
 emailId:z.string().optional(),
 mobileNo:z.string(),
  city: z.string(),
   state: z.string(),
  country: z.string().optional(),
 postalCode: z.number(),
 status:z.number(),
 userId: z.number().optional()

});

export const UserconfigSaveSchema = BasePoloaSchema;

export const UserconfigUpdateSchema = BasePoloaSchema.partial();

// ✅ Types
export type UserconfigDTOType = z.infer<typeof UserconfigSaveSchema>;
export type UserconfigUpdateDTOType = z.infer<typeof UserconfigUpdateSchema>;
