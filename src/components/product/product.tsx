import { useEffect, useMemo, useState } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import type { HeadCell, Row } from '@/types/table';
import type { ProductDTO, ProductUpdateDTO } from '@/models/productDTO';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';
import type { JSX } from 'react/jsx-runtime';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import { CustomTable } from '@/components/table/customTable';
import { CustomForm } from '@/components/form/customForm';
import Loader from '@/utils/common/components/loader';
import {
  ProductQuery,
  ProductServices,
} from '@/integrations/Services/productService';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';
import {
  VendorQuery,
  VendorServices,
} from '@/integrations/Services/vendorServices';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';
import { number } from 'zod';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface ProductProps extends BaseProps {}
export default function ProductPage(props: ProductProps): JSX.Element {
  interface Vendor {
    vendorId: number;
    vendorName: string;
    vendorCode?: string;
  }
  interface Product {
    productTypeId: number;
    productTypeName: string;
  }
  const { hasCreateAccess, hasUpdateAccess, session } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);

  const [allVendor, setAllVendor] = useState<Array<Vendor>>([]);
  const [productType, setProductType] = useState<Array<Product>>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(
    null,
  );
  const CostHeaderQuery = useCostHeaders();
  const costHeaderDropdown: Array<costHeaderDropdownTypes> = useMemo(
    () => CostHeaderQuery.data ?? [],
    [CostHeaderQuery.data],
  );
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const defaultValues = {
    hsnCode: '',
    productTypeName: '',
    vendorName: [],
    description: '',
    vendorId: '',
    productType: '',
    productTypeId: '',
    sacCode: '',
    // productId:0
  };

  const [formFields, setFormFields] = useState<any>(defaultValues);

  const [tabsValue, setTabsValue] = useState<'Goods' | 'Services'>('Goods');

  const headCell: Array<HeadCell> = [
    {
      id: 'productName',
      label: tabsValue === 'Services' ? 'Service Name' : 'Product Name',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: tableValue.map((row: Row) => row.productName),
    },
    {
      id: 'vendorName',
      label: 'Vendor Name',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: allVendor.map((vendor: Vendor) => vendor.vendorName),
    },
    {
      id: 'idealGstPercentage',
      label: 'GST Percentage ',
      filterable: true,
      defaultView: true,
      view: true,

      filterType: 'select',
      filterOptions: ['0', '2.5', '5', '12', '18', '40'],
    },
    {
      id: 'hsnCode',
      label: 'HSN Code',
      filterType: 'text',
      defaultView: tabsValue === 'Services' ? false : true,
      view: tabsValue === 'Services' ? false : true,
      filterable: tabsValue === 'Services' ? false : true,
    },

    {
      id: 'sacCode',
      label: 'SAC Code',

      filterType: 'text',
      defaultView: tabsValue === 'Goods' ? false : true,
      view: tabsValue === 'Goods' ? false : true,
      filterable: tabsValue === 'Goods' ? false : true,
    },

    {
      id: 'costHeader',
      label: 'Cost Header',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'description',
      label: 'Description',
      defaultView: true,
      view: true,
      filterable: true,
    },

    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
    },
  ];
  console.log(tabsValue);

  const { isLoading, isError } = useQueriesFn([
    {
      queryKey: ProductQuery.GET_ALL_PRODUCTS,
      api: ProductServices.FetchAllProducts,
      setState: (data: any) => {
        console.log(data);

        const finalData = data.map((item: any) => ({
          ...item,
          productTypeName: item.productTypeId === 1 ? 'Services' : 'Goods',
        }));

        setTableValue(finalData);
      },
    },
    {
      queryKey: VendorQuery.GET_ALL_VENDOR_DROPDOWN,
      api: VendorServices.FetchAllVendorsDropdown,
      setState: setAllVendor,
    },
    {
      queryKey: EIRASAAS_API_QUERIES.GET_ALL_PRODUCT_TYPE,
      api: EirasaasAPIs.GetproductType,
      setState: setProductType,
    },
  ]);

  const putMutation = useMutationFn(
    ProductServices.UpdateProductById,
    ProductQuery.GET_ALL_PRODUCTS,
  );
  const postMutation = useMutationFn(
    ProductServices.AddNewProduct,
    ProductQuery.GET_ALL_PRODUCTS,
  );

  const deleteMutation = useMutationFn(
    ProductServices.DeleteproductById,
    ProductQuery.GET_ALL_PRODUCTS,
  );

  function onSubmit(data: ProductDTO): void {
    const selectedVendor = allVendor.filter((v) =>
      data.vendorName?.includes(v.vendorName),
    );
    const vendorIds = selectedVendor.map((v) => v.vendorId);
    console.log(data, 'text');

    const productTypeId = productType.find(
      (head: any) => head.productTypeName === data.productTypeName,
    )?.productTypeId;

    const payload: ProductDTO = {
      ...data,
      vendorId: vendorIds,
      productTypeId: Number(productTypeId),
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: 1,
    };

    console.log('Data before validation:', payload);

    postMutation.mutate(
      { product: payload },
      {
        onSuccess: () => {
          toast.success('Product added successfully!');
          setIsOpen(false);
          setFormFields(defaultValues); // Reset form fields
        },
        onError: (error: any) => {
          const errors = error.response.data.error;
          if (errors?.includes('unique_product_name')) {
            toast.error('Product Name already exists');
          } else {
            toast.error(error.message);
          }
          // setFormFields(defaultValues);
        },
      },
    );
  }

  function onUpdate(data: ProductUpdateDTO): void {
    const selectedVendor = allVendor.filter((v) =>
      data.vendorName?.includes(v.vendorName),
    );
    const vendorIds = selectedVendor.map((v) => v.vendorId);
    console.log(data, 'text');

    const payload: ProductUpdateDTO = {
      ...data,
      vendorId: vendorIds,

      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: data.status,
    };
    console.log('text1', payload);

    putMutation.mutate(
      { productId: data.productId?.toString() || '', product: payload },
      {
        onSuccess: () => {
          toast.success('Product updated successfully!');
          setIsOpen(false);
          setFormFields(defaultValues); // Reset form fields
        },
        onError: (error: any) => {
          const errors = error.response.data.error;
          if (errors?.includes('unique_product_name')) {
            toast.error('Product Name already exists');
          } else {
            toast.error(error.message);
          }
          // setFormFields(defaultValues);
        },
      },
    );
  }
  const label =
    formFields.productTypeName === 'Services'
      ? 'Services Name'
      : 'Product Name';
  const fields: Array<Field> = [
    {
      name: 'productTypeName',
      label: 'Product / Service type',
      type: 'select',
      placeholder: 'Product Type',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('productType', value);
        setFormFields((prev: any) => {
          return {
            ...prev,
            productTypeName: value,
          };
        });
      },
    },
    {
      name: 'productName',
      label: `${label}`,
      type: 'text',
      placeholder: 'Product Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'hsnCode',
      label: 'HSN Code',
      type: 'text',
      placeholder: 'HSN Code',
      // required: true,
      hidden: formFields.productTypeName === 'Goods' ? false : true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'sacCode',
      label: 'SAC Code',
      type: 'text',
      placeholder: 'SAC Code',
      hidden: formFields.productTypeName === 'Services' ? false : true,
      // required: true,
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
      type: 'multiSelect',
      placeholder: 'Vendor Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    {
      name: 'idealGstPercentage',
      label: 'GST %',
      type: 'select',
      placeholder: 'Ideal GST %',
      required: true,

      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm whitespace-nowrap placeholder:text-gray-400',
      },
    },

    {
      name: 'costHeaderName',
      label: 'Cost header',
      type: 'select',
      placeholder: 'Cost header',
      required: false,
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
      required: false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];

  const options = {
    idealGstPercentage: ['0', '2.5', '5', '12', '18', '40'],
    productCategory: [
      'Electronics',
      'Manufacturing Components',
      'Retail',
      'Facilities Management',
    ],
    productTypeName: productType.map((product) => product.productTypeName),
    vendorName: allVendor.map((vendor) => vendor.vendorName),
    costHeaderName: costHeaderDropdown.map((header) => header.costHeaderName),
  };

  const formStyles = {
    pageName: 'Vendor',
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
    setProductToDeleteId(null); // Clear vendorToDeleteId
    setShowDeleteConfirm(false); // Hide delete confirm modal
  };

  // Function to handle confirmation of delete
  const handleConfirmDelete = () => {
    if (productToDeleteId) {
      deleteMutation.mutate(
        { productId: productToDeleteId },
        {
          onSuccess: () => toast.success('Product deleted successfully!'),
          onError: (error: any) =>
            toast.error(`Failed to delete Product: ${error.message || error}`),
          onSettled: () => {
            setProductToDeleteId(null);
            setShowDeleteConfirm(false);
          },
        },
      );
    }
  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Delete') {
      setProductToDeleteId(row.productId?.toString() || null);
      setFormFields(row);
      setShowDeleteConfirm(true);
    } else if (option === 'Edit') {
      const updatedRow = {
        ...row,
        vendorName: Array.isArray(row.vendorName)
          ? row.vendorName.flatMap((name: string) =>
              name.split(',').map((v) => v.trim()),
            )
          : row.vendorName
            ? row.vendorName.split(',').map((v: string) => v.trim())
            : [],
      };

      setFormFields(updatedRow);
      setIsOpen(true);
      setEdit(true);
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

  const table = tableValue.filter((item) =>
    tabsValue === 'Goods'
      ? item.productTypeName?.toUpperCase() === 'GOODS'
      : item.productTypeName?.toUpperCase() === 'SERVICES',
  );

  const includedDownloadColumns = headCell
    .filter((headcell) => headcell.view === true)
    .map((headcell) => headcell.id);
  return (
    <div className="m-2.5">
      {isLoading ? (
        <Loader />
      ) : isError ? (
        toast.error('Failed to load products!')
      ) : (
        <section className="w-full h-full flex flex-col">
          {/* Tabs header */}
          <Tabs
            value={tabsValue}
            onValueChange={setTabsValue}
            className="self-end"
          >
            <TabsList className="flex gap-2">
              <TabsTrigger value="Goods">Goods</TabsTrigger>
              <TabsTrigger value="Services">Services</TabsTrigger>
            </TabsList>
          </Tabs>

          <CustomTable
            headcells={headCell}
            rows={table}
            // pageName="Product"
            functions={allFunctions}
            access={{
              hasCreateAccess: hasCreateAccess,
              hasUpdateAccess: hasUpdateAccess,
            }}
            pageName={tabsValue}
            hide={{
              add: !hasCreateAccess,
              filter: false,
              hidden: false,
              download: false,
            }}
            includedDownloadColumns={includedDownloadColumns}
          />
        </section>
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
              label={edit ? 'Update Product Details' : 'Create New Product'}
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
        description={`Are you sure you want to delete Product ${formFields.productName}?`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        cancelButtonColor="gray"
      />
    </div>
  );
}
