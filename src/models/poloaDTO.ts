import type {
  PoloaDTOType,
  PoloaUpdateDTOType,
} from '@/utils/Validators/schema/poloaSchema';

export interface PoloaDTO extends PoloaDTOType {}
export interface PoloaUpdateDTO extends PoloaUpdateDTOType {
  organizationId: any;
  poId: string;
    vendorId?: number;
  costCentreid?: number;
  costHeaderid?: number;
  createdby?: string;
  poNumber?: string;
  uploadType?: string;
  lastUpdatedDate?:string
  createdDate?:string

}
