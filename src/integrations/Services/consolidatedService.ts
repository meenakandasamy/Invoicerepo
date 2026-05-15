import { baseUrl } from './baseUrl';
import type { ExpenseDTOType } from '@/utils/Validators/schema/ExpeneseSchema';
import type { VendorAdvanceType } from '@/utils/Validators/schema/VendorAdvanceSchema';
import type { VendorDTOType } from '@/utils/Validators/Schema/VendorSchema';

export interface consolidatedResponse {
  expenditure: Array<ExpenseDTOType>;
  VendorAdvanve: Array<VendorAdvanceType>;
  EmployeeReimbursement: Array<any>;
  vendors: Array<VendorDTOType>;
  VendorRent: Array<any>;
  ConsultantSalary: Array<any>;
}

export enum ConsolidatedDashboardQuery {
  GET_CONSOLIDATED_DASHBOARD = 'getConsolidatedDashboard',
}

const consolidatedDashboardEndpoint = {
  getConsolidatedDashboard: import.meta.env.VITE_GET_CONSOLIDATED_DASHBOARD,
};

/**
 * Fetches the consolidated dashboard data based on cost centre ids and cost header ids.
 * @param {Array<string>} costCentreIds - Array of cost centre ids.
 * @param {Array<string>} costHeaderIds - Array of cost header ids.
 * @returns {Promise<any>} - Promise that resolves to the consolidated dashboard data.
 */
export const getConsolidatedDashboard = async ({
  userId,
}: {
  costCentreIds: Array<string | number>;
  costHeaderIds: Array<string | number>;
  levelId: number;
  userId: number;
}) => {
  try {
    // const params = new URLSearchParams({
    //   costCentreIds: costCentreIds.join(','),
    //   costHeaderIds: costHeaderIds.join(','),
    //   levelId: levelId.toString(),
    // });

    const response = await baseUrl.get(
      `${consolidatedDashboardEndpoint.getConsolidatedDashboard}/${userId}`,
    );

    const data = response.data;

    const flatData = flatMapWithModuleAndCode(data);

    return flatData.sort(
      (a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );
  } catch (error) {
    console.error('Error fetching consolidated dashboard:', error);
    throw error;
  }
};

export interface ConsolidatedData {
  [key: string]: any;
  module: string;
  moduleName: string;
  code?: string;
  id?: number;
}

const moduleNameMap = {
  Expenditure: 'Expenditure',
  VendorAdvanve: 'Vendor Advance',
  EmployeeReimbursement: 'Employee Reimbursement',
  Vendor: 'Vendor Registration',
  VendorRent: 'Vendor Rent',
  ConsultantSalary: 'Consultant Salary',
} as const;

const codeFields = [
  'vendorCode',
  'reimbursementCode',
  'vendorAdvanceCode',
  'expenseReqCode',
  'vendorRentCode',
  'consultantSalaryReqCode',
] as const;

const idFields = [
  'expenseId',
  'vendorAdvanceId',
  'employeeReimbursementId',
  'vendorId',
  'vendorRentId',
  'consultantId',
] as const;

export enum MODULE {
  EXPENDITURE = 'Expenditure',
  VENDOR_ADVANCE = 'VendorAdvance',
  EMPLOYEE_REIMBURSEMENT = 'EmployeeReimbursement',
  VENDOR_REGISTRATION = 'Vendor',
  VENDOR_RENT = 'VendorRent',
  CONSULTANT_SALARY = 'ConsultantSalary',
}

function flatMapWithModuleAndCode(data: any): Array<ConsolidatedData> {
  const result: Array<ConsolidatedData> = [];

  Object.entries(data).forEach(([moduleName, items]) => {
    if (!Array.isArray(items)) return;

    items.forEach((item) => {
      const mappedModuleName =
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        moduleNameMap[moduleName as keyof typeof moduleNameMap] || moduleName;

      const newItem: ConsolidatedData = {
        module: moduleName as any,
        moduleName: mappedModuleName,
      };

      Object.entries(item).forEach(([key, value]) => {
        newItem[key as keyof ConsolidatedData] = value;

        // Map code fields
        if (codeFields.includes(key as (typeof codeFields)[number])) {
          newItem.code = value as string;
        }

        // Map id fields
        if (idFields.includes(key as (typeof idFields)[number])) {
          newItem.id = value as number;
        }
      });

      result.push(newItem);
    });
  });

  return result;
}

export const consolidatedDashboardService = {
  getConsolidatedDashboard,
};
