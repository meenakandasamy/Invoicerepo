import { useState } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import type { HeadCell, Row } from '@/types/table';
import type { WarehouseDTO, WarehouseUpdateDTO } from '@/models/warehouseDTO';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';
import type { JSX } from 'react/jsx-runtime';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import { CustomTable } from '@/components/table/customTable';
import { CustomForm } from '@/components/form/customForm';
import Loader from '@/utils/common/components/loader';
import {
WarehouseQuery,
WarehouseServices,
} from '@/integrations/Services/warehouseService';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';

interface WarehouseProps extends BaseProps {}
export default function WarehousePage(props: WarehouseProps): JSX.Element {
  const headCells: Array<HeadCell> = [
    {
      id: 'warehouseName',
      label: 'Warehouse',
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
      id: 'location',
      label: 'Location',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'capacity',
      label: 'Capacity',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range'
    },
    {
      id: 'warehouseCode',
      label: 'Warehouse Code',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'remarks',
      label: 'Remarks',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
      filterable: false,
    },
  ];

  const defaultValues = {
    warehouseName: '',
    location: '',
    capacity: '',
    warehouseCode: '',
    remarks: '',
    status: 1,
  };

  const { hasCreateAccess, hasUpdateAccess, session } = props;
  const [formFields, setFormFields] = useState<any>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [warehouseToDeleteId, setWarehouseToDeleteId] = useState<string | null>(
    null,
  );

  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const { isLoading, isError } = useQueriesFn([
    {
      queryKey: WarehouseQuery.GET_ALL_WAREHOUSES,
      api: WarehouseServices.FetchAllWarehouses,
      setState: setTableValue,
    },
  ]);

  const putMutation = useMutationFn(
    WarehouseServices.UpdateWarehouseById,
    WarehouseQuery.GET_ALL_WAREHOUSES,
  );
  const postMutation = useMutationFn(
    WarehouseServices.AddNewWarehouse,
    WarehouseQuery.GET_ALL_WAREHOUSES,
  );
   const deleteMutation = useMutationFn(
      WarehouseServices.DeleteWarehouseById,
      WarehouseQuery.GET_ALL_WAREHOUSES,
    );

  async function onSubmit(data: WarehouseDTO): Promise<void> {
       const payload: WarehouseDTO = {
      ...data,
      capacity: Number(data.capacity),
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: 1,
    };
  
        console.log("payload:",payload);
  
        postMutation.mutate(
          { warehouse: payload },
          {
            onSuccess: () => {
              toast.success('Warehouse added successfully!');
              setIsOpen(false);
              setFormFields(defaultValues);
            },
            onError: (error: any) => {
              toast.error(`Failed to add Warehouse: ${error.message || error}`);
              setFormFields(defaultValues);
            },
          },
        );
      }

  async function onUpdate(data: WarehouseUpdateDTO): Promise<void> {
       const payload: WarehouseUpdateDTO = {
      ...data,
      capacity: Number(data.capacity),
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: 1,
    };
  
        console.log("payload:",payload);
  
        putMutation.mutate(
          {warehouseId: data.warehouseId?.toString()||'', warehouse: payload },
          {
            onSuccess: () => {
              toast.success('Warehouse updated successfully!');
              setIsOpen(false);
              setFormFields(defaultValues);
            },
            onError: (error: any) => {
              toast.error(`Failed to update Warehouse: ${error.message || error}`);
              setFormFields(defaultValues);
            },
          },
        );
      } 
  const handleConfirmDelete = () => {
    if (warehouseToDeleteId) {
      deleteMutation.mutate(
        { productId: warehouseToDeleteId },
        {
          onSuccess: () => toast.success('Warehouse deleted successfully!'),
          onError: (error: any) =>
            toast.error(`Failed to delete warehouse: ${error.message || error}`),
          onSettled: () => {
            setWarehouseToDeleteId(null);
            setShowDeleteConfirm(false);
          },
        },
      );
    }
  };
  const fields: Array<Field> = [
    {
      name: 'warehouseName',
      label: 'Warehouse Name',
      type: 'text',
      placeholder: 'Warehouse Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
     
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Location',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'capacity',
      label: 'Capacity',
      type: 'number',
      placeholder: 'Capacity',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'warehouseCode',
      label: 'Warehouse Code',
      type: 'text',
      placeholder: 'Warehouse Code',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'remarks',
      label: 'Remarks',
      type: 'text',
      placeholder: 'Remarks',
      required: true,
     styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
  
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
    setFormFields(defaultValues);
    setEdit(false);
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    setEdit(false); // Ensure edit mode is off when closing
    setFormFields(defaultValues); // Reset form fields to default
  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Delete') {
      setFormFields(row);
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
    <div className="m-2.5">
      {isLoading ? (
        <Loader />
      ) : isError ? (
        toast.error('Failed to load warehouses!')
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="Warehouse"
          functions={allFunctions}
          access={{
            hasCreateAccess: true,
            hasUpdateAccess:true,
          }}
          hide={{
            add: hasCreateAccess,
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
              styles={formStyles}
              label={edit ? 'Update warehouse' : 'Create New warehouse'}
              buttonLabel={edit ? 'Update' : 'Submit'}
            />
          </Modal>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete warehouse${formFields.warehouseName}?`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        cancelButtonColor="gray"
      />
    </div>
  );
}
