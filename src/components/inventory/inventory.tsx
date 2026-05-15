import { useState, useMemo, useEffect} from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';
import type { JSX } from 'react/jsx-runtime';
import {
  useMutationFn,
  useQueriesFn,
  useQueriesFnWithId,
} from '@/utils/common/queryUtils';
import { CustomTable } from '@/components/table/customTable';
import { CustomForm } from '@/components/form/customForm';
import { formatDate } from '@/utils/common/DateUtil';
import Loader from '@/utils/common/components/loader';
import {
  InventoryQuery,
  InventoryServices,
} from '@/integrations/Services/inventoryServices';
import {
  ProductQuery,
  ProductServices,
} from '@/integrations/Services/productService';
import {
  VendorServices,
} from '@/integrations/Services/vendorServices';
// import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';
import type { InventorytDTO, InventoryUpdateDTO } from '@/models/inventoryDTO';
import { DropdownSelect } from '@/utils/common/components/dropDown';
import { dropDownApiQueries, DropDownServices } from '@/integrations/Services/dropDown_services';

interface InventoryProps extends BaseProps {}

export default function InventoryPage(props: InventoryProps): JSX.Element {
  interface vendorDropdownType {
    vendorId: number;
    vendorName: string;
  }
  interface warehouseDropdownType {
    warehouseId: number;
    warehouseName: string;
  }
  interface productDropdownType {
    productId: number;
    productName: string;
  }
   const defaultValues = {
    productId: undefined,
    warehouseId: undefined,
    vendorId: undefined,
    productName: undefined,
    warehouseName: undefined,
    vendorName: undefined,
    quantityAvailable: 0,
    lastCountedAt: '',
    quantityReserved: 0,
  };
   const { hasCreateAccess, hasUpdateAccess, session } = props;
  const [formFields, setFormFields] = useState<any>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [selectedVendorId, setSelectedVendorId] = useState<
    number | undefined
  >();
  const [vendorsDropdown, setVendorsDropdown] = useState<
    Array<vendorDropdownType>
  >([]);
  const [warehouseDropdown, setWarehouseDropdown] = useState<
    Array<warehouseDropdownType>
  >([]);
    const [productsDropdown, setProductsDropdown] = useState<
    Array<productDropdownType>
  >([]);
  const [warehouseToolbarDropdown, setWarehouseToolbarDropdown] = useState<
    Array<warehouseDropdownType>
  >([]);
  const [selectedWarehouseIdToolbar, setSelectedWarehouseIdToolbar] = useState<
    number | undefined
  >();

  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const headCells: Array<HeadCell> = [
    {
      id: 'vendorName',
      label: 'Vendor',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: vendorsDropdown.map((vendor) => vendor.vendorName),
    },
    {
      id: 'productName',
      label: 'Product',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'quantityAvailable',
      label: 'Quantity Available',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'lastCountedAt',
      label: 'Last Counted At',
      defaultView: true,
      view: true,
      filterable: false,
      filterType: 'date',
    },
    {
      id: 'quantityReserved',
      label: 'Quantity Reserved',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
     {
      id: 'createdBy',
      label: 'Created By',
      defaultView: true,
      view: false,
      filterable: true,
    },
     {
      id: 'lastUpdatedBy',
      label: 'Last Updated By',
      defaultView: true,
      view: false,
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

 


 

  const transformedWarehouses = useMemo(() => {
    return warehouseToolbarDropdown.map((warehouse) => ({
      label: warehouse.warehouseName,
      value: String(warehouse.warehouseId),
    }));
  }, [warehouseToolbarDropdown]);



  const { isLoading, isError } = useQueriesFn([
      {
      queryKey: dropDownApiQueries.GET_VENDOR_DROPDOWN + 'INVENTORY',
      api: DropDownServices.FetchVendorDropdown,
      setState: [setVendorsDropdown],
    },
    {
      queryKey: dropDownApiQueries.GET_WAREHOUSE_DROPDOWN + 'INVENTORY',
      api: DropDownServices.FetchWarehouseDropdown,
      setState: [setWarehouseDropdown, setWarehouseToolbarDropdown],
    },
  ]);

useQueriesFnWithId([
  {
    queryKey: ProductQuery.GET_PRODUCT_DROPDOWN_BY_VENDOR_ID + 'INVENTORY', 
    api: ProductServices.FetchProductDropdownByVendorId,
    setState: setProductsDropdown, // This is for the form's product dropdown
    id: selectedVendorId,
  },
  {
    queryKey: InventoryQuery.GET_LIST_BY_WAREHOUSE_ID + 'INVENTORY', // Index 3 (for table data)
    api: InventoryServices.FetchInventoriesByWarehouseId,
    setState: setTableValue,
    id: selectedWarehouseIdToolbar,
  },
]);

// Extract specific loading states from toolbarResponses for clarity
// Corrected indices based on the getByIdQueries array
// const isLoadingWarehouseFormDropdown = toolbarResponses[0]?.isLoading ?? true; // Query at index 0
// const isLoadingWarehouseToolbarDropdown = toolbarResponses[1]?.isLoading ?? true; // Query at index 1
// const isLoadingProductFormDropdown = toolbarResponses[2]?.isLoading ?? true; // Query at index 2
// const isLoadingFilteredInventory = toolbarResponses[3]?.isLoading ?? true; // Query at index 3

  // Effect to set the first warehouse as default in the toolbar when vendor is selected
  useEffect(() => {
    if (!isLoading) { 
      if (warehouseToolbarDropdown.length > 0) {
        setSelectedWarehouseIdToolbar(Number(warehouseToolbarDropdown[0].warehouseId));
      } else {
        setSelectedWarehouseIdToolbar(undefined); // Explicitly set to undefined if no warehouses
      }
    }
  }, [warehouseToolbarDropdown]);

  const putMutation = useMutationFn(
    InventoryServices.UpdateInventoryById,
    InventoryQuery.GET_LIST_BY_WAREHOUSE_ID,
  );
  const postMutation = useMutationFn(
    InventoryServices.AddNewInventory,
    InventoryQuery.GET_LIST_BY_WAREHOUSE_ID,
  );

  function onSubmit(data: InventorytDTO): void {
    const selectedWarehouse = warehouseDropdown.find(
      (w) => w.warehouseName === data.warehouseName,
    );
    const selectedProduct = productsDropdown.find(
      (p) => p.productName === data.productName,
    );
    const payload: InventorytDTO = {
      ...data,
      warehouseId: selectedWarehouse?.warehouseId || 0,
      productId: selectedProduct?.productId || 0,
      vendorId: selectedVendorId || 0,
      quantityAvailable: Number(data.quantityAvailable),
      quantityReserved: Number(data.quantityReserved),
      lastCountedAt: formatDate(
        data.lastCountedAt || new Date().toISOString(),
        'yyyy-mm-dd',
      ),
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: 1,
    };
    console.log('Data before validation:', payload);

    postMutation.mutate(
      { inventory: payload },
      {
        onSuccess: () => {
          toast.success('Inventory added successfully!');
          setIsOpen(false);
          setFormFields(defaultValues); // Reset form fields
          setSelectedWarehouseIdToolbar(selectedWarehouse?.warehouseId);
        },
        onError: (error: any) => {
          setIsOpen(false);
          toast.error(`Failed to add Inventory: ${error.message || error}`);
          setFormFields(defaultValues);
        },
      },
    );
  }

  function onUpdate(data: InventoryUpdateDTO): void {
    const selectedWarehouse = warehouseDropdown.find(
      (w) => w.warehouseName === data.warehouseName,
    );
    const selectedProduct = productsDropdown.find(
      (p) => p.productName === data.productName,
    );

    const payload: InventoryUpdateDTO = {
      ...data,
      warehouseId: Number(selectedWarehouse?.warehouseId) || 0,
      productId: Number(selectedProduct?.productId)|| 0,
      vendorId: selectedVendorId || 0,
      quantityAvailable: Number(data.quantityAvailable),
      quantityReserved: Number(data.quantityReserved),
      lastCountedAt: formatDate(
        data.lastCountedAt || new Date().toISOString(),
        'yyyy-mm-dd',
      ),
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: 1,
    };
    console.log('Data before validation:', payload);
    console.log(data.inventoryId);
    putMutation.mutate(
      { inventoryId: data.inventoryId?.toString() || '', inventory: payload },
      {
        onSuccess: async () => {
          toast.success('Inventory updated successfully!');
          setIsOpen(false);
          setFormFields(defaultValues); // Reset form fields
          setSelectedWarehouseIdToolbar(selectedWarehouse?.warehouseId);
        },
        onError: (error: any) => {
          setIsOpen(false);
          toast.error(`Failed to update Inventory: ${error.message || error}`);
          setFormFields(defaultValues);
        },
      },
    );
  }
  const fields: Array<Field> = [
      {
      name: 'warehouseName',
      label: 'Warehouse Name',
      type: 'select',
      placeholder: 'Select a warehouse',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'vendorName',
      label: 'Vendor Name',
      type: 'select',
      placeholder: 'Select a Vendor',
      onChange: (_name: string, value: any, form: any) => {
        const selectedVendor = vendorsDropdown.find(
          (v) => v.vendorName === value,
        );
        setSelectedVendorId(selectedVendor?.vendorId);
        form.setFieldValue('productName', '');
      },
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'productName',
      label: 'Product Name',
      type: 'select',
      placeholder: !selectedVendorId
        ? 'Please select vendor first'
        : productsDropdown.length === 0
          ? 'No products available'
          : 'Select a product',
      disabled: !selectedVendorId,
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'quantityAvailable',
      label: 'Quantity',
      type: 'number',
      placeholder: 'Quantity',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'lastCountedAt',
      label: 'Last Counted At',
      type: 'date',
      placeholder: 'Last Counted At (e.g., 2025-06-30T06:29:20.721Z)',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'quantityReserved',
      label: 'Quantity Reserved',
      type: 'number',
      placeholder: 'Quantity Reserved',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
  const options = {
    vendorName: vendorsDropdown.map((vendor) => vendor.vendorName),
    warehouseName: warehouseDropdown.map(
      (warehouse) => warehouse.warehouseName,
    ),
    productName: productsDropdown.map((product) => product.productName),
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


  const handleOpen = async () => {
    if (vendorsDropdown.length === 0) {
      await VendorServices.FetchAllVendorsDropdown().then(setVendorsDropdown);
    }
    setFormFields(defaultValues);
    setEdit(false);
    setIsOpen(true);
  };
  const handleClose = () => {
    setSelectedVendorId(undefined);
    setIsOpen(false);
    setEdit(false);
    setFormFields(defaultValues);
  };

  async function handleOptionClick(option: string, row: any) {
    if (option === 'Delete') {
      setFormFields(row);
    } else if (option === 'Edit') {
      if (vendorsDropdown.length === 0) {
        await VendorServices.FetchAllVendorsDropdown().then(setVendorsDropdown);
      }
      console.log(row, "edit row");
      setSelectedVendorId(row.vendorId);
      setFormFields(row);
      setEdit(true);
      setIsOpen(true);
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

// Corrected allQueriesLoaded logic
const allQueriesLoaded =
  !isLoading 
  // && // Initial vendor dropdown fetch (from useQueriesFn)
  // vendorsToolbarDropdown.length > 0 && // Vendors data is populated
  // selectedVendorIdToolbar !== undefined && // Default vendor is set
  // !isLoadingWarehouseToolbarDropdown && // Toolbar warehouse dropdown fetch is complete (from useQueriesFnWithId, index 1)
  // (warehouseToolbarDropdown.length === 0 || selectedWarehouseIdToolbar !== undefined) && // Default toolbar warehouse is set OR no warehouses
  // !isLoadingFilteredInventory; // Table inventory fetch is complete (from useQueriesFnWithId, index 3)

console.log({
  isLoading,
  // isLoadingWarehouseToolbarDropdown, // Corrected variable name
  // isLoadingFilteredInventory, // Corrected variable name
  selectedWarehouseIdToolbar,
  warehouseToolbarDropdown
});

  return (
    <div className="m-2.5">
      {!allQueriesLoaded ? (
        <Loader />
      ) : isError ? (
        toast.error('Failed to load inventories!')
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="Inventory"
          functions={allFunctions}
          access={{
            hasCreateAccess: true,
            hasUpdateAccess: true,
          }}
          hide={{
            add: hasCreateAccess,
            filter: false,
            hidden: false,
            download: false,
          }}
          customToolbarItems={{
            position: 'before',
            element: (
              <>
                <DropdownSelect
                  value={selectedWarehouseIdToolbar?.toString() ?? undefined}
                  onChange={(val) => {
                    setSelectedWarehouseIdToolbar(val ? Number(val) : undefined);
                    // setSelectedSiteIdToolbar(undefined);
                  }}
                  options={transformedWarehouses}
                  placeholder="Select Warehouse"
                  isLoading={isLoading}
                />
              </>
            )
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
              label={edit ? 'Update Inventory Details' : 'Create New Inventory'}
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
        description={`Are you sure you want to delete Product ${formFields.productName}?`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        cancelButtonColor="gray"
      /> */}
    </div>
  );
}