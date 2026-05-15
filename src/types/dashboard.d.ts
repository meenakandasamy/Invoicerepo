type AllPoSummaryResponse = {
  poId: number;
  zerobalancePayable: number;
  noOfInstallments: number;
};

type BalancePayable = {
  vendorId: number;
  vendorName: string;
  vendorCode: string;
  pendingCount: number;
  totalPayableAmount: number;
  balancePayable: number | null;
};

type AllBalancePayable = Array<BalancePayable>;

type TotalPoValueSummaryItem = {
  totalInvoiceValue: number;
  amountPaid: number;
  balancePayable: number;
  povalueExcludeGst: number;
  gstValue: number;
  tdsValue: number;
  totalPos: number;
};

type TotalPoValueSummary = Array<TotalPoValueSummaryItem>;
