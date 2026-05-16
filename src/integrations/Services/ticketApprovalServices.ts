import { baseUrl } from './baseUrl';
import type {
   PoloaDTOType,
  PoloaUpdateDTOType} from '@/utils/Validators/schema/poloaSchema';
export enum TicketApprovalQueries {
  GET_TICKET_APPROVAL_USERID= 'getAllTicketApproval',

}

enum TicketApprovalEndpoints {
  getAllTicketApproval = import.meta.env.VITE_APPROVAL_API_USERID,
  AddTicketApproval = import.meta.env.VITE_ADD_PO_LOA,
    UpdateTicketApproval = import.meta.env.VITE_UPDATE_PO_LOA,
  // getAllTicketApproval = import.meta.env.VITE_GET_PO_LOA,
}
const fetchgetallTicketApproval = async (id:number) => {
  try {
    const response = await baseUrl.get(
      `${TicketApprovalEndpoints.getAllTicketApproval}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};

const AddNewTicketApproval = async (data: PoloaDTOType ) => {
  try {
    const response = await baseUrl.post(
      `${TicketApprovalEndpoints.AddTicketApproval}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

const UpdateTicketApprovalById = async (data:PoloaUpdateDTOType) => {
  try {
    const response = await baseUrl.put(
      `${TicketApprovalEndpoints.UpdateTicketApproval}/${data.poId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
export const TicketApprovalServices = {
  fetchgetallTicketApproval,
  AddNewTicketApproval,
  UpdateTicketApprovalById

};
