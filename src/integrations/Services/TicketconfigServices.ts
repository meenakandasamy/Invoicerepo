import { baseUrl } from './baseUrl';
import type {TicketconfigDTOType,TicketconfigUpdateDTOType} from '@/utils/Validators/schema/Ticketconfigschema';
export enum TicketconfigQueries {
  GET_TICKET_CONFIG_USERID= 'getAllTicketconfig',
  GET_TICKET_COCUNT_USERID= 'getAllTicketlistcount',
}

enum TicketconfigEndpoints {
  getAllTicketconfig = import.meta.env.VITE_TICKET_LIST_BY_USERID,
  getAllTicketlistcount = import.meta.env.VITE_TICKET_USERID_CHART,
  AddTicketconfig = import.meta.env.VITE_ADD_PO_LOA,
    TicketFilterlist = import.meta.env.VITE_TICKET_FILTER_LIST,
    TicketFilterchart = import.meta.env.VITE_TICKET_FILTER_CHART,
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
const fetchgetallTicketlistcocunt = async (id:number) => {
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

const AddNewTicketconfig = async (data: TicketconfigDTOType ) => {
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
const TicketFilterlist = async (data: TicketconfigDTOType ) => {
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
const TicketFilterchart = async (data: TicketconfigDTOType ) => {
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
const UpdateTicketconfigById = async (data:TicketconfigUpdateDTOType) => {
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
  UpdateTicketconfigById,TicketFilterlist,TicketFilterchart,fetchgetallTicketlistcocunt

};
