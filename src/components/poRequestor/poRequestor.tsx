import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import type { JSX } from 'react/jsx-runtime';
import type { Field } from '@/types/form';
import type { HeadCell, Row } from '@/types/table';
import type {
  optionsTypes,
  paymentDropdownType,
  productDropdownType,
  requestDefaultValueTypes,
  vendorDropdownType,
} from '@/types/requestor';
import type { BaseProps, siteDropdownType } from '@/types/common';
import {
  useDependentQueries,
  useMutationFn,
  useQueriesFn,
  useQueriesFnWithId,
} from '@/utils/common/queryUtils';
import {
  DropDownServices,
  dropDownApiQueries,
} from '@/integrations/Services/dropDown_services';
import {
  ApprovalQuery,
  ApprovalServices,
} from '@/integrations/Services/approvalService';
import Loader from '@/utils/common/components/loader';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';
import {
  downloadQuotationExcel,
  downloadQuotationPdf,
} from '@/lib/downloadQuotation';

interface POApprovalProps extends BaseProps {}

export default function PoPequestor(props: POApprovalProps): JSX.Element {
  const { hasCreateAccess, hasUpdateAccess, session } = props;

  const { fetchAllApprovals, addNewApproval, updateApprovalById } =
    ApprovalServices;
  const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } =
    EIRASAAS_API_QUERIES;
  const { GetSiteListDropdownByCompany, GetSiteListDropdownByCustomer } =
    EirasaasAPIs;

  // States Handling
  const [tableValue, setTableValue] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState('');
  const [selectedVendor, setSelectedVendorId] = useState<number>(0);
  const [selectedRowId, setSelectedRowId] = useState<string>('');
  const [paymentDropdown, setPaymentDropdown] = useState<
    Array<paymentDropdownType>
  >([]);
  const [vendorDropdown, setVendorDropdown] = useState<
    Array<vendorDropdownType>
  >([]);
  const [siteDropdown, setSiteDropdown] = useState<Array<siteDropdownType>>([]);
  const [productDropdown, setProductDropdown] = useState<
    Array<productDropdownType>
  >([]);

  // Form variables
  const defaultValues: requestDefaultValueTypes = {
    requestorName: session.userName,
    siteName: '',
    vendorName: '',
    gstNo: '',
    taxableValue: '',
    paymentTermsName: '',
    deliveryAddress: '',
    deliveryTime: '',
    description: '',
    status: 'Active',
    quotationFilePath: '',
    purchaseList: [],
  };

  function dependentLogic(response: any, response2: any) {
    const result = response.map((item: any) => {
      const sites = response2.find((site: any) => site.siteId === item.siteId);

      return {
        ...item,
        siteName: sites?.siteName,
        quotationFileName: item.quotationFilePath?.split('/').pop(),
      };
    });
    return result;
  }

  const isOEM = session.userTypeName === 'OEM';
  const useQueriesObj = [
    {
      queryKey: dropDownApiQueries.GET_PAYMENT_TERM_DROPDOWN + 'request',
      api: DropDownServices.FetchPaymentTermDropdown,
      setState: setPaymentDropdown,
    },
    {
      queryKey: dropDownApiQueries.GET_VENDOR_DROPDOWN + 'request',
      api: DropDownServices.FetchVendorDropdown,
      setState: setVendorDropdown,
    },
    {
      queryKey: isOEM ? GET_SITELIST_BY_COMPANY + 'request' : GET_SITELIST_BY_CUSTOMER + 'request',
      api: isOEM
        ? GetSiteListDropdownByCompany
        : GetSiteListDropdownByCustomer,
      setState: setSiteDropdown,
      id: isOEM ? session.companyId : session.customerId,
    },
  ];

  const {
    data: [, , dependentResponse = []],
    status,
  } = useQueriesFn(useQueriesObj);

  const tableValueQuery = [
    {
      queryKey: ApprovalQuery.GET_ALL_APPROVALS,
      api: fetchAllApprovals,
      setState: setTableValue,
    },
  ];

  const { isLoading } = useDependentQueries(
    status,
    dependentResponse,
    dependentLogic,
    tableValueQuery,
  );

  const [formFields, setFormFields] =
    useState<requestDefaultValueTypes>(defaultValues);

  function defaultValueSetterByVendor(vendorName: string, form: any): void {
    const vendor: vendorDropdownType | undefined = vendorDropdown.find(
      (item: any) => item.vendorName === vendorName,
    );
    if (!vendor) {
      toast.error('Vendor not found');
      return;
    }
    const { gstNo, vendorId } = vendor;
    setFormFields((prev: requestDefaultValueTypes) => ({
      ...prev,
      gstNo: gstNo,
    }));
    form.setFieldValue('gstNo', gstNo);
    setSelectedVendorId(vendorId);
  }
  const query = [
    {
      queryKey: dropDownApiQueries.GET_PRODUCTS_DROPDOWN_BY_VENDOR,
      api: DropDownServices.GetProductsDropdownByVendor,
      setState: setProductDropdown,
      id: selectedVendor,
    },
  ];
  useQueriesFnWithId(query);

  const postMutation = useMutationFn(
    addNewApproval,
    ApprovalQuery.GET_ALL_APPROVALS,
  );

  function onSubmit(data: any): void {
    const {
      siteName,
      vendorName,
      paymentTermsName,
      products,
      quotationFilePath,
      // eslint-disable-next-line no-shadow
      status,
      ...restData
    } = data;
    const vendor: any = vendorDropdown.find(
      (item: any) => item.vendorName === vendorName,
    );
    const paymentTerm: any = paymentDropdown.find(
      (item: any) => item.paymentTermsName === paymentTermsName,
    );

    const site: any = siteDropdown.find(
      (item: any) => item.siteName === siteName,
    );

    const productList = formFields['purchaseList'].map((item: any) => {
      const foundProduct: any = productDropdown.find(
        (product: any) => product.productName === item.productName,
      );

      return {
        productId: foundProduct.productId,
        quantityCount: item.quantityCount,
        status: 1,
      };
    });

    const payload = {
      ...restData,
      siteId: site.siteId,
      vendorId: vendor.vendorId,
      paymentTermsId: paymentTerm.paymentTermsId,
      purchaseList: productList,
      status: status === 'Active' ? 1 : 0,
      userType: session.userTypeName,
      relationId:
        session.userTypeName === 'OEM' ? session.companyId : session.customerId,
      lastUpdatedBy: session.userId,
      createdBy: session.userId,
      quotationFilePath: quotationFilePath,
    };
    console.log(payload, 'payloadsnameValue');

    postMutation.mutate(payload, {
      onSuccess: () => {
        setIsOpen(false);
        toast.success('PO Request added successfully!');
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        toast.error(`Failed to update PO Request: ${error.message}`);
      },
    });
  }

  const label =
    edit === 'Edit'
      ? 'Update Request'
      : edit === 'View'
        ? 'View Request'
        : 'Add Request';
  const buttonLabel =
    edit === 'Edit' ? 'Update' : edit === 'View' ? 'View' : 'Submit';
  function handleOptionClick(option: string, row: any) {
    if (option === 'Delete') {
      // handleDelete(row.requestId);
    } else if (option === 'Edit' || option === 'View') {
      console.log(row, 'edit row');
      setSelectedRowId(row.requestId);
      setSelectedVendorId(row.vendorId);
      setFormFields(row);
      setIsOpen(true);
      setEdit(option);
    }
  }
  function setPurchaseData(data: any) {
    const formattedPurchaseList = data.map((item: any) => {
      return item;
    });
    setFormFields((prev) => ({
      ...prev,
      purchaseList: formattedPurchaseList,
    }));
  }

  const getByIdQueries = [
    {
      queryKey: ApprovalQuery.GET_PURCHASELIST_BY_REQID,
      api: ApprovalServices.fetchPurchaseByReqId,
      setState: setPurchaseData,
      id: selectedRowId,
    },
  ];
  useQueriesFnWithId(getByIdQueries);
  const putMutation = useMutationFn(
    updateApprovalById,
    ApprovalQuery.GET_ALL_APPROVALS,
  );
  function onUpdate(data: any): void {
    const {
      siteName,
      siteId,
      paymentTermsName,
      paymentTermsId,
      vendorName,
      vendorId,
      // eslint-disable-next-line no-shadow
      status,
      ...restData
    } = data;
    const sameSite = formFields.siteName === siteName;
    const sameVendor = formFields.vendorName === vendorName;
    const sameTerms = formFields.paymentTermsName === paymentTermsName;
    let statusId = 1;
    switch (status) {
      case 'Active':
      case 1:
        statusId = 1;
        break;
      case 'Inactive':
      case 0:
        statusId = 0;
        break;
      default:
        statusId = 1;
        break;
    }
    const payload = {
      siteName,
      siteId: sameSite
        ? siteId
        : siteDropdown.filter((item: any) => item.siteName === siteName)[0]
            .siteId,
      paymentTermsName,
      paymentTermsId: sameTerms
        ? paymentTermsId
        : paymentDropdown.filter(
            (item: any) => item.paymentTermsName === paymentTermsName,
          )[0].paymentTermsId,
      vendorName,
      vendorId: sameVendor
        ? vendorId
        : vendorDropdown.filter(
            (item: any) => item.vendorName === vendorName,
          )[0].vendorId,
      status: statusId,

      ...restData,
    };
    console.log(payload);

    putMutation.mutate(data, {
      onSuccess: () => {
        toast.success('PO Request updated successfully!');
        setIsOpen(false);
        setEdit('');
      },
      onError: (error: any) => {
        toast.error(`Failed to update PO Request: ${error.message}`);
      },
    });
  }

  const fields: Array<Field> = [
    {
      name: 'requestorName',
      label: 'Requestor Name',
      type: 'text',
      placeholder: 'Requestor Name',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 placeholder:text-gray-400 ',
      },
    },
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'select',
      placeholder: 'Site Name',
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
      placeholder: 'Vendor Name',
      required: true,
      onChange: (_, value: string, form: any): void => {
        defaultValueSetterByVendor(value, form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'gstNo',
      label: 'GST No',
      type: 'text',
      placeholder: 'GST No',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      disabled: true,
    },
    {
      name: 'taxableValue',
      label: 'Taxable Value',
      type: 'text',
      placeholder: 'Taxable Value',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'paymentTermsName',
      label: 'Payment Terms',
      type: 'select',
      placeholder: 'Payment Terms',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'deliveryAddress',
      label: 'Delivery Address',
      type: 'text',
      placeholder: 'Delivery Address',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'deliveryTime',
      label: 'Delivery Time',
      type: 'text',
      placeholder: 'Delivery Time',
      required: true,
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
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Status',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'quotationFilePath',
      label: 'Quotation File',
      type: 'file',
      placeholder: 'Choose File',
      required: true,
      onChange: (name: string, value: any) => {
        console.log(value[0].file.name, 'onchangeValue');
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value[0].file.name,
        }));
      },
      value: formFields.quotationFilePath
        ? formFields.quotationFilePath.split('/').pop()
        : 'No File Chosen',
    },
    { name: '', label: '', type: '', placeholder: '' },
    {
      name: 'purchaseList',
      label: 'Products List',
      type: 'productMultiSelect',
      placeholder: !selectedVendor ? 'Select Vendor' : 'Products',
      disabled: !selectedVendor,
      viewer: {
        productList: formFields['purchaseList'],
        countHandler: (type: string, productName: string) => {
          setFormFields((prev: any) => {
            const updatedList = [...(prev.purchaseList || [])];
            const index = updatedList.findIndex(
              (p) => p.productName === productName,
            );

            if (index === -1 && type === 'plus') {
              // Add new product
              updatedList.push({
                productName,
                productId: '',
                quantityCount: 1,
              });
            } else if (index !== -1) {
              const currentCount = updatedList[index].quantityCount || 0;
              const newCount =
                type === 'plus' ? currentCount + 1 : currentCount - 1;

              if (newCount < 1) {
                updatedList.splice(index, 1); // Remove if count < 1
              } else {
                updatedList[index] = {
                  ...updatedList[index],
                  quantityCount: newCount,
                };
              }
            }

            return {
              ...prev,
              purchaseList: updatedList,
            };
          });
        },
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (_field: any, value: any) => {
        const purchaseList = value.map((productName: string) => ({
          productName,
          productId: '',
          quantityCount: 1,
        }));
        setFormFields({ ...formFields, purchaseList: purchaseList });
      },
      value:
        formFields['purchaseList']?.length > 0
          ? formFields['purchaseList'].map((item: any) => item.productName)
          : [],
    },
  ];
  const headCells: Array<HeadCell> = [
    {
      id: 'requestorName',
      label: 'Requestor Name',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'deliveryAddress',
      label: 'Delivery Address',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'deliveryTime',
      label: 'Delivery Time',
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
      id: 'approveStatusName',
      label: 'Approval Status',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'levelId',
      label: 'Approval Level',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [1,2,3]
    },
    {
      id: 'paymentTermsName',
      label: 'Payment Terms',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: paymentDropdown.map((item: any) => item.paymentTermsName),
    },
    {
      id: 'taxableValue',
      label: 'Taxable Value',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'quotationFileName',
      label: 'Quotation File',
      defaultView: true,
      view: true,
      filterable: false,
    },
    {
      id: 'siteName',
      label: 'Site Name',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: siteDropdown.map((item: any) => item.siteName),
    },
    {
      id: 'vendorName',
      label: 'Vendor',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: vendorDropdown.map((item: any) => item.vendorName),
    },
    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
      filterable: false,
    },
  ];
  const options: optionsTypes = {
    status: ['Active', 'Inactive'],
    paymentTermsName: paymentDropdown.map((item: any) => item.paymentTermsName),
    vendorName: vendorDropdown.map((item: any) => item.vendorName),
    siteName: siteDropdown.map((item: any) => item.siteName),
    purchaseList: productDropdown.map((item: any) => item.productName),
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

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setEdit('');
  };
  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };
  console.log(formFields, 'formfieldss');
  const editOptions = ['View'];
  const handleDownloadQuotation = (row: Row) => {
    const url = row.quotationFilePath;
    const fileType = url.split('.').pop()?.toLowerCase();

    fileType === 'pdf'
      ? downloadQuotationPdf(url)
      : downloadQuotationExcel(url);
  };
  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="Request"
          functions={allFunctions}
          access={{
            hasCreateAccess: hasCreateAccess,
            hasUpdateAccess: hasUpdateAccess,
          }}
          clickableColumn="quotationFileName"
          onClick={(row) => handleDownloadQuotation(row)}
          editOptions={editOptions}
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
                edit.length > 0 ? onUpdate(data) : onSubmit(data)
              }
              onClose={handleClose}
              fields={fields}
              options={options}
              styles={formStyles}
              label={label}
              buttonLabel={buttonLabel}
            />
            {/* {!dropdownLoading ? (
              <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
                <div className="w-full max-w-2xl p-5 rounded-xl backdrop-blur-md shadow-xl bg-white">
                  Hey
                </div>
              </div>
            ) : (
              <CustomForm
                initialValues={formFields}
                submitFunction={(data) =>
                  edit.length > 0 ? onUpdate(data) : onSubmit(data)
                }
                onClose={handleClose}
                fields={fields}
                options={options}
                styles={formStyles}
                label={label}
                buttonLabel={buttonLabel}
              />
            )} */}
          </Modal>
        </div>
      )}
    </div>
  );
}
