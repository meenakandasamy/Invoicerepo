import Modal from '@mui/material/Modal';
import type { HeadCell } from '@/types/table';
import { formatDate } from '@/utils/common/DateUtil';
import { X } from 'lucide-react';

const headCells: Array<HeadCell> = [
  { id: 'poNumber', label: 'PO Number', view: true, defaultView: false },
  { id: 'vendorCode', label: 'Vendor Code', view: true, defaultView: false },
  { id: 'vendorName', label: 'Vendor Name', view: true, defaultView: true },
  {
    id: 'paymentTermsName',
    label: 'Payment Terms',
    view: true,
    defaultView: false,
  },
  {
    id: 'totalInvoiceValue',
    label: 'Total Invoice Value',
    view: true,
    defaultView: true,
  },
  { id: 'amountPaid', label: 'Amount Paid', view: true, defaultView: true },
  {
    id: 'balancePayable',
    label: 'Balance Payable',
    view: true,
    defaultView: true,
  },
];

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'text-green-600';
    case 'overdue':
      return 'text-red-600';
    case 'pending':
    default:
      return 'text-yellow-600';
  }
};

const DetailItem = ({
  label,
  value,
  className = '',
}: {
  label: string;
  value: any;
  className?: string;
}) => (
  <div className={className}>
    <p className="text-sm text-gray-600 dark:text-gray-500  font-medium">
      {label}:
    </p>
    <p className="text-base text-gray-900 dark:text-gray-300 font-semibold">
      {value || '-'}
    </p>
  </div>
);

const InstallmentsDetailsModal = ({
  po,
  onClose,
}: {
  po: any;
  onClose: () => void;
}) => {
  const installments = Array.from({ length: 6 }, (_, i) => {
    const amount = po[`installment${i + 1}`];
    const payRef = po[`payReference${i + 1}`];
    const dueDate = po[`dueDate${i + 1}`];
    const paymentDate = po[`paymentDate${i + 1}`];
    const status = po[`status${i + 1}Raw`];
    const overdueDays = po[`overdueDays${i + 1}`];

    return {
      id: i + 1,
      amount,
      payRef,
      dueDate,
      paymentDate,
      status,
      overdueDays,
    };
  });

  const validInstallments = [];
  for (const inst of installments) {
    if (inst.amount == null || inst.amount === '-') break;
    validInstallments.push(inst);
  }

  const statusCounts = validInstallments.reduce(
    (acc, inst) => {
      const status = inst.status;
      if (status === 'Paid') acc.paid++;
      else if (status === 'Overdue') acc.overdue++;
      else if (status === 'Pending') acc.pending++;
      return acc;
    },
    { paid: 0, pending: 0, overdue: 0 },
  );

  return (
    <Modal open={true} onClose={onClose}>
      <div className="relative bg-[var(--muted)] dark:bg-[var(--background)] rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl max-w-4xl w-full mx-auto my-8 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-card dark:bg-black px-6 py-4 border-b border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            PO: {po.poNumber}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-muted-foreground hover:text-destructive transition duration-150 ease-in-out"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-auto p-6 flex-1">
          {/* PO Overview */}
          <div className="mb-6 bg-card dark:bg-black shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Purchase Order Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {headCells.map((cell) => (
                <DetailItem
                  key={cell.id}
                  label={cell.label}
                  value={
                    ['poDate', 'lastPaymentDate'].includes(cell.id)
                      ? formatDate(po[cell.id], 'yyyy-mm-dd')
                      : typeof po[cell.id] === 'number'
                        ? po[cell.id].toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                          })
                        : po[cell.id]
                  }
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* Installments */}
          <div className="mb-6 bg-white dark:bg-black shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                Installments Overview ({statusCounts.paid} of{' '}
                {validInstallments.length} Paid)
              </h3>
              <div className="flex gap-3 text-sm">
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400 font-semibold">
                  Paid: {statusCounts.paid}
                </span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-400 font-semibold">
                  Pending: {statusCounts.pending}
                </span>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 font-semibold">
                  Overdue: {statusCounts.overdue}
                </span>
              </div>
            </div>
            <div className="overflow-auto max-h-60 border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner">
              <table className="min-w-full border-collapse bg-white dark:bg-gray-900">
                <thead>
                  <tr className="bg-blue-50 dark:bg-[var(--background)] text-blue-800 dark:text-blue-100 text-left sticky top-0 shadow-sm">
                    <th className="p-3 border-b border-gray-300 dark:border-gray-600">
                      Installment
                    </th>
                    <th className="p-3 border-b border-gray-300 dark:border-gray-600">
                      Due Date
                    </th>
                    <th className="p-3 border-b border-gray-300 dark:border-gray-600">
                      Pay Reference
                    </th>
                    <th className="p-3 border-b border-gray-300 dark:border-gray-600">
                      Payment Date
                    </th>
                    <th className="p-3 border-b border-gray-300 dark:border-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validInstallments
                    .filter((inst) => inst.amount > 0) // Filter installments with amount > 0
                    .map((inst, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                      >
                        <td className="p-3 text-gray-700 dark:text-gray-300 font-semibold">
                          {inst.amount > 0
                            ? inst.amount.toLocaleString('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                              })
                            : 'N/A'}
                        </td>

                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {inst.dueDate
                            ? formatDate(inst.dueDate, 'yyyy-mm-dd')
                            : '-'}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {inst.payRef || '-'}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {inst.paymentDate
                            ? formatDate(inst.paymentDate, 'yyyy-mm-dd')
                            : '-'}
                        </td>
                        <td
                          className={`p-3 font-bold ${getStatusClass(inst.status)}`}
                        >
                          {inst.status.toLowerCase() === 'overdue' ? (
                            <span>
                              <span className="uppercase">OVERDUE</span>{' '}
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                ({inst.overdueDays} days)
                              </span>
                            </span>
                          ) : (
                            inst.status.toUpperCase()
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InstallmentsDetailsModal;
