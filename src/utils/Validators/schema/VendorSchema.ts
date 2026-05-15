import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BaseVendorSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  vendorId: z.number().optional(),
  vendorName: z.string(),
  mobileNo: z.number(),
  emailId: z.string().email(),
  gstNo: z.string().optional(),
  panNo: z.string(),
  bankIfscCode: z.string(),
  accountNo: z.string(),
  bankName: z.string(),
  bankBranch: z.string(),
  description: z.string(),
  gstStatus: z.number(),
  createdBy: z.number(),
  lastUpdatedBy: z.number(),
  status: z.number().optional(),
  companyId: z.number().optional(),
  customerId: z.number().optional(),
  accountNoFilpath: z.string().optional(),
  panNoFilepath: z.string().optional(),
  msmeRegistrationFilepath: z.string().optional(),
  gstNoFilepath: z.string().optional(),
  approverStatusId: z.number().optional(),
  accountNoFilePath: z.string().optional(),
  panNoFilePath: z.string().optional(),
  msmeRegistrationFilePath: z.string().optional(),
  gstNoFilePath: z.string().optional(),
  aadharNoFilePath: z.string().optional(),
});

export const VendorSaveSchema = BaseVendorSchema;

export const VendorUpdateSchema = BaseVendorSchema.partial();

// ✅ Types
export type VendorDTOType = z.infer<typeof VendorSaveSchema>;
export type VendorUpdateDTOType = z.infer<typeof VendorUpdateSchema>;
