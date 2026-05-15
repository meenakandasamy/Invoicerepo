import type {
  UserconfigDTOType,
  UserconfigUpdateDTOType,
} from '@/utils/Validators/schema/userconfigSchema';

export interface UserconfigDTO extends UserconfigDTOType {}

export interface UserconfigUpdateDTO extends UserconfigUpdateDTOType {
    userId: any;
    firstName :string;
      lastName?:string;
     emailId?:string;
     mobileNo?:string;
      city?:string;
       state?: string;
      country?: string;
     postalCode?:number;
     status?:number;
   

}