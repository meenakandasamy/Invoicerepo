import { z } from 'zod';

// Base schema
const BaseTicketviewSchema = z.object({
  assignedTo: z.number().optional(),
  lastUpdatedBy: z.number(),
  remarks: z.string(),
  scheduleOn: z.string(),
  ticketId:z.number().optional(),
});

const BaseTicketholdviewSchema = z.object({
lastUpdatedBy:z.number(),
remarks: z.string(),

});

// Schemas
export const TicketviewSaveSchema = BaseTicketviewSchema;

export const TicketholdSchema = BaseTicketholdviewSchema;

export const TicketviewUpdateSchema =
  BaseTicketviewSchema.partial();

// Types
export type TicketviewDTOType = z.infer<
  typeof TicketviewSaveSchema
>;

export type TicketholdDTOType = z.infer<
  typeof TicketholdSchema
>;

export type TicketviewReassignDTOType = z.infer<
  typeof TicketviewUpdateSchema
>;