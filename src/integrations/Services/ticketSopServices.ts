import { baseUrl,ticketUrl} from './baseUrl';
import type {SopDTOType,SopUpdateDTOType} from '@/utils/Validators/schema/sopSchema';
export enum TicketSopQueries {
  GET_TICKET_SOP= 'getAllTicketApproval',
    GET_TICKET_SOP_DROPDOWN= 'getAllTSopdropdown',

}
   const session=sessionStorage.getItem('session') ;
enum TicketSopEndpoints {
  getAllTicketSop = import.meta.env.VITE_SOP_API_GET,
    getAllTSopdropdown = import.meta.env.VITE_SOP_DROPDOWN_API,
  AddSop = import.meta.env.VITE_SOP_API_POST,
    UpdateSop = import.meta.env.VITE_SOP_API_PUT,
  // getAllTicketApproval = import.meta.env.VITE_GET_PO_LOA,
}
const fetchgetallTicketSop = async (Id:any) => {

    
  try {
    const response = await ticketUrl.get(
      `${TicketSopEndpoints.getAllTicketSop}?companyId=${Id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const fetchGetallSopdropdown = async (ticketTypeId:any) => {
  try {
    const response = await ticketUrl.get(
      `${TicketSopEndpoints.getAllTSopdropdown}=${ticketTypeId[0]}&ticketCategoryId=${ticketTypeId[1]}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};

const AddNewSop = async (data: SopDTOType ) => {
  try {
    const response = await ticketUrl.post(
      `${TicketSopEndpoints.AddSop}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

const UpdateSopById = async (data:SopUpdateDTOType) => {
  try {
    const response = await ticketUrl.put(
      `${TicketSopEndpoints.UpdateSop}/${data.sopId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
export const TicketSopServices = {
  fetchgetallTicketSop,
  AddNewSop,
  UpdateSopById,
  fetchGetallSopdropdown

};
