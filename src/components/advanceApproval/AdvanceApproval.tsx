import { useState } from 'react';
import { Modal } from '@mui/material';
import { toast } from 'sonner';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import type { JSX } from 'react';
import type { HeadCell, Row } from '@/types/table';
import type { Field } from '@/types/form';
import type {
  productDropdownType,
  vendorDropdownType,
} from '@/types/requestor';
import type { QueryConfig } from '@/utils/common/queryUtils';
import type {
  BaseProps,
  siteDropdownType,
} from '@/types/common';
import {
  useDependentQueries,
  useMutationFn,
  useQueriesFn,
  useQueriesFnWithId,
} from '@/utils/common/queryUtils';
import {
  advanceApprovalQueries,
  advanceApprovalServices,
} from '@/integrations/Services/advanceApprovalServices';
import Loader from '@/utils/common/components/loader';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';
import {
  DropDownServices,
  dropDownApiQueries,
} from '@/integrations/Services/dropDown_services';
import {
  downloadQuotationExcel,
  downloadQuotationPdf,
} from '@/lib/downloadQuotation';


interface POApprovalProps extends BaseProps {}
export const AdvanceApproval = (props: POApprovalProps): JSX.Element => {
  const { hasCreateAccess, hasUpdateAccess, session } = props;
  // States:
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState('');
  const [siteDropdown, setSiteDropdown] = useState<Array<siteDropdownType>>([]);
  const [vendorDropdown, setVendorDropdown] = useState<
    Array<vendorDropdownType>
  >([]);
  const [selectedVendor, setSelectedVendorId] = useState<number>(0);
  const [selectedRowId, setSelectedRowId] = useState<string>('');
  const [productDropdown, setProductDropdown] = useState<
    Array<productDropdownType>
  >([]);
  const [tableValue, setTableValue] = useState<Array<Row>>([]);

  // API calls:
  {
    /* Destructuring Logics */
  }
  const {
    getAllApprovalLists,
    addNewAdvanceApproval,
    updateExistingAdvanceApproval,
    getPurchaseListByAdvId,
  } = advanceApprovalServices;
  const { getAllApprovalListsQueries, getPurchaseListQueryByAdvId } =
    advanceApprovalQueries;
  const { GetSiteListDropdownByCompany, GetSiteListDropdownByCustomer } =
    EirasaasAPIs;
  const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } =
    EIRASAAS_API_QUERIES;

  {
    /* Dependent Logics */
  }
  const isOEM = session.userTypeName === 'OEM';
  const initialGetQueries: Array<QueryConfig> = [
    {
      queryKey: isOEM ? GET_SITELIST_BY_COMPANY+ 'AA' : GET_SITELIST_BY_CUSTOMER+ 'AA',
      api: isOEM
        ? GetSiteListDropdownByCompany
        : GetSiteListDropdownByCustomer,
      setState: setSiteDropdown,
      id: isOEM ? session.companyId : session.customerId,
    },
    {
      queryKey: dropDownApiQueries.GET_VENDOR_DROPDOWN+ 'AA',
      api: DropDownServices.FetchVendorDropdown,
      setState: setVendorDropdown,
    },
  ];
  const tableQuery: Array<QueryConfig> = [
    {
      queryKey: getAllApprovalListsQueries+ 'AA',
      api: getAllApprovalLists,
      setState: setTableValue,
    },
  ];
  const approvalStatusNames = [
    { id: 1, label: 'Pending' },
    { id: 2, label: 'In Progress' },
    { id: 3, label: 'Approved' },
    { id: 4, label: 'Rejected' },
  ];
  const dependentLogic = (
    response: Array<Row>,
    dropdown: Array<siteDropdownType>,
  ) => {
    const result = response.map((item: Row) => {
      const sites = dropdown.find(
        (site: siteDropdownType) => site.siteId === item.siteId,
      );
      return {
        ...item,
        siteName: sites?.siteName,
        approverStatusName: approvalStatusNames.find(
          (status) => status.id === item.approverStatusId,
        )?.label,
        status: item.status === 1 ? 'Active' : 'Inactive',
        quotationFileName: item.quotationFilePath?.split('/').pop(),
      };
    });
    return result;
  };
  {
    /* useQueries */
  }
  const {
    data: [dependentResponse],
    status: sts,
  } = useQueriesFn(initialGetQueries);
  const { isLoading } = useDependentQueries(
    sts,
    dependentResponse,
    dependentLogic,
    tableQuery,
  );
  const productCallQuery = [
    {
      queryKey: dropDownApiQueries.GET_PRODUCTS_DROPDOWN_BY_VENDOR + 'AA',
      api: DropDownServices.GetProductsDropdownByVendor,
      setState: setProductDropdown,
      id: selectedVendor,
    },
  ];
  useQueriesFnWithId(productCallQuery);

  function setPurchaseListOnForm(data: any) {
    const formattedPurchaseList = data.map((item: any) => {
      return item;
    });
    setFormFields((prev) => ({
      ...prev,
      purchaseList: formattedPurchaseList,
    }));
  }
  const purchaseListQuery: Array<QueryConfig> = [
    {
      queryKey: getPurchaseListQueryByAdvId + 'AA',
      api: getPurchaseListByAdvId,
      setState: setPurchaseListOnForm,
      id: selectedRowId,
    },
  ];
  useQueriesFnWithId(purchaseListQuery);
  {
    /* Mutations */
  }
  const postMutation = useMutationFn(
    addNewAdvanceApproval,
    getAllApprovalListsQueries,
  );
  const putMutation = useMutationFn(
    updateExistingAdvanceApproval,
    getAllApprovalListsQueries,
  );

  // Form Logics:
  const defaultValues: AdvanceRequestFields = {
    requestId: 0,
    employeeName: session.userName,
    emailId: '',
    siteName: '',
    siteId: 0,
    siteLocation: '',
    requestDate: '',
    hubName: '',
    costing: 0,
    description: '',
    vendorName: '',
    status: 'Active',
    quotationFilePath: '',
    purchaseList: [],
  };
  const [formFields, setFormFields] =
    useState<AdvanceRequestFields>(defaultValues);
  const handleOpen = (): void => setIsOpen(true);
  const handleClose = (): void => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setSelectedVendorId(0);
    setSelectedRowId('');
    setEdit('');
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


  const fields: Array<Field> = [
    {
      name: 'employeeName',
      label: 'Employee Name',
      type: 'text',
      placeholder: 'Employee Name',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 placeholder:text-gray-400 ',
      },
    },
    {
      name: 'hubName',
      label: 'Hub Name',
      type: 'text',
      placeholder: 'Hub Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
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
      name: 'siteLocation',
      label: 'Site Location',
      type: 'text',
      placeholder: 'Site Location',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'costing',
      label: 'Amount',
      type: 'number',
      placeholder: 'Costing',
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
      onChange: (name: string, value: any) => {
        const vendorId = vendorDropdown.find(
          (vendor) => vendor.vendorName === value,
        )?.vendorId;
        if (!vendorId) return;
        setSelectedVendorId(vendorId);
        setFormFields((prev) => ({ ...prev, [name]: value }));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'requestDate',
      label: 'Request Date',
      type: 'date',
      placeholder: 'Request Date',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
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
      name: 'quotationFilePath',
      label: 'Quotation File',
      type: 'file',
      placeholder: 'Choose File',
      required: true,
      // value: formFields.quotationFilePath
      //   ? formFields.quotationFilePath.split('/').pop()
      //   : 'No File Chosen',
    onChange: (name: string, value: any) => {
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value[0].file.name,
        }));
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
      name: 'purchaseList',
      label: 'Products List',
      type: 'productMultiSelect',
      placeholder: !selectedVendor ? 'Select Vendor' : 'Products',
      required: true,
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
  const options: Record<string, Array<string | number>> = {
    status: ['Active', 'Inactive'],
    siteName: siteDropdown.map((item) => item.siteName),
    vendorName: vendorDropdown.map((item) => item.vendorName),
    purchaseList: productDropdown.map(
      (item: productDropdownType) => item.productName,
    ),
  };
  const label =
    edit === 'Edit'
      ? 'Update Request'
      : edit === 'View'
        ? 'View Request'
        : 'Add Request';
  const buttonLabel =
    edit === 'Edit' ? 'Update' : edit === 'View' ? 'View' : 'Submit';
  function toLocalISOString(dateStr: string): string {
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in ms
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 19);
    return `${localISOTime}.000Z`;
  }
  {
    /* Submit Call */
  }
  function onSubmit(res: PostAvanceRequestDTO): void {
    const {
      employeeName,
      requestDate,
      siteName,
      status,
      employeeId,
      emailId,
      siteId,
      quotationFilePath,
      purchaseList,
      ...rest
    } = res;
    const siteDetails: siteDropdownType | undefined = siteDropdown.find(
      (item) => item.siteName === siteName,
    );

    if (!siteDetails) {
      console.error('Site not found');
      return;
    }
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
    const createdBy = 1;
    const fileType = formFields.quotationFilePath[0]?.file?.name
      .split('.')
      .pop();
    const fileUrl = formFields.quotationFilePath[0]?.base64;
    const payload = {
      employeeName: session.userName,
      employeeId: session.userId,
      emailId: session.emailId,
      siteName: siteDetails.siteName,
      siteId: siteDetails.siteId,
      requestDate: toLocalISOString(requestDate),
      status: status === 'Active' ? 1 : 0,
      createdBy: createdBy,
      lastUpdatedBy: createdBy,
      userType: session.userTypeName,
      relationId: 17,
      quotationFilePath: fileUrl,
      fileType: fileType,
      purchaseList: productList,
      ...rest,
    };
    console.log(payload, 'payloadpayload');
    postMutation.mutate(payload, {
      onSuccess: () => {
        setIsOpen(false);
        toast.success('Request added successfully!');
        setFormFields(defaultValues);
        setEdit('');
      },
      onError: (error: Error) => {
        toast.error(`Failed to add request: ${error.message || error}`);
      },
    });
  }
  function onUpdate(resp: PutAdvanceRequestDTO): void {
    const { siteName, requestDate, status, siteId, ...rest } = resp;

    const sameSite = formFields.siteName === siteName;
    const sameStatus = formFields.status === status;
    const changedDate = formFields.requestDate !== requestDate;

    const newSite = siteDropdown.find((site) => site.siteName === siteName);

    if (!newSite) {
      console.error('User or Site not found');
      return;
    }

    const payload = {
      siteName: sameSite ? formFields.siteName : newSite.siteName,
      siteId: sameSite ? formFields.siteId : newSite.siteId,
      requestDate: changedDate
        ? toLocalISOString(requestDate)
        : formFields.requestDate,
      status: sameStatus
        ? formFields.status
        : status === 'Active'
          ? 1
          : status === 'Inactive'
            ? 0
            : 1,
      lastUpdatedBy: 1,
      ...rest,
    };

    putMutation.mutate(payload, {
      onSuccess: () => {
        setIsOpen(false);
        toast.success('Request updated successfully!');
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        toast.error(`Failed to update request: ${error.message || error}`);
      },
    });
    console.log(payload, 'payload data');
  }

  // Table Logics:
  const headCells: Array<HeadCell> = [
    {
      id: 'employeeName',
      label: 'Employee Name',
      view: true,
      filterable: true,
    },
    { id: 'emailId', label: 'Email Id', view: true, filterable: true },
    { id: 'hubName', label: 'Hub Name', view: true, filterable: true },
    { id: 'siteName', label: 'Site Name', view: true, filterable: true, filterType: 'select', filterOptions: siteDropdown.map((item) => item.siteName) },
    {
      id: 'siteLocation',
      label: 'Site Location',
      view: true,
      filterable: true,
    },
    { id: 'costing', label: 'Costing', view: true, filterable: true, filterType: 'range'},
    {
      id: 'quotationFileName',
      label: 'Quotation File',
      view: true,
      filterable: false,
    },
    { id: 'description', label: 'Description', view: true, filterable: true },
    { id: 'createdDate', label: 'Created Date', view: false, filterable: true, filterType: 'dateRange' },
    { id: 'requestDate', label: 'Request Date', view: true, filterable: true, filterType: 'dateRange' },
    {
      id: 'lastUpdatedDate',
      label: 'Last Updated',
      view: false,
      filterable: true,
      filterType: 'dateRange',
    },
    {
      id: 'approve1Timestamp',
      label: 'Approver 1 Time',
      view: false,
      filterable: true,
      filterType: 'dateRange'
    },
    {
      id: 'approve2Timestamp',
      label: 'Approver 2 Time',
      view: false,
      filterable: true,
      filterType: 'dateRange'
    },
    {
      id: 'approve3Timestamp',
      label: 'Approver 3 Time',
      view: false,
      filterable: true,
      filterType: 'dateRange'
    },
    {
      id: 'approve1Comments',
      label: 'Approver 1 Comments',
      view: false,
      filterable: true,
    },
    {
      id: 'approve2Comments',
      label: 'Approver 2 Comments',
      view: false,
      filterable: true,
    },
    {
      id: 'approve3Comments',
      label: 'Approver 3 Comments',
      view: false,
      filterable: true,
    },
    {
      id: 'approverStatusName',
      label: 'Approval Status',
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Pending', 'Approved', 'Rejected', 'In Progress'],
    },
    { id: 'status', label: 'Status', view: true, filterable: true },
    {
      id: 'action',
      label: 'Action',
      view: true,
      defaultView: true,
      filterable: false,
    },
  ];
  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };
  const handleDownloadQuotation = (row: Row) => {
    const url = row.quotationFilePath;
    const fileType = url.split('.').pop()?.toLowerCase();

    fileType === 'pdf'
      ? downloadQuotationPdf(url)
      : downloadQuotationExcel(url);
  };
  const editOptions = ['View'];

  function handleOptionClick(option: string, row: Row): void {
    if (option === 'Edit' || option === 'View') {
      setFormFields(row as AdvanceRequestFields);
      setSelectedVendorId(row.vendorId);
      setSelectedRowId(row.advApprovalId);
      setIsOpen(true);
      setEdit(option);
    }
  }

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="Advance Request"
          functions={allFunctions}
          clickableColumn="quotationFileName"
          onClick={(row) => handleDownloadQuotation(row)}
          editOptions={editOptions}
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
              submitFunction={(val) =>
                edit === 'Edit' ? onUpdate(val) : onSubmit(val)
              }
              onClose={handleClose}
              fields={fields}
              options={options}
              styles={formStyles}
              label={label}
              buttonLabel={buttonLabel}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
