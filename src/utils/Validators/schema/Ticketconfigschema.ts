import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BaseTicketconfigSchema = z.object({
  assignedTo: z.array(z.number()).optional(),
  priority: z.number().optional(),
  ticketStatusId: z.number().optional(),
  categoryId: z.number().optional(),
  siteId: z.array(z.number()),
  toDate: z.string(),
  fromDate: z.string(),
filterType:z.string()
});

export const TicketconfigSaveSchema = BaseTicketconfigSchema;

export const TicketconfigUpdateSchema = BaseTicketconfigSchema.partial();

// ✅ Types
export type TicketconfigDTOType = z.infer<typeof TicketconfigSaveSchema>;
export type TicketconfigUpdateDTOType = z.infer<typeof TicketconfigUpdateSchema>;
