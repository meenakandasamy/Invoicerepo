import { useState } from 'react';
import { toast } from 'sonner';
import type { JSX } from 'react/jsx-runtime';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import { CustomTable } from '@/components/table/customTable';
import Loader from '@/utils/common/components/loader';
import { useQueriesFn } from '@/utils/common/queryUtils';
import {
  POInstallmentQuery,
  poInstallmentServices,
} from '@/integrations/Services/poInstallmentServices';
import { PaymentTermQuery,PaymentTermServices } from '@/integrations/Services/paymentTermServices';
import {
  VendorQuery,
  VendorServices,
} from '@/integrations/Services/vendorServices';
import InstallmentsDetailsModal from './installmentsDetailsModal';

interface installmentProps extends BaseProps {}

export default function InstallmentPage(_props: installmentProps): JSX.Element {
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const [showInstallmentsDetails, setShowInstallmentsDetails] = useState(false);
  const [installmentsDetails, setInstallmentsDetails] = useState<any>(null);
  const [_selectedPO, setSelectedPO] = useState<string>('');
  const [allVendor, setAllVendor] = useState<Array<Vendor>>([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState<Array<payment>>([]);
  const { FetchAllPaymentTerms } = PaymentTermServices;
   interface Vendor {
     vendorId: number;
     vendorName: string;
     vendorCode?: string;
   }
   interface payment {
     paymentTermsId: number;
     paymentTermsName: string;
     noOfInstallments: number;
   }
 
  const headCells: Array<HeadCell> = [
    {
      id: 'poNumber',
      label: 'PO Number',
      view: true,
      defaultView: false,
      filterable: true,
    },
     {
    id: 'installmentStatus',
    label: 'Installment Status',
    filterable: true,
    view: false,
    defaultView: false,
    filterType: 'select',
    filterOptions: ['Paid', 'Pending', 'Overdue'], 
  },
    {
      id: 'vendorCode',
      label: 'Vendor Code',
      defaultView: true,
      view: false,
      filterable: false,
    },
    {
      id: 'vendorName',
      label: 'Vendor Name',
      view: true,
      defaultView: true,
      filterable: true,
      filterType: 'select',
      filterOptions: allVendor.map((vendor) => vendor.vendorName),
    },
    {
      id: 'paymentTermsName',
      label: 'Payment Terms',
      view: true,
      defaultView: false,
      filterable: true,
      filterType: 'select',
      filterOptions: allPaymentTerms.map((paymentTerm) => paymentTerm.paymentTermsName),
    },
     {
      id: 'totalInvoiceValue',
      label: 'Total Invoice',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
     {
      id: 'amountPaid',
      label: 'Amount Paid',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
   {
      id: 'balancePayable',
      label: 'Balance Payable',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
       {
    id: 'dueDate',
    label: 'Due Date',
    filterable: true,
    view: false,
    defaultView: false,
    filterType: 'dateRange',
  },
    ...Array.from({ length: 6 }, (_, i) =>
      [
        {
          id: `installment${i + 1}`,
          label: `Installment ${i + 1}`,
        },
        {
          id: `payReference${i + 1}`,
          label: `Pay Reference ${i + 1}`,
        },
        {
          id: `dueDate${i + 1}`,
          label: `Due Date ${i + 1}`,
        },
        {
          id: `paymentDate${i + 1}`,
          label: `Payment Date ${i + 1}`,
        },
        {
          id: `status${i + 1}`,
          label: `Status ${i + 1}`,
        },
      ].map((item) => ({
        ...item,
        view: i >= 3 ? false : true,
        defaultView: i >= 3 ? false : false,
      })),
    ).flat(),
    {
      id: 'action',
      label: 'Action',
      view: true,
      defaultView: false,
      filterable: false,
    },
  ];

 const { isLoading, isError } = useQueriesFn([
     {
       queryKey: VendorQuery.GET_ALL_VENDOR_DROPDOWN,
       api: VendorServices.FetchAllVendorsDropdown,
       setState: setAllVendor,
     },
     {
       queryKey: PaymentTermQuery.GET_ALL_PAYMENT_TERMS,
       api: FetchAllPaymentTerms,
       setState: setAllPaymentTerms,
     },
       {
      queryKey: POInstallmentQuery.GET_ALL_PO_INSTALLMENTS,
      api: poInstallmentServices.fetchAllPOInstallments,
     setState: (data: Array<any>) => {
  const statusMap: Record<number, { label: string; color: string }> = {
    1: { label: 'Pending', color: 'text-yellow-600' },
    5: { label: 'Paid', color: 'text-green-600' },
    6: { label: 'Overdue', color: 'text-red-600' },
  };

  const transformed = data.map((row) => {
    const updatedRow = { ...row };

    Object.keys(row).forEach((key) => {
      if (key.startsWith('status')) {
        const statusCode = Number(row[key]);
        const status = statusMap[statusCode] ?? {
          label: '-',
          color: 'text-gray-500',
        };

        // store raw string (for modal)
        updatedRow[`${key}Raw`] = status.label;

        // store rendered JSX (for table)
        updatedRow[key] = (
          <span className={`font-medium ${status.color}`}>
            {status.label}
          </span>
        );
      }
    });

    return updatedRow;
  });

  setTableValue(transformed);
}

    },
   ]);

  const handlePoNumberClick = (row: Row) => {
    setSelectedPO(row.poId);
    setInstallmentsDetails(row);
    setShowInstallmentsDetails(true);
  };
  const handleCloseInstallmentModal = () => {
    setSelectedPO('');
    setInstallmentsDetails(false);
    setShowInstallmentsDetails(false);
  };
  return (
    <div className="m-2.5">
      {isLoading ? (
        <Loader />
      ) : isError ? (
        toast.error('Failed to load installments!')
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="Installments"
          access={{
            hasCreateAccess: false,
            hasUpdateAccess: false,
          }}
          onClick={handlePoNumberClick}
          clickableColumn="poNumber"
        />
      )}
      {showInstallmentsDetails && (
        <InstallmentsDetailsModal
          po={installmentsDetails}
          onClose={handleCloseInstallmentModal}
        />
      )}
    </div>
  );
}
