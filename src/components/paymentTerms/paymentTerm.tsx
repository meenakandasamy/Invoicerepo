import { useState } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import type { Field } from '@/types/form';
import type { JSX } from 'react/jsx-runtime';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type {
  PaymentTermsDTO,
  PaymentTermsUpdateDTO,
} from '@/models/paymentTermDTO';
import { CustomTable } from '@/components/table/customTable';
import { CustomForm } from '@/components/form/customForm';
import {
  PaymentTermQuery,
  PaymentTermServices,
} from '@/integrations/Services/paymentTermServices';
import Loader from '@/utils/common/components/loader';
import { useMutationFn, useQueryFn } from '@/utils/common/queryUtils';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';
import { validatePaymentTerms } from '@/utils/paymentTermsValidations';

interface PaymentTermProps extends BaseProps {}
export default function PaymentTermsPage(props: PaymentTermProps): JSX.Element {
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const [edit, setEdit] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const { hasCreateAccess, hasUpdateAccess, session } = props;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal
  const [ptToDeleteId, setPtToDeleteId] = useState<string | null>(null);

  const {
    FetchAllPaymentTerms,
    AddNewPaymentTerm,
    UpdatePaymentTermById,
    DeletePaymentTermById,
  } = PaymentTermServices;

  const defaultValues = {
    paymentTermsName: '',
    noOfInstallments: 1, // Default to 1 installment
    description: '',
    // payment1Percentage: 0,
    // net1Days: 0,
    // payment2Percentage: 0,
    // net2Days: 0,
    // payment3Percentage: 0,
    // net3Days: 0,
    // payment4Percentage: 0,
    // net4Days: 0,
    // payment5Percentage: 0,
    // net5Days: 0,
    // payment6Percentage: 0,
    // net6Days: 0,
    status: 1,
  };

  const [formFields, setFormFields] = useState<any>(defaultValues);

  // Table variables
  const headCells: Array<HeadCell> = [
    {
      id: 'paymentTermsName',
      label: 'Payment Terms',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'noOfInstallments',
      label: 'No. of Installments',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [1, 2, 3, 4, 5, 6],
    },
    {
      id: 'description',
      label: 'Description',
      defaultView: false,
      view: false,
      filterable: true,
    },
    {
      id: 'payment1Percentage',
      filterable: false,
      label: 'Payment 1 %',
      defaultView: true,
      view: true,
    },
    {
      id: 'net1Days',
      label: 'Net1 (days)',
      defaultView: true,
      view: true,
      filterable: false,
    },
    {
      id: 'payment2Percentage',
      label: 'Payment 2 %',
      defaultView: true,
      filterable: false,
      view: true,
    },
    {
      id: 'net2Days',
      label: 'Net2 (days)',
      defaultView: true,
      filterable: false,
      view: true,
    },
    {
      id: 'payment3Percentage',
      filterable: false,
      label: 'Payment 3 %',
      defaultView: true,
      view: true,
    },
    {
      id: 'net3Days',
      label: 'Net3 (days)',
      defaultView: true,
      view: true,
      filterable: false,
    },
    {
      id: 'payment4Percentage',
      filterable: false,
      label: 'Payment 4 %',
      defaultView: false,
      view: false,
    },
    {
      id: 'net4Days',
      label: 'Net4 (days)',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'payment5Percentage',
      label: 'Payment 5 %',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'net5Days',
      label: 'Net5 (days)',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'payment6Percentage',
      label: 'Payment 6 %',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'net6Days',
      label: 'Net6 (days)',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
      filterable: false,
    },
  ];

  // Fetch all payment terms for the table
  const { isLoading, isError } = useQueryFn({
    queryKey: PaymentTermQuery.GET_ALL_PAYMENT_TERMS,
    api: FetchAllPaymentTerms,
    setState: setTableValue,
  });

  // Mutations for CRUD operations
  const putMutation = useMutationFn(
    UpdatePaymentTermById,
    PaymentTermQuery.GET_ALL_PAYMENT_TERMS,
  );
  const postMutation = useMutationFn(
    AddNewPaymentTerm,
    PaymentTermQuery.GET_ALL_PAYMENT_TERMS,
  );
  const deleteMutation = useMutationFn(
    DeletePaymentTermById,
    PaymentTermQuery.GET_ALL_PAYMENT_TERMS,
  );

  function onSubmit(data: PaymentTermsDTO): void {
    data.noOfInstallments = Number(data.noOfInstallments);
    const { isValid, errors, cleanedData } = validatePaymentTerms({
      ...data,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
    });

    if (!isValid) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    postMutation.mutate(
      { paymentTerms: cleanedData },
      {
        onSuccess: () => {
          toast.success('Payment Term added successfully!');
          setIsOpen(false);
          setFormFields(defaultValues);
        },
        onError: (error) => {
          toast.error(`Failed to add payment term: ${error.message}`);
        },
      },
    );
  }

  // Handle form submission for updating existing payment terms
  function onUpdate(data: PaymentTermsUpdateDTO): void {
    data.noOfInstallments = Number(data.noOfInstallments);
    const { isValid, errors, cleanedData } = validatePaymentTerms({
      ...data,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
    });

    if (!isValid) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    putMutation.mutate(
      {
        paymentTermsId: data.paymentTermsId?.toString() || '',
        paymentTerms: cleanedData,
      },
      {
        onSuccess: () => {
          toast.success('Payment Terms updated successfully!');
          setIsOpen(false);
          setEdit(false);
          setFormFields(defaultValues);
        },
        onError: (error) => {
          toast.error(`Failed to update payment terms: ${error.message}`);
        },
      },
    );
  }

  // Define ALL possible form fields initially
  const allPossibleFields: Array<Field> = [
    {
      name: 'paymentTermsName',
      label: 'Payment Terms Name',
      type: 'text',
      placeholder: 'Payment Terms Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'noOfInstallments',
      label: 'No. of Installments',
      type: 'select',
      placeholder: 'Select Installments',
      onChange: (name: string, value: any) => {
        setFormFields((prev: typeof defaultValues) => ({
          ...prev,
          [name]: value,
        }));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Description',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    // Include all 6 sets of payment fields
    ...Array.from({ length: 6 }, (_, i) => [
      {
        name: `payment${i + 1}Percentage`,
        label: `Payment ${i + 1} %`,
        type: 'number',
        placeholder: `Payment ${i + 1} %`,
        required: true,
        styles: {
          wrapper: 'flex flex-col gap-1',
          label: 'text-sm font-medium text-gray-500',
          input:
            'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
        },
      },
      {
        name: `net${i + 1}Days`,
        label: `Net${i + 1} (days)`,
        type: 'number',
        placeholder: `Net${i + 1} (days)`,
        required: true,
        styles: {
          wrapper: 'flex flex-col gap-1',
          label: 'text-sm font-medium text-gray-500',
          input:
            'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
        },
      },
    ]).flat(),
  ];

  // Dynamically filter fields based on currentNoOfInstallments
  const fields = allPossibleFields.filter((fieldItem) => {
    const isDynamicInstallmentField =
      fieldItem.name.startsWith('payment') || fieldItem.name.startsWith('net');
    const installmentNumber = isDynamicInstallmentField
      ? parseInt(fieldItem.name.match(/\d+/)?.[0] || '0', 10)
      : 0;

    // Check visibility based on the currentNoOfInstallments state
    return (
      !isDynamicInstallmentField ||
      installmentNumber <= formFields.noOfInstallments
    );
  });

  // Options for the 'noOfInstallments' select dropdown
  const options = {
    noOfInstallments: Array.from({ length: 6 }, (_, i) => `${i + 1}`),
  };

   const formStyles = {
  pageName: 'Vendor',
  label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
  container:
    'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
  form:
    'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
  submitButton:
    'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
  cancelButton:
    'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
};

  const handleOpen = () => {
    setFormFields(defaultValues); // Reset form fields for new entry
    setEdit(false); // Ensure it's in add mode
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    setEdit(false); // Ensure edit mode is off when closing
    setFormFields(defaultValues);
    setPtToDeleteId(null);
    setShowDeleteConfirm(false);
  };

  // Function to handle confirmation of delete
  const handleConfirmDelete = () => {
    if (ptToDeleteId) {
      deleteMutation.mutate(
        { paymentTermsId: ptToDeleteId },
        {
          onSuccess: () => toast.success('Payment Terms deleted successfully!'),
          onError: (error: any) =>
            toast.error(
              `Failed to delete payment terms: ${error.message || error}`,
            ),
          onSettled: () => {
            setShowDeleteConfirm(false); // Close confirmation modal
          },
        },
      );
    }
  };
  // Handle table row option clicks (Delete/Edit)
  function handleOptionClick(option: string, row: Row) {
    if (option === 'Delete') {
      setPtToDeleteId(row.paymentTermsId);
      setFormFields(row);
      setShowDeleteConfirm(true);
    } else if (option === 'Edit') {
      setFormFields(row); // Set form fields with row data
      setIsOpen(true);
      setEdit(true);
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

  return (
    <div className="m-2.5">
      {isLoading ? (
        <Loader />
      ) : isError ? (
        toast.error('Failed to load payment terms!')
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="Payment Terms"
          functions={allFunctions}
          access={{
            hasCreateAccess: hasCreateAccess,
            hasUpdateAccess: hasUpdateAccess,
          }}
          hide={{
            add: !hasCreateAccess,
            filter: false,
            hidden: false,
            download: false,
          }}
        />
      )}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <CustomForm
              initialValues={formFields}
              submitFunction={(data) =>
                edit ? onUpdate(data) : onSubmit(data)
              }
              onClose={handleClose}
              fields={fields}
              options={options}
              styles={formStyles}
              label={
                edit
                  ? 'Update Payment Terms Details'
                  : 'Create New Payment Terms'
              }
              buttonLabel={edit ? 'Update' : 'Submit'}
            />
          </Modal>
        </div>
      )}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete Payment Term: ${formFields.paymentTermsName}?`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
}
