import type {
  TicketconfigDTOType,
  TicketconfigUpdateDTOType,
  TicketcreationDTOType,
} from '@/utils/Validators/schema/Ticketconfigschema';

export interface TicketconfigDTO
  extends TicketconfigDTOType {}

export interface TicketcreationDTO
  extends TicketcreationDTOType {}

export interface TicketconfigUpdateDTO
  extends TicketconfigUpdateDTOType {}