import type {
  VendorDTOType,
  VendorUpdateDTOType,
} from '@/utils/Validators/Schema/VendorSchema';

export interface VendorDTO extends VendorDTOType {}
export interface VendorUpdateDTO extends VendorUpdateDTOType {
  organizationId: any;
  vendorType: any;
  isGST: any;
  costCentreIds: Array<number>;
  costCentreName: Array<string>;
  costHeaderIds: Array<number>;
  costHeaderName: Array<string>;
  siteIds: Array<number>;
  siteName: Array<string>;
  view?: any;
  accfileType?: string;
  panfileType?: string;
  gstfileType?: string;
  msmefileType?: string;
  aadharfileType?: string;
}
