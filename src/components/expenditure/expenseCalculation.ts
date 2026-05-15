import type { ExpenseSplit } from '@/types/expense';
import type { ExpenseDTOType } from '@/utils/Validators/schema/ExpeneseSchema';

/**
 * Distribute advance consumed for an expense object
 * Given an expense object, distribute the advance consumed to each split
 * according to the approved amount or the split percent if no approved amount is available.
 * The advance consumed is recomputed to ensure that it does not exceed the parent advance.
 *
 * @param {any} form - The expense object to distribute the advance consumed.
 * @param {Array<ExpenseSplit>} splitsArr - Optional array of expense splits.
 * @returns {object} The updated expense object with the distributed advance consumed.
 */

function distributeAdvanceConsumed(
  form: any,
  splitsArr?: Array<ExpenseSplit>,
): {
  sourceAdvance: number;
  advanceConsumed: number;
  amountApproved: number;
  splits: Array<ExpenseSplit>;
} {
  const parentAdvance = Number(form.state.values.advanceConsumed || 0);

  const splits: Array<ExpenseSplit> =
    splitsArr || form.state.values.expenseSplits || [];
  const updated = splits.map((s: ExpenseSplit) => ({ ...s }));

  // If no advance, return 0 for all
  if (parentAdvance <= 0) {
    updated.forEach((s) => (s.advanceConsumed = 0));
    return {
      sourceAdvance: 0,
      advanceConsumed: 0,
      amountApproved: 0,
      splits: updated,
    };
  }

  // Step 1: Compute capacities
  const capacities = updated.map(
    (s: ExpenseSplit) => Number(s.totalAmmountNogst) || 0,
  );

  // Find non-zero capacity splits
  const nonZeroSplits = updated.filter((s) => Number(s.totalAmmountNogst) > 0);
  const nonZeroCount = nonZeroSplits.length;

  // Total capacity
  const totalCapacity = capacities.reduce((a, b) => a + b, 0);

  // Step 2: Decide mode
  const useEqual = parentAdvance < totalCapacity && nonZeroCount > 0;

  // -------------------------------------------------------
  // MODE 1: Equal Distribution
  // -------------------------------------------------------
  if (useEqual) {
    const equalShare = parentAdvance / nonZeroCount;
    let allocatedSum = 0;

    updated.forEach((s) => {
      const cap = Number(s.totalAmmountNogst) || 0;

      if (cap === 0) {
        s.advanceConsumed = 0;
        return;
      }

      const alloc = Math.min(equalShare, cap);
      s.advanceConsumed = Number(alloc.toFixed(2));
      allocatedSum += alloc;
    });

    return {
      sourceAdvance: parentAdvance,
      advanceConsumed: form.state.values.advanceConsumed,
      amountApproved: updated.reduce(
        (sum, s) => sum + (Number(s.amountApproved) || 0),
        0,
      ),
      splits: updated,
    };
  }

  // -------------------------------------------------------
  // MODE 2: Greedy allocation (fill capacities in order)
  // -------------------------------------------------------
  let remaining = parentAdvance;

  updated.forEach((s) => {
    const cap = Number(s.totalAmmountNogst) || 0;

    if (remaining <= 0 || cap === 0) {
      s.advanceConsumed = 0;
      return;
    }

    const alloc = Math.min(remaining, cap);
    s.advanceConsumed = Number(alloc.toFixed(2));
    remaining -= alloc;
  });

  const allocatedSum = updated.reduce(
    (sum, s) => sum + (s.advanceConsumed || 0),
    0,
  );

  return {
    sourceAdvance: parentAdvance,
    advanceConsumed: allocatedSum,
    amountApproved: updated.reduce(
      (sum, s) => sum + (Number(s.amountApproved) || 0),
      0,
    ),
    splits: updated,
  };
}

/**
 * Distribute advance consumed for an expense object
 * Given an expense object, distribute the advance consumed to each split
 * according to the approved amount or the split percent if no approved amount is available.
 * The advance consumed is recomputed to ensure that it does not exceed the parent advance.
 *
 * @param {ExpenseDTOType} expense - The expense object to distribute the advance consumed.
 * @return {ExpenseDTOType} The updated expense object with the distributed advance consumed.
 */
function distributeAdvanceConsumedForExpense(
  expense: ExpenseDTOType,
): ExpenseDTOType {
  const parentAdvance =
    Number(
      expense.advanceConsumed ? expense.advanceConsumed : expense.sourceAdvance,
    ) || 0;

  const splits = expense.expenseSplits?.map((s) => ({ ...s })) || [];

  // If no advance, set all splits to 0
  if (parentAdvance <= 0) {
    splits.forEach((s) => (s.advanceConsumed = 0));
    expense.advanceConsumed = 0;
    return { ...expense, expenseSplits: splits };
  }

  // Step 1: Compute capacities
  const capacities = splits.map((s) => Number(s.totalAmmountNogst) || 0);

  // Filter non-zero capacity splits
  const nonZeroSplits = splits.filter((s) => Number(s.totalAmmountNogst) > 0);
  const nonZeroCount = nonZeroSplits.length;

  // Total capacity
  const totalCapacity = capacities.reduce((a, b) => a + b, 0);

  // Step 2: Decide mode
  const useEqual = parentAdvance < totalCapacity && nonZeroCount > 0;

  // -------------------------------------------------------
  // MODE 1: Equal Distribution
  // -------------------------------------------------------
  if (useEqual) {
    const equalShare = parentAdvance / nonZeroCount;

    splits.forEach((s) => {
      const cap = Number(s.totalAmmountNogst) || 0;
      s.advanceConsumed =
        cap === 0 ? 0 : Number(Math.min(equalShare, cap).toFixed(2));
    });
  }
  // -------------------------------------------------------
  // MODE 2: Greedy allocation (fill capacities in order)
  // -------------------------------------------------------
  else {
    let remaining = parentAdvance;

    splits.forEach((s) => {
      const cap = Number(s.totalAmmountNogst) || 0;

      if (remaining <= 0 || cap === 0) {
        s.advanceConsumed = 0;
        return;
      }

      const alloc = Math.min(remaining, cap);
      s.advanceConsumed = Number(alloc.toFixed(2));
      remaining -= alloc;
    });
  }

  // Compute total allocated
  const totalAllocated = splits.reduce(
    (sum, s) => sum + (s.advanceConsumed || 0),
    0,
  );

  expense.advanceConsumed = Number(totalAllocated.toFixed(2));
  expense.expenseSplits = splits;

  return expense;
}

/**
 * Calculate various amounts from an ExpenseDTOType object.
 * @param parent - an ExpenseDTOType object
 * @returns an object containing the following properties:
 *   - sourceAmount: the total amount of the expense
 *   - gstAmount: the GST amount of the expense
 *   - tdsAmount: the TDS amount of the expense
 *   - amountPayable: the amount payable after GST and TDS
 *   - finalSource: the final source amount
 *   - finalGst: the final GST amount
 *   - finalTds: the final TDS amount
 *   - finalAmount: the final amount payable after GST and TDS
 */
function calculateAmounts(parent: ExpenseDTOType) {
  //  console.group('🔍 calculateAmounts Debug');

  const splits = parent.expenseSplits || [];

  // ---- 1️. SOURCE AMOUNT ----
  //  console.group('1️ SOURCE AMOUNT');
  const sumOfSplitApproved = splits.reduce(
    (a, s) => a + (Number(s.amountApproved) || 0),
    0,
  );

  //  console.log('sumOfSplitApproved:', sumOfSplitApproved);
  //  console.log('parent.totalAmmountNoGst:', parent.totalAmmountNoGst);

  const sourceAmount = Number(
    sumOfSplitApproved || parent.totalAmmountNoGst || 0,
  );

  //  console.log('-> sourceAmount:', sourceAmount);
  //  console.groupEnd();

  // ---- 2️. GST AMOUNT ----
  //  console.group('2️ GST AMOUNT');
  const advance = Number(parent.advanceConsumed || 0);
  // const gstPercent = Number(parent.gstPercentage || 0);

  const separteGSTAmountSum = splits
    .map((s: any) => ((s.gstPercentage || 0) * s.amountApproved) / 100)
    .reduce((a: number, b: number) => a + b, 0);
  //  console.log('advance:', advance);
  console.log('gstSeparte:', separteGSTAmountSum);

  // const gstAmount = ((sourceAmount - advance) * gstPercent) / 100;
  //  console.log('-> gstAmount:', gstAmount);
  //  console.groupEnd();

  // ---- 3️. TDS AMOUNT ----
  //  console.group('3️. TDS AMOUNT');
  const tdsPercent = Number(parent.tdsPercentage || 0);

  //  console.log('tdsPercent:', tdsPercent);

  const tdsAmount = (sourceAmount * tdsPercent) / 100;
  //  console.log('-> tdsAmount:', tdsAmount);
  //  console.groupEnd();

  // ---- 4️. AMOUNT PAYABLE ----
  //  console.group('4️ AMOUNT PAYABLE');
  const amountPayable =
    sourceAmount - advance + separteGSTAmountSum - tdsAmount;

  // console.log('sourceAmount:', sourceAmount);
  // console.log('advance:', advance);
  // console.log('gstAmount:', separteGSTAmountSum);
  // console.log('tdsAmount:', tdsAmount);
  // console.log('-> amountPayable:', amountPayable);
  //  console.groupEnd();

  // ---- 5️. FINAL AMOUNT ----
  //  console.group('5️ FINAL AMOUNT (Parent Total as Source)');
  const finalSource = Number(parent.totalAmmountNoGst || 0);

  //  console.log('finalSource:', finalSource);

  // const finalGst =
  //   gstSeparte > 0 ? finalSource - advance + gstSeparte : finalSource - advance;
  const finalTds = (finalSource * tdsPercent) / 100;
  const finalAmount = finalSource - advance + separteGSTAmountSum - finalTds;

  //  console.log('finalGst:', finalGst);
  //  console.log('finalTds:', finalTds);
  //  console.log('-> finalAmount:', finalAmount);
  //  console.groupEnd();

  //  console.groupEnd(); // end calculateAmounts Debug

  return {
    sourceAmount,
    separteGSTAmountSum,
    tdsAmount,
    amountPayable,
    finalSource,
    // finalGst,
    finalTds,
    finalAmount,
  };
}

export {
  distributeAdvanceConsumed,
  distributeAdvanceConsumedForExpense,
  calculateAmounts,
};
