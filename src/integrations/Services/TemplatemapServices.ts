import { TicketApi,ticketUrl} from './baseUrl';
import type {SopDTOType,SopUpdateDTOType} from '@/utils/Validators/schema/sopSchema';
export enum TicketSopQueries {
  GET_TICKET_SOP= 'getAllTicketApproval',
    GET_TICKET_SOP_DROPDOWN= 'getAllTSopdropdown',

}
   const session=sessionStorage.getItem('session') ;
enum TicketSopEndpoints {
  getAllTicketSop = import.meta.env.VITE_TEMPLATE_MAPPING_GET,
   
  AddTemplatemap = import.meta.env.VITE_TEMPLATE_MAPPING_POST,
    UpdateTemplatemap = import.meta.env.VITE_TEMPLATE_MAPPING_PUT,
  // getAllTicketApproval = import.meta.env.VITE_GET_PO_LOA,
}
const fetchgetallTicketSop = async (Id:any) => { 
  try {
    const response = await TicketApi.get(
      `${TicketSopEndpoints.getAllTicketSop}?companyId=${Id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};


const AddNewTemplatemap = async (data: SopDTOType ) => {
  try {
    const response = await TicketApi.post(
      `${TicketSopEndpoints.AddTemplatemap}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

const UpdateTemplatemap = async (data:SopUpdateDTOType) => {
  try {
    const response = await TicketApi.put(
      `${TicketSopEndpoints.UpdateTemplatemap}/${data.sopId}`,
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
  AddNewTemplatemap,
  UpdateTemplatemap

};
