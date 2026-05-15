import type {
  PaymentTermsDTOType,
  PaymentTermsUpdateDTOType,
} from '@/utils/Validators/Schema/PaymentTermsSchema';

export interface PaymentTermsDTO extends PaymentTermsDTOType {
  [key: string]: any;
}
export interface PaymentTermsUpdateDTO extends PaymentTermsUpdateDTOType {
  [key: string]: any;
}
