import type {
  ExpenseDTOType,
  ExpenseSplitType,
} from '@/utils/Validators/schema/ExpeneseSchema';

export type Expense = ExpenseDTOType;
export type ExpenseList = Array<Expense>;

export type ExpenseSplit = ExpenseSplitType;
export type ExpenseSplitList = Array<ExpenseSplit>;
