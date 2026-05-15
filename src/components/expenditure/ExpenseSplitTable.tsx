import type { ExpenseDTOType } from '@/utils/Validators/schema/ExpeneseSchema';
import { Card } from '@/components/ui/card';
import { INTL_UTILS } from '@/utils/common/IntlUtils';

const ExpenseSplitTable = ({ expense }: { expense: ExpenseDTOType }) => {
  const { expenseSplits, gstPercentage, tdsAmount, amountPayable } = expense;
  console.log(expense);

  if (!expenseSplits) {
    return null;
  }

  // Calculate totals
  const totalAmountToPay = expenseSplits.reduce(
    (sum, split) => Number(sum) + Number(split.totalAmmountNogst || 0),
    0,
  );
  const totalApproved = expenseSplits.reduce(
    (sum, split) => Number(sum) + Number(split.amountApproved || 0),
    0,
  );
  const totalAdvanceConsumed = expenseSplits.reduce(
    (sum, split) => Number(sum) + Number(split.advanceConsumed || 0),
    0,
  );

  const totalGSTAmountBySplits = expenseSplits.reduce(
    (sum, split) => sum + Number(split.gstAmount || 0),
    0,
  );

  //   const gstAmount = (
  //     ((totalApproved - totalAdvanceConsumed) * Number(gstPercentage || 0)) /
  //     100
  //   ).toFixed(2);
  const tds = Number(tdsAmount || 0);

  const convertMoney = (amount: number) =>
    INTL_UTILS.formatCurrency({ value: amount });

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">Expense Splits</h2>
      <table className="w-full table-auto border border-gray-200 max-h-[400px] overflow-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Cost Centre</th>
            <th className="border px-4 py-2 text-left">Cost Header</th>
            <th className="border px-4 py-2 text-right">Amount to Pay</th>
            <th className="border px-4 py-2 text-right">Approved Amount</th>
            <th className="border px-4 py-2 text-right">Advance Consumed</th>
            <th className="border px-4 py-2 text-right">GST %</th>
            <th className="border px-4 py-2 text-right">GST Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenseSplits.map((split, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{split.costCentreName}</td>
              <td className="border px-4 py-2">{split.costHeaderName}</td>
              <td className="border px-4 py-2 text-right">
                {convertMoney(split.totalAmmountNogst || 0)}
              </td>
              <td className="border px-4 py-2 text-right">
                {convertMoney(split.amountApproved || 0)}
              </td>
              <td className="border px-4 py-2 text-right">
                {convertMoney(split.advanceConsumed || 0)}
              </td>
              <td className="border px-4 py-2 text-right">
                {split.gstPercentage || 0}%
              </td>
              <td className="border px-4 py-2 text-right">
                {convertMoney(Number(split.gstAmount || 0))}
              </td>
            </tr>
          ))}
          {/* Totals Row */}
          <tr className="font-semibold bg-gray-100">
            <td className="border px-4 py-2" colSpan={2}>
              Total
            </td>
            <td className="border px-4 py-2 text-right">
              {convertMoney(totalAmountToPay)}
            </td>
            <td className="border px-4 py-2 text-right">
              {convertMoney(totalApproved)}
            </td>
            <td className="border px-4 py-2 text-right">
              {convertMoney(totalAdvanceConsumed)}
            </td>
            <td className="border px-4 py-2 text-right"></td>
            <td className="border px-4 py-2 text-right">
              {convertMoney(Number(totalGSTAmountBySplits))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Professional Expense Calculation Summary */}
      <div className="mt-6 border rounded-xl p-6 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
          Payable Amount Summary
        </h3>

        <div className="space-y-3 text-sm">
          {/* Row */}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Total Amount (Excluding GST)</span>
            <span className="font-medium">{convertMoney(totalApproved)}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Total Advance Consumed</span>
            <span className="font-medium text-red-600">
              - {convertMoney(totalAdvanceConsumed)}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">
              Total GST Amount
              {/* <span className="text-xs text-gray-400">
                ({gstPercentage || 0}%)
              </span> */}
            </span>
            <span className="font-medium text-green-600">
              + {convertMoney(Number(totalGSTAmountBySplits))}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">TDS Amount</span>
            <span className="font-medium text-red-600">
              - {convertMoney(tds)}
            </span>
          </div>
        </div>

        {/* Final Amount */}
        <div className="mt-1 pt-2 flex justify-between items-center">
          <span className="text-base font-semibold">Amount Payable</span>
          <span className="text-xl font-bold text-blue-600">
            {convertMoney(amountPayable)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseSplitTable;
