import { z } from 'zod';

export const ticketSearchSchema = z.object({
  ticketId: z.number().optional().nullable(),
});

