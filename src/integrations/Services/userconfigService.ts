    import { baseUrl } from './baseUrl';
    import type {
       UserconfigDTOType,
      UserconfigUpdateDTOType} from '@/utils/Validators/schema/userconfigSchema';
    export enum UserQueries {
      GET_ALL= 'getAllUsers',
      GET_ALL_COUNTRIE='countryDropdown',
      GET_ALL_STATE='stateDropdown',
      GET_ALL_USER_ROLE='userRoleDropdown',

    
    }
    
    enum PoloaEndpoints {
      getAllUsers = import.meta.env.VITE_GET_USER,
      addUser = import.meta.env.VITE_ADD_USER,
      UpdateUser = import.meta.env.VITE_UPDATE_USER,
      countryDropdown = import.meta.env.VITE_COUNTRY_DROPDOWN,
      stateDropdown = import.meta.env.VITE_STATE_DROPDOWN,
      userRoleDropdown = import.meta.env.VITE_USER_ROLE_DROPDOWN
      // getAllPoloa = import.meta.env.VITE_GET_PO_LOA,
    }
    
    
    const fetchgetallUser= async () => {
      try {
        const response = await baseUrl.get(
          `${PoloaEndpoints.getAllUsers}`,
        );
        return response.data;
      } catch (error: any) {
        console.error('Error fetching cost centres:', error.message);
        throw error;
      }
    };
        const fetchgetcountry= async () => {
      try {
        const response = await baseUrl.get(
          `${PoloaEndpoints.countryDropdown}`,
        );
        return response.data;
      } catch (error: any) {
        console.error('Error fetching cost centres:', error.message);
        throw error;
      }
    };
      const fetchgetuserrole= async (Id:any) => {

        
      try {
        const response = await baseUrl.get(
          `${PoloaEndpoints.userRoleDropdown}/${Id}`,
        );
        return response.data;
      } catch (error: any) {
        console.error('Error fetching cost centres:', error.message);
        throw error;
      }
    };
     const fetchgetstate= async () => {
      try {
        const response = await baseUrl.get(
          `${PoloaEndpoints.stateDropdown}`,
        );
        return response.data;
      } catch (error: any) {
        console.error('Error fetching cost centres:', error.message);
        throw error;
      }
    };
    
    const AddNewUser = async (data: UserconfigDTOType ) => {
        console.log(data);
        
      try {
        const response = await baseUrl.post(
          `${PoloaEndpoints.addUser}`,
          data,
        );
        return response.data;
      } catch (error: any) {
        console.error('Error adding vendor:', error);
        throw error;
      }
    };
    
    const UpdateUseraById = async (data: UserconfigUpdateDTOType) => {
      try {
        const response = await baseUrl.put(
          `${PoloaEndpoints.UpdateUser}/${data.userId}`,
          data,
        );
        return response.data;
      } catch (error: any) {
        console.error('Error editing vendor:', error);
        throw error;
      }
    };
    export const userServices = {
    
      fetchgetallUser,
      AddNewUser,
      UpdateUseraById,
      fetchgetcountry,
      fetchgetstate,
      fetchgetuserrole
    
    };
    