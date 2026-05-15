import type {
  FinalizedPaymentDTOType,
  FinalizedPaymentUpdateDTOType,
} from '@/utils/Validators/Schema/finalizedSchema';

export interface FinalizedPaymentDTO extends FinalizedPaymentDTOType {}

export interface FinalizedPaymentUpdateDTO extends FinalizedPaymentUpdateDTOType {}
