import { baseUrl } from './baseUrl';
import type {
   PoloaDTOType,
  PoloaUpdateDTOType} from '@/utils/Validators/schema/poloaSchema';
export enum PoloaQueries {
  GET_ALL= 'getAllPOLOA',

}

enum PoloaEndpoints {
  getAllPoloa = import.meta.env.VITE_GET_PO_LOA,
  AddPoloa = import.meta.env.VITE_ADD_PO_LOA,
    UpdatePoloa = import.meta.env.VITE_UPDATE_PO_LOA,
  // getAllPoloa = import.meta.env.VITE_GET_PO_LOA,
}


const fetchgetallpoloa = async () => {
  try {
    const response = await baseUrl.get(
      `${PoloaEndpoints.getAllPoloa}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};

const AddNewpoloa = async (data: PoloaDTOType ) => {
    console.log(data);
    
  try {
    const response = await baseUrl.post(
      `${PoloaEndpoints.AddPoloa}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

const UpdatePoloaById = async (data:PoloaUpdateDTOType) => {
  try {
    const response = await baseUrl.put(
      `${PoloaEndpoints.UpdatePoloa}/${data.poId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
export const PoloaServices = {

  fetchgetallpoloa,
  AddNewpoloa,
  UpdatePoloaById

};
