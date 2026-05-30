import { baseUrl, ticketUrl } from './baseUrl';
import type {
  TicketconfigDTOType,
  TicketconfigUpdateDTOType,
  TicketcreationDTOType
} from '@/utils/Validators/schema/Ticketconfigschema';
import type {
TicketviewReassignDTOType
} from '@/utils/Validators/schema/TicketviewSchema';
export enum TicketconfigQueries {
  GET_TICKET_CONFIG_USERID = 'getAllTicketconfig',
  GET_TICKET_COCUNT_USERID = 'getAllTicketlistcount',
  GET_TICKET_DOWNLOAD = 'getDownloadticket',
  GET_TICKET_DETAILS = 'getticketDetails',
  GET_TICKET_HISTORY = 'getticketHistory',
  GET_TICKET_USERLIST = 'getticketuserlist',
}

enum TicketconfigEndpoints {
  getAllTicketconfig = import.meta.env.VITE_TICKET_LIST_BY_USERID,
  getDownloadticket = import.meta.env.VITE_TICKET_DOWNLOAD_REPORT,
  getticketDetails = import.meta.env.VITE_TICKET_VIEW_DETAILS,
  getticketHistory = import.meta.env.VITE_TICKET_HISTORY,
  getticketuserlist = import.meta.env.VITE_TICKET_USERLIST_BYSITEID,
  getAllTicketlistcount = import.meta.env.VITE_TICKET_USERID_CHART,
  AddTicketconfig = import.meta.env.VITE_ADD_PO_LOA,
  TicketFilterlist = import.meta.env.VITE_TICKET_FILTER_LIST,
  TicketFilterchart = import.meta.env.VITE_TICKET_FILTER_CHART,
  UpdateTicketconfig = import.meta.env.VITE_TICKET_UPDATE,
  Ticketcreation = import.meta.env.VITE_TICKET_CREATION,
    UpdateTicketreassign = import.meta.env.VITE_TICKET_REASSIGN,
      UpdateTickethold = import.meta.env.VITE_TICKET_HOLD,
  // getAllTicketconfig = import.meta.env.VITE_GET_PO_LOA,
}
const fetchgetallTicketconfig = async (id: number) => {
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
const fetchgetallTicketlistcocunt = async (id: number) => {
  try {
    const response = await baseUrl.get(
      `${TicketconfigEndpoints.getAllTicketlistcount}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const fetchgetallTicketHistory = async (id: number) => {
  try {
    const response = await baseUrl.get(
      `${TicketconfigEndpoints.getticketHistory}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const fetchgetallTicketuserlist = async (id: number) => {
  try {
    const response = await baseUrl.get(
      `${TicketconfigEndpoints.getticketuserlist}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const fetchgetallTicketdetails = async (id: number) => {
  try {
    const response = await baseUrl.get(
      `${TicketconfigEndpoints.getticketDetails}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const fetchgetallTicketdownload = async (id: number) => {
  try {
    const response = await ticketUrl.get(
      `${TicketconfigEndpoints.getDownloadticket}/${id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};
const AddNewTicketconfig = async (data: TicketconfigDTOType) => {
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
const TicketFilterlist = async (data: TicketconfigDTOType) => {
  try {
    const response = await baseUrl.post(
      `${TicketconfigEndpoints.TicketFilterlist}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};
const TicketFilterchart = async (data: TicketconfigDTOType) => {
  try {
    const response = await baseUrl.post(
      `${TicketconfigEndpoints.TicketFilterchart}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};
const TicketCreation = async (data: TicketcreationDTOType) => {
  try {
    const response = await baseUrl.post(
      `${TicketconfigEndpoints.Ticketcreation}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};
const UpdateTicketconfigById = async (data: TicketconfigUpdateDTOType) => {
  try {
    const response = await baseUrl.put(
      `${TicketconfigEndpoints.UpdateTicketconfig}/${data.ticketId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
const UpdateTicketreassign = async (data: TicketviewReassignDTOType) => {
  try {
    const response = await baseUrl.put(
      `${TicketconfigEndpoints.UpdateTicketreassign}/${data.ticketId}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
const UpdateTickethold = async (data: TicketconfigUpdateDTOType) => {
  try {
    const response = await baseUrl.put(
      `${TicketconfigEndpoints.UpdateTickethold}/${data.ticketId}`,
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
  TicketCreation,
  fetchgetallTicketHistory,
  fetchgetallTicketdetails,
  fetchgetallTicketuserlist,
  UpdateTicketconfigById,
  TicketFilterlist,
  TicketFilterchart,
  fetchgetallTicketlistcocunt,
  fetchgetallTicketdownload,UpdateTicketreassign,UpdateTickethold
};
