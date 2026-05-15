import { useState } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';
import type { JSX } from 'react/jsx-runtime';
import type {
  CostHeaderDTO,
  CostHeaderUpdateDTO,
} from '@/models/costHeaderDTO';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import { CustomTable } from '@/components/table/customTable';
import { CustomForm } from '@/components/form/customForm';
import Loader from '@/utils/common/components/loader';
import {
  CostHeaderQueries,
  CostHeaderServices,
} from '@/integrations/Services/costHeaderServices';
// import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';

interface CostHeaderProps extends BaseProps {}
export const CostHeaderPage = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: CostHeaderProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [CostHeaderToDeleteId, setCostHeaderToDeleteId] = useState<
    string | null
  >(null);
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const defaultValues = {
    CostHeaderName: '',
  };
  const [formFields, setFormFields] = useState<any>(defaultValues);
  const headCells: Array<HeadCell> = [
    {
      id: 'costHeaderName',
      label: 'Cost Header',
      defaultView: true,
      view: true,
    },
    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
    },
  ];

  const { isLoading, isError } = useQueriesFn([
    {
      queryKey: CostHeaderQueries.GET_ALL_COST_HEADERS + 'CH',
      api: CostHeaderServices.fetchAllCostHeaders,
      setState: setTableValue,
    },
  ]);

  const putMutation = useMutationFn(
    CostHeaderServices.putCostHeader,
    CostHeaderQueries.GET_ALL_COST_HEADERS + 'CH',
  );
  const postMutation = useMutationFn(
    CostHeaderServices.postCostHeader,
    CostHeaderQueries.GET_ALL_COST_HEADERS + 'CH',
  );

  function onSubmit(data: CostHeaderDTO): void {
    console.log('Original form data:', data);

    const payload: CostHeaderDTO = {
      ...data,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
    };

    console.log('Final payload sent to API:', payload);

    postMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Cost Header added successfully!');
        setIsOpen(false);
        setFormFields(defaultValues); // clear AFTER success only
      },
      onError: (error: any) => {
        toast.error(`Failed to add Cost Header: ${error?.message || error}`);
      },
    });
  }

  function onUpdate(data: CostHeaderUpdateDTO): void {
    const payload: CostHeaderUpdateDTO = {
      ...data,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
    };
    console.log('Data before validation:', payload);
    console.log(data.costHeaderId);
    putMutation.mutate(
      {
        costHeaderId: data.costHeaderId?.toString() || '',
        costHeader: payload,
      },
      {
        onSuccess: () => {
          toast.success('Cost Header updated successfully!');
          setIsOpen(false);
          setFormFields(defaultValues); // Reset form fields
        },
        onError: (error: any) => {
          toast.error(
            `Failed to update Cost Header: ${error.message || error}`,
          );
          setFormFields(defaultValues);
        },
      },
    );
  }
  const fields: Array<Field> = [
    {
      name: 'costHeaderName',
      label: 'Cost Header',
      type: 'text',
      placeholder: 'Cost Header',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
  const options = {};

  const formStyles = {
    pageName: 'Cost Header',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
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
    setFormFields(defaultValues); // Reset form fields to default
    setCostHeaderToDeleteId(null); // Clear vendorToDeleteId
    setShowDeleteConfirm(false); // Hide delete confirm modal
  };

  // Function to handle confirmation of delete
  // const handleConfirmDelete = () => {
  //   if (CostHeaderToDeleteId) {
  //     deleteMutation.mutate(
  //       { CostHeaderId: CostHeaderToDeleteId },
  //       {
  //         onSuccess: () => toast.success('CostHeader deleted successfully!'),
  //         onError: (error: any) =>
  //           toast.error(`Failed to delete CostHeader: ${error.message || error}`),
  //         onSettled: () => {
  //           setCostHeaderToDeleteId(null);
  //           setShowDeleteConfirm(false);
  //         },
  //       },
  //     );
  //   }
  // };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Delete') {
      setCostHeaderToDeleteId(row.CostHeaderId?.toString() || null);
      setFormFields(row);
      setShowDeleteConfirm(true);
    } else if (option === 'Edit') {
      setFormFields(row);
      setIsOpen(true);
      setEdit(true);
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

  return (
    <div className="m-2.5 h-[80%]">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : isError ? (
        toast.error('Failed to load CostHeaders!')
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="Cost Header"
          functions={allFunctions}
          access={{
            hasCreateAccess: hasCreateAccess,
            hasUpdateAccess: hasUpdateAccess,
          }}
          hide={{
            add: !hasCreateAccess,
            filter: true,
            hidden: true,
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
                edit ? 'Update Cost Header Details' : 'Create New Cost Header'
              }
              buttonLabel={edit ? 'Update' : 'Submit'}
            />
          </Modal>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete CostHeader ${formFields.CostHeaderName}?`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        cancelButtonColor="gray"
      /> */}
    </div>
  );
};
