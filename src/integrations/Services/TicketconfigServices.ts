import { baseUrl } from './baseUrl';
import type {
   PoloaDTOType,
  PoloaUpdateDTOType} from '@/utils/Validators/schema/poloaSchema';
export enum TicketconfigQueries {
  GET_TICKET_CONFIG_USERID= 'getAllTicketconfig',

}

enum TicketconfigEndpoints {
  getAllTicketconfig = import.meta.env.VITE_TICKET_LIST_BY_USERID,
  AddTicketconfig = import.meta.env.VITE_ADD_PO_LOA,
    UpdateTicketconfig = import.meta.env.VITE_UPDATE_PO_LOA,
  // getAllTicketconfig = import.meta.env.VITE_GET_PO_LOA,
}
const fetchgetallTicketconfig = async (id:number) => {
  try {
    const response = await baseUrl.get(
      `${TicketconfigEndpoints.getAllTicketconfig}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};

const AddNewTicketconfig = async (data: PoloaDTOType ) => {
  try {
    const response = await baseUrl.post(
      `${TicketconfigEndpoints.AddTicketconfig}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

const UpdateTicketconfigById = async (data:PoloaUpdateDTOType) => {
  try {
    const response = await baseUrl.put(
      `${TicketconfigEndpoints.UpdateTicketconfig}/${data.poId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
export const TicketconfigServices = {
  fetchgetallTicketconfig,
  AddNewTicketconfig,
  UpdateTicketconfigById

};
