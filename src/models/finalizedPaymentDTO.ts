import type {

FinalizedPaymentUpdateDTOType,
FinalizedPaymentsDTOType
} from '@/utils/Validators/Schema/finalizedSchema';

export interface finalizedPaymentUpdateDTO extends FinalizedPaymentUpdateDTOType {}
export interface finalizedPayment extends FinalizedPaymentsDTOType {}
