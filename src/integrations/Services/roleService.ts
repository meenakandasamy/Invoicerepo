import { baseUrl } from './baseUrl';
import type { RoleDTO, RoleUpdateDTO } from '@/models/RoleDTO';
import {
  RoleSaveSchema,
  RoleUpdateSchema,
} from '@/utils/Validators/Schema/RoleSchema';

import { Validator } from '@/utils/Validators/ValidatorData';

export enum RoleQuery {
  GET_ALL_ROLE = 'getRole',
  GET_ALL_ACTIVITY = 'getActivity',
  GET_ROLE_BY_ID = 'getRoleById',
}

enum RoleEndpoints {
  getRole = import.meta.env.VITE_GET_ROLE_ID,
  getActivity = import.meta.env.VITE_GET_ALL_ACTIVITY,
  addRole = import.meta.env.VITE_ADD_ROLE,
  updateRole = import.meta.env.VITE_UPDATE_ROLE,
  deleteRole = import.meta.env.VITE_DELETE_ROLE,
  getRoleById = import.meta.env.VITE_GET_ROLE_BY_ID,
}

export const FetchAllRole = async (id:any) => {
  console.log(id);
  
  try {
    const response = await baseUrl.get(`${RoleEndpoints.getRole}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching role:', error.message);
    throw error;
  }
};
export const FetchActivity = async () => {
  try {
    const response = await baseUrl.get(`${RoleEndpoints.getActivity}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching activity:', error.message);
    throw error;
  }
};

export const AddNewRole = async (data: { role: RoleDTO }) => {
  try {
    const parsedData = Validator.parse(RoleSaveSchema, data.role);
    console.log(data);

    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.post(
      `${RoleEndpoints.addRole}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding role:', error.message);
    throw error;
  }
};

export const UpdateRoleById = async (data: {
  roleId: number;
  role: RoleUpdateDTO;
}) => {
  console.log(data);
  try {
    const parsedData = Validator.parse(RoleUpdateSchema, data.role);
    if (!parsedData.success) {
      console.error('Validation error details:', parsedData.error);
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.put(
      `${RoleEndpoints.updateRole}/${data.roleId}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating role:', error.message);
    throw error;
  }
};

export const DeleteRoleId = async (data: { roleId: string }) => {
  console.log(data);

  try {
    const response = await baseUrl.delete(
      `${RoleEndpoints.deleteRole}/${data.roleId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting role:', error.message);
    throw error;
  }
};

export const GetRoleById = async (data: { roleId: string }) => {
  try {
    const response = await baseUrl.get(
      `${RoleEndpoints.getRoleById}/${data.roleId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting role:', error.message);
    throw error;
  }
};
