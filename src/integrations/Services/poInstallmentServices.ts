import { baseUrl } from './baseUrl';

export enum POInstallmentQuery {
  GET_ALL_PO_INSTALLMENTS = 'getAllPOInstallments',
  GET_ALL_OVERDUE_LIST = 'getAllOverdueInstallments',
  GET_INSTALLMENTS_BY_PO_ID = 'getInstallmentsByPoId',
}
enum PoInstallmentEndpoints {
  getAllPOInstallments = import.meta.env.VITE_GET_ALL_PO_INSTALLMENTS,
  getAllOverdueInstallments = import.meta.env.VITE_GET_ALL_OVERDUE_LIST,
  fetchInstallmentsByPoId = import.meta.env.VITE_FETCH_INSTALLMENTS_BY_PO_ID,
  updateInstallmentById = import.meta.env.VITE_PUT_INSTALLMENT_BY_ID

}
export const fetchAllPOInstallments = async () => {
  try {
    const response = await baseUrl.get(
      `${PoInstallmentEndpoints.getAllPOInstallments}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching installments:', error.message);
    throw error;
  }
};

const fetchOverdueInstallments = async () => {
  try {
    const response = await baseUrl.get(
      `${PoInstallmentEndpoints.getAllOverdueInstallments}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching OVERDUE installments:', error.message);
    throw error;
  }
}
const fetchInstallmentsByPoId = async (poId: string) => {
  try {
    const response = await baseUrl.get(
      `${PoInstallmentEndpoints.fetchInstallmentsByPoId}/${poId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching installments by id:', error.message);
    throw error;
  }
 };
// const UpdateInstallmentById = async (data: {
//   poInstallmentId: string;
//   poInstallment: any;
// }) => {
//   try {
//     // const parsedData = Validator.parse(
//     //   PoInstallmentUpdateSchema,
//     //   data.poInstallment,
//     // );
//     const parsedData = data.poInstallment
//     if (!parsedData.success) {
//       throw new Error(parsedData.error);
//     }
//     const response = await baseUrl.put(
//       `${PoInstallmentEndpoints.updateInstallmentById}/${data.poInstallmentId}`,
//       parsedData.data,
//     );
//     return response.data;
//   } catch (error: any) {
//     console.error('Error updating purchase order:', error.message);
//     throw error;
//   }
// };
const UpdatePaymentById = async (data: {
  poInstallmentId: string;
  poInstallment: any;
}) => {
  try {
    const response = await baseUrl.put(
      `${PoInstallmentEndpoints.updateInstallmentById}/${data.poInstallmentId}`,
      data.poInstallment,
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating purchase order:', error.message);
    throw error;
  }
};

export const poInstallmentServices = {
  fetchInstallmentsByPoId,
  fetchAllPOInstallments,
  fetchOverdueInstallments,
  UpdatePaymentById
};