import { z } from 'zod';

// Base schema
const BaseTicketconfigSchema = z.object({
  assignedTo: z.array(z.number()).optional(),
  priority: z.number().optional(),
  ticketStatusId: z.number().optional(),
  categoryId: z.number().optional(),
  siteId: z.array(z.number()),
  toDate: z.string(),
  fromDate: z.string(),
  filterType: z.string(),
    ticketId:z.number().optional()
});

const BaseTicketcreationSchema = z.object({
  equipmentId: z.array(z.number()).optional(),
  siteId: z.number().optional(),
  ticketTypeId: z.number().optional(),
  ticketCategory: z.number().optional(),
  description: z.string(),
  priority: z.string(),
  subject: z.string(),
  cycle: z.number().optional,
  createdBy: z.number(),

});

// Schemas
export const TicketconfigSaveSchema = BaseTicketconfigSchema;

export const TicketcreationSchema = BaseTicketcreationSchema;

export const TicketconfigUpdateSchema =
  BaseTicketconfigSchema.partial();

// Types
export type TicketconfigDTOType = z.infer<
  typeof TicketconfigSaveSchema
>;

export type TicketcreationDTOType = z.infer<
  typeof TicketcreationSchema
>;

export type TicketconfigUpdateDTOType = z.infer<
  typeof TicketconfigUpdateSchema
>;