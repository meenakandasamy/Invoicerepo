import { z } from 'zod';



const BaseReassignSchema = z.object({
  assignedTo: z.number(),
  scheduleOn: z.string(),
  lastUpdatedBy: z.number(),
  remarks: z.string(),
  
});

export type TicketreassignDTOType = z.infer<typeof BaseReassignSchema>;
