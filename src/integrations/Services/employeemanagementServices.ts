import { baseUrl } from './baseUrl';
import type {
  EmployeeDTOType,
  EmployeeUpdateDTOType,
} from '@/utils/Validators/schema/EmployeeManagementSchema';
export enum EmployeeQueries {
  GET_ALL_EMPLOYEE = 'getAllEMPLOYEE',
}

enum EmployeeEndpoints {
  getAllEmployee = import.meta.env.VITE_GET_ALL_EMPLOYEE_MANAGEMENT,
  AddEmployee = import.meta.env.VITE_GET_EMPLOYEE_MANAGEMENT_ADD,
  UpdateEmployee = import.meta.env.VITE_GET_EMPLOYEE_MANAGEMENT_UPDATE,
}

const fetchgetallemployee = async () => {
  try {
    const response = await baseUrl.get(`${EmployeeEndpoints.getAllEmployee}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};

const AddNewemployee = async (data: EmployeeDTOType) => {
  console.log(data);

  try {
    const response = await baseUrl.post(
      `${EmployeeEndpoints.AddEmployee}`,
      data.employee,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

const UpdateEmployeeById = async (data: EmployeeUpdateDTOType) => {
  try {
    const response = await baseUrl.put(
      `${EmployeeEndpoints.UpdateEmployee}/${data.employeeId}`,
      data.employee,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
export const EmployeeServices = {
  fetchgetallemployee,
  AddNewemployee,
  UpdateEmployeeById,
};
