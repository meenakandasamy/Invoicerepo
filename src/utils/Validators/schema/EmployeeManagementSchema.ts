import { z } from 'zod';

// Base schema (for reuse, not exported directly)
const BaseEmployeeSchema = z.object({
  createdDate: z.string().optional(),
  lastUpdatedDate: z.string().optional(),
  createdby: z.any().optional(),
 fullName: z.string(),
 emailId:z.string(),
  employeeCode: z.string(),
 bankName:z.string(),
  bankBranch: z.string(),
 IFSC:z.string(),
   accountNo: z.string(),
 passbook:z.string(),
 employeeId:z.number().optional()
});

export const EmployeeSaveSchema = BaseEmployeeSchema;

export const EmployeeUpdateSchema = BaseEmployeeSchema.partial();

// ✅ Types
export type EmployeeDTOType = z.infer<typeof EmployeeSaveSchema>;
export type EmployeeUpdateDTOType = z.infer<typeof EmployeeUpdateSchema>;
