import { z } from 'zod';

export const ExpenseSearchSchema = z.object({
  expenseId: z.number().optional().nullable(),
  expenseReqCode: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  //   page: z.coerce.number().default(1),
});
export const VendorAdvanceSearchSchema = z.object({
  vendorAdvanceId: z.number().optional().nullable(),
  vendorAdvanceCode: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  //   page: z.coerce.number().default(1),
});

export const vendorSearchSchema = z.object({
  vendorId: z.number().optional().nullable(),
});

export const reimbursementSearchSchema = z.object({
  employeeReimbursementId: z.number().optional().nullable(),
});

export const consultantSalarySearchSchema = z.object({
  consultantId: z.number().optional().nullable(),
});

export const vendorRentSearchSchema = z.object({
  vendorRentId: z.number().optional().nullable(),
  rentRecurrsionId: z.number().optional().nullable(),
});

export type ExpenseSearch = z.infer<typeof ExpenseSearchSchema>;

export type VendorAdvanceSearch = z.infer<typeof VendorAdvanceSearchSchema>;

export type VendorSearch = z.infer<typeof vendorSearchSchema>;

export type ReimbursementSearch = z.infer<typeof reimbursementSearchSchema>;

export type ConsultantSalarySearch = z.infer<
  typeof consultantSalarySearchSchema
>;

export type VendorRentSearch = z.infer<typeof vendorRentSearchSchema>;
