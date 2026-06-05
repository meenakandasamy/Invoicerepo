import { TicketApi,ticketUrl} from './baseUrl';
import type {SopmapSaveDTOType,SopmapUpdateDTOType} from '@/utils/Validators/schema/sopmappingSchema';
export enum TicketSopmappingQueries {
  GET_TICKET_SOPMAPPING= 'getAllTicketSopmapping',
    GET_TICKET_SOP_DROPDOWN= 'getAllTSopdropdown',

}
   const session=sessionStorage.getItem('session') ;
enum TicketSopmappingEndpoints {
  getAllTicketSopmapping = import.meta.env.VITE_SOP_MAPPING_GET,
    getAllTSopdropdown = import.meta.env.VITE_SOP_DROPDOWN_API,
  AddSopmapping = import.meta.env.VITE_SOP_MAPPING_POST,
    UpdateSopmapping = import.meta.env.VITE_SOP_MAPPING_PUT,
  // getAllTicketApproval = import.meta.env.VITE_GET_PO_LOA,
}
const fetchgetallTicketSopmappig = async (Id:any) => {

    
  try {
    const response = await TicketApi.get(
      `${TicketSopmappingEndpoints.getAllTicketSopmapping}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const fetchGetallSopdropdown = async (ticketTypeId:any) => {
  try {
    const response = await TicketApi.get(
      `${TicketSopmappingEndpoints.getAllTSopdropdown}=${ticketTypeId[0]}&ticketCategoryId=${ticketTypeId[1]}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};

const AddNewSopmapping = async (data: SopmapSaveDTOType ) => {
  console.log(data,'data in service');
  try {
    const response = await TicketApi.post(
      `${TicketSopmappingEndpoints.AddSopmapping}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};

const UpdateSopmappingById = async (data:SopmapUpdateDTOType) => {
  try {
    const response = await TicketApi.put(
      `${TicketSopmappingEndpoints.UpdateSopmapping}/${data.sopTemplateId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
export const TicketSopmappingServices = {
  fetchgetallTicketSopmappig,
  AddNewSopmapping,
  UpdateSopmappingById,
  fetchGetallSopdropdown

};
