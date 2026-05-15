import Modal from '@mui/material/Modal';
import { X } from 'lucide-react';
import type { HeadCell } from '@/types/table';
import { formatDate } from '@/utils/common/DateUtil';

const headCells: Array<HeadCell> = [
  {
    id: 'poNumber',
    label: 'PO Number',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'category',
    label: 'Category',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'costCentre',
    label: 'Cost Center',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'vendorCode',
    label: 'Vendor Code',
    defaultView: true,
    view: false,
    filterable: true,
  },
  {
    id: 'vendorName',
    label: 'Vendor Name',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'paymentTermsName',
    label: 'Payment Terms',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'povalueExcludeGst',
    label: 'PO Value Ex-GST',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'totalInvoiceValue',
    label: 'Total Invoice',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'balancePayable',
    label: 'Balance Payable',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'amountPaid',
    label: 'Amount Paid',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'poDate',
    label: 'PO Date',
    defaultView: true,
    view: true,
    filterable: true,
  },
  {
    id: 'lastPaymentDate',
    label: 'Last Payment',
    defaultView: true,
    view: true,
    filterable: true,
  },
];

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
    <p className="text-sm  text-gray-600 dark:text-gray-500 font-medium">
      {label}:
    </p>
    <p className="text-base text-gray-900 dark:text-gray-300 font-semibold">
      {value || '-'}
    </p>
  </div>
);

const PODetailsModal = ({
  po,
  installments,
  onClose,
  loadingInstallments = false
}: {
  po: any;
  installments: Array<any>;
  onClose: () => void;
  loadingInstallments?: boolean;
}) => (
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
      <div className="overflow-auto p-6">
        {/* PO Details Section */}
        <div className="mb-6 bg-white dark:bg-black  shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Purchase Order Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {headCells.map((cell) =>
              po[cell.id] !== undefined && po[cell.id] !== null ? (
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
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-900 hover:shadow-sm"
                />
              ) : null,
            )}
          </div>
        </div>

        {/* Installments Section */}
        <div className="mb-6 bg-white dark:bg-black shadow-md rounded-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Installment Overview
          </h3>
          {installments.length > 0 ? (
            <div className="overflow-auto max-h-60 border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner">
              <table className="min-w-full border-collapse bg-white dark:bg-gray-900 ">
                <thead>
                  <tr className="bg-blue-50 dark:bg-[var(--background)] text-blue-800 dark:text-blue-100  text-left sticky top-0 shadow-sm">
                    <th className="p-3 border-b border-gray-300 dark:border-gray-600">
                      Amount
                    </th>
                    <th className="p-3 border-b border-gray-300  dark:border-gray-600">
                      Reference
                    </th>
                    <th className="p-3 border-b border-gray-300  dark:border-gray-600">
                      Due Date
                    </th>
                    <th className="p-3 border-b border-gray-300  dark:border-gray-600">
                      Payment Date
                    </th>
                    <th className="p-3 border-b border-gray-300  dark:border-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {installments.map((inst, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
                    >
                      <td className="p-3 font-semibold text-gray-700 dark:text-gray-300 ">
                        {inst.amount
                          ? inst.amount.toLocaleString('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                          })
                          : '-'}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {inst.payReference || '-'}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {inst.dueDate
                          ? formatDate(inst.dueDate, 'yyyy-mm-dd')
                          : '-'}
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {inst.paymentDate
                          ? formatDate(inst.paymentDate, 'yyyy-mm-dd')
                          : '-'}
                      </td>
                      <td
                        className={`p-3 font-bold ${inst.status === 'OVERDUE'
                            ? 'text-red-600'
                            : inst.status === 'PAID'
                              ? 'text-green-600'
                              : 'text-yellow-600'
                          }`}
                      >
                        {inst.status === 'OVERDUE' ? (
                          <span>
                            <span className="uppercase">OVERDUE</span>{' '}
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              ({inst.overdueDays} days)
                            </span>
                          </span>
                        ) : (
                          inst.status || 'UNKNOWN'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-lg italic p-4">
              No payments done yet.
            </p>
          )}
        </div>
      </div>
    </div>
  </Modal>
);

export default PODetailsModal;
