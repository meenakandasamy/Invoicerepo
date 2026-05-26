import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BaseTicketapprovalSchema = z.object({
  ticketStatusId: z.number(),
  ticketId: z.number(),
  remarks: z.string(),
  lastUpdatedBy: z.number(),
  approvedBy: z.number(),
  
});

export const TicketapprovalSaveSchema = BaseTicketapprovalSchema;

export const TicketapprovalUpdateSchema = BaseTicketapprovalSchema.partial();

// ✅ Types
export type TicketapprovalDTOType = z.infer<typeof TicketapprovalSaveSchema>;
export type TicketapprovalUpdateDTOType = z.infer<typeof TicketapprovalUpdateSchema>;
