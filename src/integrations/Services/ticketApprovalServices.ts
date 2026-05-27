import { baseUrl } from './baseUrl';
import type {
  TicketapprovalDTOType,
  TicketapprovalUpdateDTOType,
} from '@/utils/Validators/schema/Ticketapprovalschema';
export enum TicketApprovalQueries {
  GET_TICKET_APPROVAL_USERID = 'getAllTicketApproval',
    GET_TICKET_APPROVAL_COCUNT = 'getTicketApprovalcocunt',
    VITE_TICKET_APPROVAL_USERLIST='getTicketApprovaluserlist'
}

enum TicketApprovalEndpoints {
  getAllTicketApproval = import.meta.env.VITE_APPROVAL_API_USERID,
  getTicketApprovalcocunt = import.meta.env.VITE_APPROVAL_LIST_COCUNT,
   getTicketApprovaluserlist = import.meta.env.VITE_TICKET_APPROVAL_USERLIST,
  AddTicketApproval = import.meta.env.VITE_TICKET_APPROVAL,
  UpdateTicketApproval = import.meta.env.VITE_UPDATE_PO_LOA,
  TicketFilterlist = import.meta.env.VITE_TICKET_FILTER_LIST,
    TicketFiltercocunt = import.meta.env.VITE_APPROVAL_FILTER_COCUNT,
  // getAllTicketApproval = import.meta.env.VITE_GET_PO_LOA,
}
const fetchgetallTicketApproval = async (id: number) => {
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
const fetchgetTicketApprovalCount = async (id: number) => {
  try {
    const response = await baseUrl.get(
      `${TicketApprovalEndpoints.getTicketApprovalcocunt}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const fetchapprovaluserlist = async (id: number) => {
  try {
    const response = await baseUrl.get(
      `${TicketApprovalEndpoints.getTicketApprovaluserlist}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const TicketFilterlist = async (data: any) => {
  try {
    const response = await baseUrl.post(
      `${TicketApprovalEndpoints.TicketFilterlist}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};
const TicketFiltercocuntlist = async (data: any) => {
  try {
    const response = await baseUrl.post(
      `${TicketApprovalEndpoints.TicketFiltercocunt}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};
const postTicketApproval = async (data: TicketapprovalDTOType) => {
  console.log(data);
  
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

const UpdateTicketApprovalById = async (data: TicketapprovalUpdateDTOType) => {
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
  postTicketApproval,
  UpdateTicketApprovalById,
  fetchgetTicketApprovalCount,
  fetchapprovaluserlist,
  TicketFilterlist,TicketFiltercocuntlist
};
