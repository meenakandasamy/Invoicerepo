import type {
  EmployeeDTOType,
  EmployeeUpdateDTOType,
} from '@/utils/Validators/schema/EmployeeManagementSchema';

export interface EmployeeDTO extends EmployeeDTOType {}
export interface EmployeeUpdateDTO extends EmployeeUpdateDTOType {}
