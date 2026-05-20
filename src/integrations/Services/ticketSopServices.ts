import { baseUrl,ticketUrl} from './baseUrl';
import type {SopDTOType,SopUpdateDTOType} from '@/utils/Validators/schema/sopSchema';
export enum TicketSopQueries {
  GET_TICKET_SOP= 'getAllTicketApproval',

}
   const session=sessionStorage.getItem('session') ;
enum TicketSopEndpoints {
  getAllTicketSop = import.meta.env.VITE_SOP_API_GET,
  AddSop = import.meta.env.VITE_SOP_API_POST,
    UpdateSop = import.meta.env.VITE_SOP_API_PUT,
  // getAllTicketApproval = import.meta.env.VITE_GET_PO_LOA,
}
const fetchgetallTicketSop = async () => {
 const companyId= session ? JSON.parse(session).companyId : null;
    console.log(companyId);
    
  try {
    const response = await ticketUrl.get(
      `${TicketSopEndpoints.getAllTicketSop}?companyId=${companyId}`,
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
  UpdateSopById

};
