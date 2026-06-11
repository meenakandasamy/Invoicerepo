import { TicketApi,} from './baseUrl';
import type  {TemplatemappingSaveDTO,TemplatemappingUpdateDTO} from '@/models/TemplatemapDTO'
import  {TemplatemappingSaveSchema, TemplatemappingUpdateSchema,} from '@/utils/Validators/schema/TemplatemappingSchema';
import { Validator } from '@/utils/Validators/ValidatorData';


export enum TemplatemappingQueries {
  GET_TEMPLATE_MAPPING= 'getAllTemplatemap',
    GET_TICKET_SOP_DROPDOWN= 'getAllTSopdropdown',
}

enum TemplatemappingEndpoints {
  getAllTemplatemap = import.meta.env.VITE_TEMPLATE_MAPPING_GET,
  AddTemplatemap = import.meta.env.VITE_TEMPLATE_MAPPING_POST,
    UpdateTemplatemap = import.meta.env.VITE_TEMPLATE_MAPPING_PUT,
}

const fetchgetallTemplatemap = async (Id:any) => { 
  try {
   
    const response = await TicketApi.get(
      `${TemplatemappingEndpoints.getAllTemplatemap}?companyId=${Id}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cost centres:', error.message);
    throw error;
  }
};


const AddNewTemplatemap = async (data: TemplatemappingSaveDTO ) => {
   const parsedData = Validator.parse(TemplatemappingSaveSchema, data);
    if (!parsedData.success) {
      console.error('Templatemapping details:', parsedData.error);
      throw new Error(parsedData.error);
    }
  try {
    const response = await TicketApi.post(
      `${TemplatemappingEndpoints.AddTemplatemap}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding vendor:', error);
    throw error;
  }
};
console.log(TicketApi,"TicketApi");

const UpdateTemplatemap = async (data:TemplatemappingUpdateDTO) => {
  try {
      const response = await TicketApi.put(
      `${TemplatemappingEndpoints.UpdateTemplatemap}/${data.sopTemplateMapId}`,
      data,
    );
   
    return response.data;
  } catch (error: any) {
    console.error('Error editing vendor:', error);
    throw error;
  }
};
export const TemplatemappingServices = {
  fetchgetallTemplatemap,
  AddNewTemplatemap,
  UpdateTemplatemap

};
