import { baseUrl } from './baseUrl';
import type { ExpenseApprovalType } from '@/utils/Validators/schema/ExpeneseSchema';

export enum ExpenseQueries {
  GET_EXPENSE = 'getExpense',
  CREATE_EXPENSE = 'createExpense',
  UPDATE_EXPENSE = 'updateExpense',
  DELETE_EXPENSE = 'deleteExpense',
  GET_EXPENSE_BY_ID = 'getExpenseById',
  GET_LOGS_BY_ID = 'getExpenseLogsById',
  APPROVE_EXPENSE = 'approveExpense',
  REJECT_EXPENSE = 'rejectExpense',
  GET_EXPENSE_BY_LEVEL = 'getExpenseByLevel',
  GET_EXPENSE_BY_COST_IDS = 'getExpenseByCostIds',
  GET_EXPENSE_BY_COST_IDS_FOR_ADMIN = 'getExpenseByCostIdsForAdmin',
  GET_EXPENSE_SPLIT_BY_ID = 'getExpenseSplitById',
  GET_EXPENSE_BY_COMPANY_ID = 'getExpenseByCompanyId',
  GET_EXPENSE_BY_CUSTOMER_ID = 'getExpenseByCustomerId',
  GET_EXPENSE_BY_ORG_ID = 'getExpenseByOrgId',
}

enum ExpenseEndpoints {
  getExpense = import.meta.env.VITE_GET_EXPENSE,
  createExpense = import.meta.env.VITE_CREATE_EXPENSE,
  updateExpense = import.meta.env.VITE_UPDATE_EXPENSE,
  deleteExpense = import.meta.env.VITE_DELETE_EXPENSE,
  getExpenseById = import.meta.env.VITE_GET_EXPENSE_BY_ID,
  getExpenseLogsById = import.meta.env.VITE_GET_EXPENSE_LOGS_BY_ID,
  approveExpense = import.meta.env.VITE_APPROVE_EXPENSE,
  rejectExpense = import.meta.env.VITE_REJECT_EXPENSE,
  getExpenseByLevel = import.meta.env.VITE_GET_EXPENSE_BY_LEVEL,
  getExpenseByCostIds = import.meta.env.VITE_GET_EXPENSE_BY_COST_IDS,
  getExpenseByCostIdsForAdmin = import.meta.env
    .VITE_GET_EXPENSE_BY_COST_IDS_FOR_ADMIN,
  getExpenseSplitById = import.meta.env.VITE_GET_EXPENSE_SPLIT_BY_ID,
  getExpenseByCompanyId = import.meta.env.VITE_GET_EXPENSE_BY_COMPANY_ID,
  getExpenseByCustomerId = import.meta.env.VITE_GET_EXPENSE_BY_CUSTOMER_ID,
  getExpenseByOrgId = import.meta.env.VITE_GET_EXPENSE_BY_ORG_ID,
}

// -------------------------------------------
// CRUD SERVICE METHODS FOR EXPENSE
// -------------------------------------------

// GET ALL
const fetchExpenses = async () => {
  const response = await baseUrl.get(`${ExpenseEndpoints.getExpense}`);
  return response.data;
};

// GET SINGLE BY ID
const fetchExpenseById = async (id: string | number) => {
  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseById}/${id}`,
  );
  return response.data;
};

// GET EXPENSES BY LEVEL
const fetchExpensesByLevel = async (level: string | number) => {
  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseByLevel}/${level}`,
  );
  return response.data;
};

// GET EXPENSES BY COMPANY ID
const fetchExpensesByCompanyId = async (companyId: string | number) => {
  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseByCompanyId}/${companyId}`,
  );
  return response.data;
};

// GET EXPENSES BY CUSTOMER ID
const fetchExpensesByCustomerId = async (customerId: string | number) => {
  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseByCustomerId}/${customerId}`,
  );
  return response.data;
};

// GET EXPENSES BY ORG ID
const fetchExpensesByOrgId = async (orgId: string | number) => {
  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseByOrgId}/${orgId}`,
  );
  return response.data;
};

// GET EXPENSES BY COST IDS
// Example usage: costCentreIds=[3], costHeaderIds=[1]
const fetchExpensesByCostIds = async (
  costCentreIds: Array<number>,
  costHeaderIds: Array<number>,
  createdBy?: number,
) => {
  const params = new URLSearchParams();
  params.append('costCentreIds', costCentreIds.join(','));
  params.append('costHeaderIds', costHeaderIds.join(','));
  if (createdBy) params.append('createdBy', createdBy.toString());

  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseByCostIds}?${params.toString()}`,
  );
  return response.data;
};

// GET EXPENSES BY COST IDS FOR ADMIN
const fetchExpensesByCostIdsForAdmin = async (
  costCentreIds: Array<number>,
  costHeaderIds: Array<number>,
  createdBy?: number,
) => {
  const params = new URLSearchParams();
  params.append('costCentreIds', costCentreIds.join(','));
  params.append('costHeaderIds', costHeaderIds.join(','));
  if (createdBy) params.append('createdBy', createdBy.toString());

  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseByCostIdsForAdmin}?${params.toString()}`,
  );
  return response.data;
};

// CREATE
const createExpense = async (payload: any) => {
  console.log(payload);

  const response = await baseUrl.post(
    `${ExpenseEndpoints.createExpense}`,
    payload,
  );
  return response.data;
};

// UPDATE
const updateExpense = async (id: string | number, payload: any) => {
  const response = await baseUrl.put(
    `${ExpenseEndpoints.updateExpense}/${id}`,
    payload,
  );
  return response.data;
};

// DELETE
const deleteExpense = async (id: string | number) => {
  const response = await baseUrl.delete(
    `${ExpenseEndpoints.deleteExpense}/${id}`,
  );
  return response.data;
};

// -------------------------------------------
// CRUD SERVICE METHODS FOR EXPENSE LOGS
// -------------------------------------------

// GET LOGS BY ID

const fetchExpenseLogsById = async (id: string | number) => {
  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseLogsById}/${id}`,
  );
  return response.data;
};

// -------------------------------------------
// APPROVE/REJECT SERVICE METHODS FOR EXPENSE
// -------------------------------------------

const approveExpense = async (payload: ExpenseApprovalType) => {
  const response = await baseUrl.post(
    `${ExpenseEndpoints.approveExpense}`,
    payload,
  );
  return response.data;
};

const rejectExpense = async (payload: any) => {
  const response = await baseUrl.post(
    `${ExpenseEndpoints.rejectExpense}`,
    payload,
  );
  return response.data;
};

// -------------------------------------------
// CRUD SERVICE METHODS FOR EXPENSES SPLIT
// -------------------------------------------
const fetchExpenseSplitById = async (id: string | number) => {
  const response = await baseUrl.get(
    `${ExpenseEndpoints.getExpenseSplitById}/${id}`,
  );
  return response.data;
};

export const ExpenseServices = {
  fetchExpenses,
  fetchExpenseById,
  fetchExpensesByCompanyId,
  fetchExpensesByCustomerId,
  fetchExpensesByOrgId,
  fetchExpensesByLevel,
  fetchExpensesByCostIds,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchExpenseLogsById,
  approveExpense,
  rejectExpense,
  fetchExpensesByCostIdsForAdmin,
  fetchExpenseSplitById,
};
