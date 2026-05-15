import { baseUrl } from './baseUrl';
import type {
  PaymentTermsDTO,
  PaymentTermsUpdateDTO,
} from '@/models/paymentTermDTO';
import {
  PaymentTermsSaveSchema,
  PaymentTermsUpdateSchema,
} from '@/utils/Validators/Schema/PaymentTermsSchema';
import { Validator } from '@/utils/Validators/ValidatorData';

export enum PaymentTermQuery {
  GET_ALL_PAYMENT_TERMS = 'getAllPaymentTerms',
  GET_PAYMENT_TERM_DROPDOWN = 'getPaymentTermDropdown',
  GET_PAYMENT_TERM_BY_ID = 'getPaymentTermById',
}

enum paymentTermEndpoints {
  getAllPaymentTerms = import.meta.env.VITE_GETALL_PAYMENT_TERMS,
  getPaymentTermById = import.meta.env.VITE_GET_PT_BY_ID,
  addPaymentTerm = import.meta.env.VITE_ADD_PAYMENT_TERM,
  updatePaymentTerm = import.meta.env.VITE_UPDATE_PAYMENT_TERM_BY_ID,
  deletePaymentTerm = import.meta.env.VITE_DELETE_PAYMENT_TERM_BY_ID,
}

const FetchAllPaymentTerms = async () => {
  try {
    const response = await baseUrl.get(
      `${paymentTermEndpoints.getAllPaymentTerms}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payment term:', error.message);
    throw error;
  }
};

const FetchPaymentTermById = async (data: { paymentTermsId: string }) => {
  try {
    const response = await baseUrl.get(
      `${paymentTermEndpoints.getPaymentTermById}/${data.paymentTermsId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching payment term by id:', error.message);
    throw error;
  }
};

const AddNewPaymentTerm = async (data: { paymentTerms: PaymentTermsDTO }) => {
  try {
    const parsedData = Validator.parse(
      PaymentTermsSaveSchema,
      data.paymentTerms,
    );
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.post(
      `${paymentTermEndpoints.addPaymentTerm}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error adding payment term:', error.message);
    throw error;
  }
};

const UpdatePaymentTermById = async (data: {
  paymentTermsId: string;
  paymentTerms: PaymentTermsUpdateDTO;
}) => {
  try {
    console.log('Data Before Validation:', data.paymentTerms);
    const parsedData = Validator.parse(
      PaymentTermsUpdateSchema,
      data.paymentTerms,
    );
    if (!parsedData.success) {
      throw new Error(parsedData.error);
    }
    const response = await baseUrl.put(
      `${paymentTermEndpoints.updatePaymentTerm}/${data.paymentTermsId}`,
      parsedData.data,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating payment term:', error);
    throw error;
  }
};

const DeletePaymentTermById = async (data: { paymentTermsId: string }) => {
  try {
    console.log(data.paymentTermsId);
    const response = await baseUrl.delete(
      `${paymentTermEndpoints.deletePaymentTerm}/${data.paymentTermsId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error deleting payment term:', error.message);
    throw error;
  }
};

export const PaymentTermServices = {
  FetchAllPaymentTerms,
  FetchPaymentTermById,
  AddNewPaymentTerm,
  UpdatePaymentTermById,
  DeletePaymentTermById,
};
