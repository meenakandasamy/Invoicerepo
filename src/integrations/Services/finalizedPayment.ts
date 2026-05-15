import { baseUrl } from './baseUrl';
import type { FinalizedPaymentUpdateDTOType } from '@/utils/Validators/Schema/finalizedSchema';

export enum FinalizedPaymentQuery {
  GET_ALL_FINALIZED_PAYMENT = 'getAllFinalizedPayments',
  GET_ALL_FINALIZED_PAYMENT_BY_ORG_ID = 'getAllFinalizedPaymentsByOrgId',
}
enum FinalizedPaymentEndpoints {
  getAllFinalizedPayments = import.meta.env.VITE_GETALL_FINALIZED_PAYMENT,
  updateFinalist = import.meta.env.VITE_GETALL_FINALIZED_PAYMENT_UPDATE,
  getAllFinalizedPaymentsByOrgId = import.meta.env
    .VITE_GETALL_FINALIZED_PAYMENT_BY_ORG_ID,
}
const FetchAllFinalizedPayments = async () => {
  try {
    const response = await baseUrl.get(
      `${FinalizedPaymentEndpoints.getAllFinalizedPayments}`,
    );
    if (response.data) {
      if (!Array.isArray(response.data)) return [];
      return response.data;
    }
  } catch (error: any) {
    console.error('Error fetching all finalizedpayments:', error.message);
    throw error;
  }
};

const FetchFinalizedPaymentByOrgId = async (id: string | number) => {
  try {
    const response = await baseUrl.get(
      `${FinalizedPaymentEndpoints.getAllFinalizedPaymentsByOrgId}/${id}`,
    );
    if (response.data) {
      if (!Array.isArray(response.data)) return [];
      return response.data;
    }
  } catch (error: any) {
    console.error('Error fetching all finalizedpayments:', error.message);
    throw error;
  }
};

const UpdatefinalizedPaymentById = async (
  id: string | number,
  payload: any,
) => {
  const response = await baseUrl.post(
    `${FinalizedPaymentEndpoints.updateFinalist}/${id}`,
    payload,
  );
  return response.data;
};
export const FinalizedPaymentServices = {
  FetchAllFinalizedPayments,
  FetchFinalizedPaymentByOrgId,
  UpdatefinalizedPaymentById,
};
