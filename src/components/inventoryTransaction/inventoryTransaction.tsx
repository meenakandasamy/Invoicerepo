import { useState, useMemo, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import type { HeadCell, Row } from '@/types/table';
import type {
  InventoryTransactionDTO,
  InventoryTransactionUpdateDTO,
} from '@/models/inventoryTransactionDTO';
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
import Loader from '@/utils/common/components/loader';
import {
  downloadQuotationPdf,
  downloadQuotationExcel,
} from '@/lib/downloadQuotation';
import {
  InventoryTransactionQuery,
  InventoryTransactionServices,
} from '@/integrations/Services/inventoryTransactionService';
import {
  WarehouseSiteMapQuery,
  WarehouseSiteMapServices,
} from '@/integrations/Services/warehouseSiteMapServices';
import {
  ProductQuery,
  ProductServices,
} from '@/integrations/Services/productService';
import { formatDate } from '@/utils/common/DateUtil';
import {
  InventoryQuery,
  InventoryServices,
} from '@/integrations/Services/inventoryServices';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';
import { DropdownSelect } from '@/utils/common/components/dropDown';
import {
  dropDownApiQueries,
  DropDownServices,
} from '@/integrations/Services/dropDown_services';
import type { siteDropdownType } from '@/types/common';

interface warehouseDropdownType {
  warehouseId: number;
  warehouseName: string;
}
interface productDropdownType {
  productId: number;
  productName: string;
  vendorName: string;
  quantityAvailable: number;
}

interface inventoryDetailsType {
  inventoryId: number;
  quantityAvailable: number;
  quantityReserved: number;
}

interface InventoryTransactionProps extends BaseProps {}
export default function InventoryTransactionPage(
  props: InventoryTransactionProps,
): JSX.Element {
   const { hasCreateAccess, hasUpdateAccess, session } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  // const isOEM = session.userTypeName === 'OEM';
  // Services for fetching dropdown data
  // const { getSiteListDrowndownByCompany, getSiteListDrowndownByCustomer } = EirasaasAPIs;
  const { GetSiteListDropdownByUser } = EirasaasAPIs;
  // const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } = EIRASAAS_API_QUERIES;
  const { GET_SITELIST_BY_USER } = EIRASAAS_API_QUERIES;
  const [warehouseDropdown, setWarehouseDropdown] = useState<
    Array<warehouseDropdownType>
  >([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<
    number | undefined
  >();
  const [productsDropdown, setProductsDropdown] = useState<
    Array<productDropdownType>
  >([]);
  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >();
  const [inventory, setInventory] = useState<Array<inventoryDetailsType>>([]);
  const [inventoryTransfer, setInventoryTransfer] = useState<
    Array<inventoryDetailsType>
  >([]);
  const [inventoryId, setInventoryId] = useState<number | undefined>(0);
  const [inventoryTransferToId, setInventoryTransferToId] = useState<
    number | undefined
  >();
  const [selectedWarehouseTransferToId, setSelectedWarehouseTransferToId] =
    useState<number | undefined>(0);
  const [vendorDropdown, setVendorDropdown] = useState<Array<Row>>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<
    number | undefined
  >();
  const [transactionType, setTransactionType] = useState<string>('');
  const [tableValue, setTableValue] = useState<Array<Row>>([]);

  // --- STATE CHANGES START HERE ---

  // Master lists for warehouses and sites, fetched once.
  const [warehouseToolbarDropdown, setWarehouseToolbarDropdown] = useState<
    Array<warehouseDropdownType>
  >([]);
  const [masterSiteList, setMasterSiteList] = useState<Array<siteDropdownType>>(
    [],
  );

  // State for selected IDs in the toolbar
  const [selectedWarehouseIdToolbar, setSelectedWarehouseIdToolbar] = useState<
    number | undefined
  >();
  const [selectedSiteIdToolbar, setSelectedSiteIdToolbar] = useState<
    number | undefined
  >();

  // State to hold the site mapping data from the API for each context (toolbar and form)
  const [toolbarSiteMap, setToolbarSiteMap] = useState<any[]>([]);
  const [formSiteMap, setFormSiteMap] = useState<any[]>([]);
   const defaultValues = {
    transactionType: '',
    quantity: '',
    referenceType: '',
    referenceId: '',
    transactionDate: '',
    remarks: '',
    status: 1,
    referenceFile: '',
    fileType: '',
    inventoryTransferTo: '',
  };
  const [formFields, setFormFields] = useState<any>(defaultValues);

  const headCells: Array<HeadCell> = [
    {
      id: 'vendorName',
      label: 'Vendor',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: vendorDropdown.map((vendor) => vendor.vendorName),
    },
    {
      id: 'productName',
      label: 'Product',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'transactionType',
      label: 'Transaction Type',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['INBOUND', 'OUTBOUND', 'TRANSFER'],
    },
    {
      id: 'siteName',
      label: 'Site',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'quantity',
      label: 'Quantity',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'referenceType',
      label: 'Reference Type',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'referenceId',
      label: 'Reference ID',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'transactionDate',
      label: 'Transaction Date',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'dateRange',
    },
    {
      id: 'remarks',
      label: 'Remarks',
      defaultView: true,
      view: false,
      filterable: true,
    },
    {
      id: 'referenceFileName',
      label: 'Reference File',
      defaultView: true,
      view: true,
      filterable: false,
    },
    {
      id: 'inventoryTransferToName',
      label: 'Transfered To',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: warehouseToolbarDropdown.map((warehouse) => warehouse.warehouseName),
    },
    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
      filterable: false,
    },
  ];

 
 

  // --- STATE CHANGES END HERE ---

  const transformedWarehouses = useMemo(() => {
    return warehouseToolbarDropdown.map((warehouse) => ({
      label: warehouse.warehouseName,
      value: String(warehouse.warehouseId),
    }));
  }, [warehouseToolbarDropdown]);

  const warehouseMap = useMemo(() => {
    return Object.fromEntries(
      transformedWarehouses.map((w) => [w.value, w.label]),
    );
  }, [transformedWarehouses]);
  // Derived state for the toolbar's site dropdown. This is now declarative.
  const transformedSites = useMemo(() => {
    if (!toolbarSiteMap?.length) return [];
    const mappedSiteIds = new Set(toolbarSiteMap.map((item) => item.siteId));
    return masterSiteList
      .filter((site) => mappedSiteIds.has(site.siteId))
      .map((site) => ({
        label: site.siteName,
        value: String(site.siteId),
      }));
  }, [masterSiteList, toolbarSiteMap]);

  // Initial data fetching for master lists.
  const { isLoading: isMasterLoading, isError } = useQueriesFn([
    {
      queryKey:
        dropDownApiQueries.GET_WAREHOUSE_DROPDOWN + 'INVENTORY_TRANSACTION',
      api: DropDownServices.FetchWarehouseDropdown,
      setState: [setWarehouseDropdown, setWarehouseToolbarDropdown],
    },
    {
      queryKey:
        dropDownApiQueries.GET_VENDOR_DROPDOWN + 'INVENTORY_TRANSACTION',
      api: DropDownServices.FetchVendorDropdown,
      setState: [setVendorDropdown],
    },
    {
      queryKey: GET_SITELIST_BY_USER + 'INVENTORY_TRANSACTION',
      api: GetSiteListDropdownByUser,
      setState: setMasterSiteList,
      id: session.userId,
    },
  ]);

  function transformInventoryTransactions(data: any[]) {
    return data.map((item) => ({
      ...item,
      referenceFileName: item.referenceFile?.split('/').pop() || '-',
      siteName: item.siteId ? siteIdToNameMap[String(item.siteId)] || '-' : '-', // Map siteId to siteName
      warehouseName: warehouseMap[String(item.warehouseId)] || '-', // Map warehouseId to warehouseName
    }));
  }

  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  // 2️⃣ Memoize filtered transactions
  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    return allTransactions.filter((txn: any) => {
      const matchWarehouse = selectedWarehouseIdToolbar
        ? txn.warehouseId === selectedWarehouseIdToolbar
        : true;
      const matchSite = selectedSiteIdToolbar
        ? txn.siteId === selectedSiteIdToolbar
        : true;
      return matchWarehouse && matchSite;
    });
  }, [allTransactions, selectedWarehouseIdToolbar, selectedSiteIdToolbar]);

  // All dependent API calls are here.
  const { isLoading: isDependentLoading } = useQueriesFnWithId([
    {
      queryKey: InventoryTransactionQuery.GET_INVT_TRANSACTION_BY_WAREHOUSE_ID  + 'INVENTORY_TRANSACTION',
      api: InventoryTransactionServices.FetchInventoryTransactionByWarehouseId,
      setState: (data: any[]) => [
        setAllTransactions(data),
        setTableValue(transformInventoryTransactions(data)),
      ],
      id: selectedWarehouseIdToolbar,
    },
    {
      queryKey: ProductQuery.GET_PRODUCT_DROPDOWN_BY_WAREHOUSE_ID + 'INVENTORY_TRANSACTION',
      api: ProductServices.FetchProductDropdownByWarehouseId,
      setState: setProductsDropdown,
      id: selectedWarehouseId,
    },
    ...(transactionType === 'INBOUND'
      ? [
          {
            queryKey:
              ProductQuery.GET_PRODUCT_DROPDOWN_BY_VENDOR_ID +
              'INVENTORY_TRANSACTION',
            api: ProductServices.FetchProductDropdownByVendorId,
            setState: setProductsDropdown,
            id: selectedVendorId,
          },
        ]
      : []),
    {
      queryKey:
        WarehouseSiteMapQuery.GET_WAREHOUSE_MAP_BY_ID +
        'TOOLBAR_WAREHOUSE_DROPDOWN',
      api: WarehouseSiteMapServices.FetchWarehouseSiteMapById,
      setState: setToolbarSiteMap, // Set toolbar-specific map
      id: selectedWarehouseIdToolbar,
    },
    {
      queryKey:
        WarehouseSiteMapQuery.GET_WAREHOUSE_MAP_BY_ID +
        'FORM_WAREHOUSE_DROPDOWN',
      api: WarehouseSiteMapServices.FetchWarehouseSiteMapById,
      setState: setFormSiteMap, // Set form-specific map
      id: selectedWarehouseId,
    },
    ...(selectedWarehouseId && selectedProductId
      ? [
          {
            queryKey:
              InventoryQuery.GET_INVT_BY_WAREHOUSE_AND_PRODUCT_IDS +
              'Inventory',
            api: InventoryServices.FetchInventoriesByWarehouseAndProductIds,
            setState: setInventory,
            id: {
              warehouseId: selectedWarehouseId,
              productId: selectedProductId,
            },
          },
        ]
      : []),
    ...(selectedWarehouseTransferToId && selectedProductId
      ? [
          {
            queryKey:
              InventoryQuery.GET_INVT_BY_WAREHOUSE_AND_PRODUCT_IDS +
              'InventoryTransfer',
            api: InventoryServices.FetchInventoriesByWarehouseAndProductIds,
            setState: setInventoryTransfer,
            id: {
              warehouseId: selectedWarehouseTransferToId,
              productId: selectedProductId,
            },
          },
        ]
      : []),
  ]);

  useEffect(() => {
    if (
      !isMasterLoading &&
      warehouseToolbarDropdown.length > 0 &&
      !selectedWarehouseIdToolbar
    ) {
      setSelectedWarehouseIdToolbar(
        Number(warehouseToolbarDropdown[0].warehouseId),
      );
    }
  }, [isMasterLoading, warehouseToolbarDropdown, selectedWarehouseIdToolbar]);

  useEffect(() => {
    if (inventory) {
      setInventoryId(inventory[0]?.inventoryId);
    }
  }, [inventory]);

  useEffect(() => {
    if (inventoryTransfer) {
      setInventoryTransferToId(inventoryTransfer[0]?.inventoryId);
    }
  }, [inventory]);

  // Create a fast lookup map from siteId to siteName using masterSiteList
  const siteIdToNameMap = useMemo(() => {
    if (!masterSiteList) return {};
    return Object.fromEntries(
      masterSiteList.map((site) => [String(site.siteId), site.siteName]),
    );
  }, [masterSiteList]);

  // 3️⃣ Update table value only when filteredTransactions changes
  useEffect(() => {
    setTableValue(transformInventoryTransactions(filteredTransactions));
  }, [filteredTransactions, siteIdToNameMap, warehouseMap]);

  const putMutation = useMutationFn(
    InventoryTransactionServices.UpdateInventoryTransactionById,
    InventoryTransactionQuery.GET_ALL_INVENTORY_TRANSACTIONS,
  );
  const postMutation = useMutationFn(
    InventoryTransactionServices.AddNewInventoryTransaction,
    InventoryTransactionQuery.GET_ALL_INVENTORY_TRANSACTIONS,
  );

  function onSubmit(data: InventoryTransactionDTO): void {
    const hasReferenceInfo = data.referenceId && data.referenceType;
    const hasReferenceFile = data.referenceFile;

    if (!hasReferenceInfo && !hasReferenceFile) {
      toast.error(
        'Please provide either reference details or a reference file',
      );
      return;
    }
    const site = masterSiteList.find((s) => s.siteName === data.siteName);

    const {
      inventoryTransactionId,
      vendorName,
      warehouseName,
      productName,
      inventoryTransferToName,
      ...restData
    } = data;
    const payload: Omit<
      InventoryTransactionDTO,
      | 'inventoryTransactionId'
      | 'vendorName'
      | 'warehouseName'
      | 'productName'
      | 'inventoryTransferToName'
    > = {
      ...restData,
      vendorId: Number(selectedVendorId) || 0,
      warehouseId: Number(selectedWarehouseId) || 0,
      productId: Number(selectedProductId) || 0,
      inventoryId: Number(inventoryId) || 0,
      quantity: Number(data?.quantity),
      referenceFile: formFields.referenceFile[0]?.base64,
      fileType: formFields?.referenceFile?.[0]?.file?.name?.split('.').pop(),
      warehouseTransferTo: Number(selectedWarehouseTransferToId),
      inventoryTransferTo: Number(inventoryTransferToId) || 0,
      transactionDate: formatDate(
        data.transactionDate || new Date().toISOString(),
        'yyyy-mm-dd',
      ),
      siteId: Number(site?.siteId),
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: 1,
    };
    if (data.transactionType !== 'TRANSFER') {
      delete payload.inventoryTransferTo;
      delete payload.warehouseTransferTo;
    }
    if (data.transactionType !== 'OUTBOUND') {
      delete payload.siteId;
    }
    if (data.referenceType === '') {
      delete payload.referenceType;
    }
    if (data.referenceId === '') {
      delete payload.referenceId;
    }
    console.log(payload, 'payload');

    postMutation.mutate(
      { inventoryTransaction: payload },
      {
        onSuccess: async () => {
          toast.success('Inventory Transaction added successfully!');
          setIsOpen(false);
          setFormFields(defaultValues);
          // Refetch table data for the current warehouse
          if (selectedWarehouseIdToolbar) {
            try {
              const newData =
                await InventoryTransactionServices.FetchInventoryTransactionByWarehouseId(
                  selectedWarehouseIdToolbar.toString(),
                );
              setTableValue(transformInventoryTransactions(newData));
            } catch (error) {
              toast.error('Failed to refresh table data.');
            }
          }
        },
        onError: (error: any) => {
          setIsOpen(false);
          toast.error(
            `Failed to add Inventory Transaction: ${error.message || error}`,
          );
          setFormFields(defaultValues);
        },
      },
    );
  }

  function onUpdate(data: InventoryTransactionUpdateDTO): void {
    const hasReferenceInfo = data.referenceId && data.referenceType;
    const hasReferenceFile = data.referenceFile;

    if (!hasReferenceInfo && !hasReferenceFile) {
      toast.error(
        'Please provide either reference details or a reference file',
      );
      return;
    }
    const {
      vendorName,
      vendorId,
      warehouseId,
      warehouseName,
      productName,
      productId,
      referenceFileName,
      inventoryTransferToName,
      ...restData
    } = data;

    const payload: Omit<
      InventoryTransactionUpdateDTO,
      | 'vendorName'
      | 'vendorId'
      | 'warehouseName'
      | 'warehouseId'
      | 'productName'
      | 'productId'
      | 'referenceFileName'
      | 'inventoryTransferToName'
    > = {
      ...restData,
      inventoryId: Number(data?.inventoryId),
      quantity: Number(data?.quantity),
      // referenceFile: data?.referenceFile?.[0]?.base64 ?? '',
      fileType:
        formFields?.referenceFile?.[0]?.file?.name?.split('.').pop() ?? '',
      inventoryTransferTo: Number(inventoryTransferToId) || 0,
      warehouseTransferTo: Number(selectedWarehouseTransferToId),
      transactionDate: formatDate(
        data.transactionDate || new Date().toISOString(),
        'yyyy-mm-dd',
      ),
      lastUpdatedBy: session.userId,
      status: 1,
    };

    if (data.transactionType !== 'TRANSFER') {
      delete payload.inventoryTransferTo;
      delete payload.warehouseTransferTo;
    }
    if (data.transactionType !== 'OUTBOUND') {
      delete payload.siteId;
    }
    if (data.referenceType === '') {
      delete payload.referenceType;
    }
    if (data.referenceId === '') {
      delete payload.referenceId;
    }
    console.log(data, 'data');
    console.log(data.referenceFile, 'data.referenceFile');

    console.log(payload, 'payload');

    putMutation.mutate(
      {
        inventoryTransactionId: data?.inventoryTransactionId || '',
        inventoryTransaction: payload,
      },
      {
        onSuccess: async () => {
          toast.success('Inventory Transaction updated successfully!');
          setIsOpen(false);
          setFormFields(defaultValues);
          // Refetch table data for the current warehouse
          if (selectedWarehouseIdToolbar) {
            try {
              const newData =
                await InventoryTransactionServices.FetchInventoryTransactionByWarehouseId(
                  selectedWarehouseIdToolbar.toString(),
                );
              setTableValue(transformInventoryTransactions(newData));
            } catch (error) {
              toast.error('Failed to refresh table data.');
            }
          }
        },
        onError: (error: any) => {
          setIsOpen(false);
          toast.error(
            `Failed to update Inventory Transaction: ${error.message || error}`,
          );
          setFormFields(defaultValues);
        },
      },
    );
  }

  const baseFields: Array<Field> = [
    {
      name: 'transactionType',
      label: 'Transaction Type',
      type: 'select',
      placeholder: 'Enter Transaction Type',
      onChange: (_name: string, value: any, form: any) => {
        setTransactionType(value);
        if (value !== 'TRANSFER') {
          form.setFieldValue('inventoryTransferTo', '');
        }
        form.setFieldValue('warehouseName', '');
        form.setFieldValue('vendorName', '');
        form.setFieldValue('productName', '');
        setSelectedWarehouseId(undefined);
        setSelectedProductId(undefined);
      },
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'referenceType',
      label: 'Reference Type',
      type: 'text',
      placeholder: 'Enter Reference Type',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'referenceId',
      label: 'Reference ID',
      type: 'text',
      placeholder: 'Enter Reference ID',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'warehouseName',
      label: 'Warehouse Name',
      type: 'select',
      placeholder: 'Select a warehouse',
      onChange: (_name: string, value: any, form: any) => {
        const selectedWarehouse = warehouseDropdown.find(
          (w) => w.warehouseName === value,
        );
        form.setFieldValue('productName', '');
        form.setFieldValue('inventoryId', '');
        form.setFieldValue('siteName', '');
        form.setFieldValue('inventoryTransferTo', ''); // Reset site name in form
        setProductsDropdown([]);
        setSelectedWarehouseId(selectedWarehouse?.warehouseId);
        setSelectedProductId(0);
        setInventory([]);
        setInventoryId(0);
        setInventoryTransferToId(undefined);
        setSelectedWarehouseTransferToId(undefined);
        setFormSiteMap([]); // Clear old map data
      },
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'productName',
      label: 'Product Name',
      type: 'select',
      placeholder:
        transactionType === 'INBOUND'
          ? !selectedVendorId
            ? 'Please select vendor first'
            : isDependentLoading
              ? 'Loading products...'
              : productsDropdown.length === 0
                ? 'No products available'
                : 'Select a product'
          : !selectedWarehouseId
            ? 'Please select warehouse first'
            : isDependentLoading
              ? 'Loading products...'
              : productsDropdown.length === 0
                ? 'No products available'
                : 'Select a product',
      disabled:
        (transactionType === 'INBOUND' && !selectedVendorId) ||
        (transactionType !== 'INBOUND' && !selectedWarehouseId),
      onChange: (name: string, value: any, form: any) => {
        const selectedProduct = productsDropdown.find(
          (p) => p.productName === value.split(' - ')[0],
        );
        if (transactionType !== 'INBOUND') {
          const selectedVendor = vendorDropdown.find(
            (p) => p.vendorName === value.split(' - ')[1],
          );
          setSelectedVendorId(selectedVendor?.vendorId);
        }
        setSelectedProductId(selectedProduct?.productId);

        setTimeout(() => {
          if (inventory && inventory[0]?.inventoryId) {
            setFormFields((prev: typeof defaultValues) => ({
              ...prev,
              [name]: value,
              inventoryId: inventory[0]?.inventoryId,
            }));
            form.setFieldValue('inventoryId', inventory[0]?.inventoryId);
          }
        }, 300);
      },
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'quantity',
      label: 'Quantity',
      type: 'number',
      placeholder: 'Enter Quantity',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm placeholder:text-gray-400',
      },
    },
    {
      name: 'transactionDate',
      label: 'Transaction Date',
      type: 'date',
      placeholder: 'Select Date',
      required: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('transactionDate', value);
      },
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
      placeholder: 'Enter Remarks',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'referenceFile',
      label: 'Reference File',
      type: 'file',
      placeholder: 'Choose File',
      onChange: (name: string, value: any) => {
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value,
        }));
      },
    },
  ];
  const vendorNameField = {
    name: 'vendorName',
    label: 'Vendor Name',
    type: 'select',
    placeholder: 'Select a Vendor',
    disabled: transactionType != 'INBOUND',
    onChange: (_name: string, value: any, form: any) => {
      const selectedVendor = vendorDropdown.find((v) => v.vendorName === value);
      form.setFieldValue('productName', '');
      form.setFieldValue('inventoryId', '');
      setProductsDropdown([]);
      setSelectedVendorId(selectedVendor.vendorId);
      setSelectedProductId(undefined);
      setInventory([]);
      setInventoryId(undefined);
    },
    required: true,
    styles: {
      wrapper: 'flex flex-col gap-1',
      label: 'text-sm font-medium text-gray-500',
      input:
        'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    },
  };
  const transferField = {
    name: 'inventoryTransferTo',
    label: 'Transfer To',
    type: 'select',
    placeholder: selectedWarehouseTransferToId
      ? ''
      : 'Enter Destination Inventory',
    hidden: transactionType !== 'TRANSFER',
    onChange: (_name: string, value: any) => {
      const selectedWarehouseTransferTo = warehouseDropdown.find(
        (w) => w.warehouseName === value,
      );
      setSelectedWarehouseTransferToId(
        selectedWarehouseTransferTo?.warehouseId,
      );
    },
    required: transactionType === 'TRANSFER',
    styles: {
      wrapper: 'flex flex-col gap-1',
      label: 'text-sm font-medium text-gray-500',
      input:
        'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    },
  };
  const siteNameField = {
    name: 'siteName',
    label: 'To Site',
    type: 'select',
    placeholder:
      transactionType !== 'OUTBOUND'
        ? 'Site selection only required for Outbound transactions'
        : !selectedWarehouseId
          ? 'Please select warehouse first'
          : !formSiteMap
            ? 'Loading sites...'
            : formSiteMap.length === 0
              ? 'No sites mapped to warehouse'
              : 'Select a site',
    required: transactionType === 'OUTBOUND',
    disabled: transactionType !== 'OUTBOUND' || !selectedWarehouseId,
    onChange: (_name: string, value: any) =>
      setFormFields({ ...formFields, siteName: value }),
    value: formFields.siteName,
    styles: {
      wrapper: 'flex flex-col gap-1',
      label: 'text-sm font-medium text-gray-500',
      input:
        'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 placeholder:text-gray-400 ',
    },
  };

  let fields = [...baseFields];

  if (transactionType === 'INBOUND') {
    const warehouseIndex = fields.findIndex((f) => f.name === 'warehouseName');
    fields.splice(warehouseIndex + 1, 0, vendorNameField);
  }

  // Insert 'Site Name' after 'warehouseName' if transactionType is 'OUTBOUND'
  if (transactionType === 'OUTBOUND') {
    const warehouseIndex = fields.findIndex((f) => f.name === 'warehouseName');
    fields.splice(warehouseIndex + 1, 0, siteNameField);
  }

  // Insert 'inventoryTransferTo' after 'warehouseName' if transactionType is 'TRANSFER'
  if (transactionType === 'TRANSFER') {
    const warehouseIndex = fields.findIndex((f) => f.name === 'warehouseName');
    fields.splice(warehouseIndex + 1, 0, transferField);
  }

  const formStyles = {
    pageName: 'Vendor',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const options = useMemo(() => {
    // Derive form site options declaratively here.
    const formSiteOptions = formSiteMap?.length
      ? masterSiteList
          .filter((site) =>
            new Set(formSiteMap.map((item) => item.siteId)).has(site.siteId),
          )
          .map((site) => site.siteName)
      : [];

    return {
      transactionType: ['INBOUND', 'OUTBOUND', 'TRANSFER'],
      warehouseName: warehouseDropdown.map(
        (warehouse) => warehouse.warehouseName,
      ),
      vendorName: vendorDropdown.map((vendor) => vendor.vendorName),
      productName:
        transactionType === 'INBOUND'
          ? productsDropdown?.map((product) => product.productName)
          : productsDropdown?.map(
              (product) =>
                `${product.productName} - ${product.vendorName} - (${product.quantityAvailable})`,
            ),
      siteName: formSiteOptions, // Use the derived options
      inventoryTransferTo:
        transactionType === 'TRANSFER'
          ? warehouseDropdown
              .filter((wh) => wh.warehouseId !== selectedWarehouseId)
              .map((wh) => wh.warehouseName)
          : [],
    };
  }, [
    transactionType,
    selectedWarehouseId,
    warehouseDropdown,
    productsDropdown,
    masterSiteList,
    formSiteMap,
  ]);

  const handleOpen = async () => {
    setFormFields(defaultValues);
    setEdit(false);
    setIsOpen(true);
  };
  const handleClose = () => {
    setSelectedWarehouseId(undefined);
    setSelectedProductId(undefined);
    setInventoryTransferToId(undefined);
    setSelectedSiteIdToolbar(undefined);
    setSelectedVendorId(undefined);
    setFormSiteMap([]); // Reset the form map on close
    setTransactionType('');
    setIsOpen(false);
    setEdit(false);
    setFormFields(defaultValues);
  };

  async function handleOptionClick(option: string, row: any) {
    if (option === 'Delete') {
      setFormFields(row);
    } else if (option === 'Edit') {
      setInventoryTransferToId(row.inventoryTransferTo);
      setTransactionType(row.transactionType);
      setSelectedWarehouseId(row.warehouseId);
      setFormFields(row);
      setEdit(true);
      setIsOpen(true);
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

  const allQueriesLoaded = !isMasterLoading;

  const handleDownloadFile = (row: Row) => {
    const url = row.referenceFile;
    const fileType = url.split('.').pop()?.toLowerCase();
    if (fileType === '') {
      return;
    }
    fileType === 'pdf'
      ? downloadQuotationPdf(url)
      : downloadQuotationExcel(url);
  };

  return (
    <div className="m-2.5">
      {!allQueriesLoaded ? (
        <Loader />
      ) : isError ? (
        toast.error('Failed to load Inventory Transactions!')
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="Inventory Transactions"
          functions={allFunctions}
          access={{
            hasCreateAccess: true,
            hasUpdateAccess,
          }}
          hide={{
            add: hasCreateAccess,
            filter: false,
            hidden: false,
            download: false,
          }}
          clickableColumn="referenceFileName"
          onClick={(row) => handleDownloadFile(row)}
          customToolbarItems={{
            position: 'before',
            element: (
              <>
                <DropdownSelect
                  value={selectedWarehouseIdToolbar?.toString() ?? ''}
                  onChange={(val) => {
                    const newId = val ? Number(val) : undefined;
                    setSelectedWarehouseIdToolbar(newId);
                    setToolbarSiteMap([]); // Clear old map data for better UX
                    setSelectedSiteIdToolbar(undefined);
                  }}
                  options={transformedWarehouses}
                  placeholder={
                    isMasterLoading
                      ? 'Loading warehouses...'
                      : 'Select a Warehouse'
                  }
                  isLoading={isMasterLoading}
                />
                <DropdownSelect
                  value={selectedSiteIdToolbar?.toString() ?? ''}
                  onChange={(val) => {
                    setSelectedSiteIdToolbar(val ? Number(val) : undefined);
                  }}
                  options={transformedSites}
                  placeholder={
                    isDependentLoading
                      ? 'Loading sites...'
                      : transformedSites.length === 0
                        ? 'No Sites mapped to this warehouse'
                        : 'Select a Site'
                  }
                  showClearButton={Boolean(selectedSiteIdToolbar)}
                  handleClear={() => {
                    setSelectedSiteIdToolbar(undefined);

                    // Trigger fetch using the current warehouse ID
                    InventoryTransactionServices.FetchInventoryTransactionByWarehouseId(
                      selectedWarehouseIdToolbar?.toString() || '',
                    )
                      .then((data) => {
                        setTableValue(transformInventoryTransactions(data));
                      })
                      .catch((error) => {
                        console.error(
                          'Failed to fetch inventory transactions:',
                          error,
                        );
                        setTableValue([]); // fallback or clear the table
                      });
                  }}
                />
              </>
            ),
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
              options={options}
              fields={fields}
              styles={formStyles}
              label={
                edit
                  ? 'Update Inventory Transaction'
                  : 'Add New Inventory Transaction'
              }
              buttonLabel={edit ? 'Update' : 'Submit'}
            />
          </Modal>
        </div>
      )}
    </div>
  );
}
