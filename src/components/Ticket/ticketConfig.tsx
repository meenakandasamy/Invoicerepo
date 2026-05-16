import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import type { JSX } from 'react';
import type { BaseProps } from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import debounce from 'lodash/debounce';
import {
  useMutationFn,
  useQueriesFn,
} from '@/utils/common/queryUtils';
import {
  PoloaQueries,
  PoloaServices,
} from '@/integrations/Services/PoloaService';
import Loader from '@/utils/common/components/loader';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

interface ticketProps extends BaseProps {}
export const TicketConfig = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: ticketProps): JSX.Element => {
  const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } =
    EIRASAAS_API_QUERIES;
  const { GetSiteListDropdownByCompany, GetSiteListDropdownByCustomer } =
    EirasaasAPIs;

  const isOEM = session.userTypeName === 'OEM';

  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const [siteDropdown, setSiteDropdown] = useState<Array<any>>([]);
  const [toBackend, setToBackend] = useState<boolean>(false);


  const queries = [
    {
      queryKey:
        (isOEM ? GET_SITELIST_BY_COMPANY : GET_SITELIST_BY_CUSTOMER) + 'CCM',
      api: isOEM ? GetSiteListDropdownByCompany : GetSiteListDropdownByCustomer,
      setState: setSiteDropdown,
      id: isOEM ? session.companyId : session.customerId,
    },
    // {
    //   queryKey: CostCentreQueries.GET_COST_CENTRE_DROPDOWN + 'CCM',
    //   api: CostCentreServices.fetchCostCentreDropdown,
    //   setState: setPouploadlist,
    // },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);


  const postMutation = useMutationFn(
    PoloaServices.AddNewpoloa,
    PoloaQueries.GET_ALL,
  );
  const putMutation = useMutationFn(
    PoloaServices.UpdatePoloaById,
    PoloaQueries.GET_ALL,
  );
  const HeadCells = [
    {
      id: 'vendorCode',
      label: 'Vendor Code',
      view: true,
      filterable: true,
    },
    {
      id: 'vendorName',
      label: 'Vendor Name',
      view: true,
      filterable: true,
    },
    { id: 'castHeader', label: 'Cost Header', view: true, filterable: true },
    { id: 'castCenter', label: 'Cost Center', view: true, filterable: true },
    
    { id: 'action', label: 'Action', view: true, filterable: false },
  ];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const clickableColumnList: Array<string> = ['documentName'];
  const [formFields, setFormFields] = useState<poloaFieldType>(defaultValues);
  const fields: Array<Field> = [
    {
      name: 'vendorName',
      label: 'Vendor Email / Code',
      type: 'text',
      placeholder: 'Enter Vendor Email / Code',
      required: true,
      // disabled: edit || toBackend,
      // onChange: (_name: string, value: any, form: any) => {
      //   form.setFieldValue('vendorName', value);
      //   validateVendorEmail(value, form,);
      // },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'selectedVendorName',
      label: 'Vendor Name',
      type: 'text',
      placeholder: 'Vendor Name',
      disabled: true,
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
    const handleDownloadDocument = (row: any) => {
    const fileUrl = row;

    if (typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
    }
  };
  const formStyles = {
    pageName: 'Cost centre',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-blue-500 dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const handleOpen = () => {
    setIsOpen(true);
    setFormFields({
      ...formFields,
      uploadType: tabsValue === 'LOA' ? 'LOA' : 'PO',
    });
  };
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
    setEdit(false);
  };
  const options = {

  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      const data = {
        ...row,
        vendorName: row.vendorCode,
        selectedVendorName: row.vendorName,
      };
      setFormFields(data);
      setIsOpen(true);
      setEdit(true);
    }
  }
const includedDownloadColumns = HeadCells.filter((headcell) => 
    headcell.view === true)
  .map((headcell) => headcell.id);  
  function onSubmit(data: any) {
  //   setToBackend(true);
  //   ((data.vendorId = vendorDropdown.find(
  //     (ven: any) => ven.vendorCode === data.vendorName,
  //   )?.vendorId),
  //     (data.costHeaderid = costHeadersDropdown.find(
  //       (head: any) => head.costHeaderName === data.castHeader,
  //     )?.costHeaderId),
  //     (data.costCentreid = costCentersDropdown.find(
  //       (head: any) => head.costCentreName === data.castCenter,
  //     )?.costCentreId),
  //     postMutation.mutate(data, {
  //       onSuccess: () => {
  //         toast.success('Cost Centre created successfully!');
  //         handleClose();
  //         setFormFields(defaultValues);
  //         setToBackend(false);
  //       },
  //       onError: (error: any) => {
          
  //         setToBackend(false);
  //             const errors=error.response.data.error
  //         if (errors?.includes('unique_po_number')) {
  //   toast.error('PO number already exists. Document already uploaded for this PO.');
  // }else{
  //   toast.error(error.message);
  // }
  //       },
        
  //     }));
  }

  function onUpdate(data: any) {


  const label = tabsValue === 'LOA' ? 'Upload the LOA' : 'Upload the PO';
  return (
    <div className="m-2.5">
       {PolistQuery.isLoading ||
          status.some((item) => item === 'pending') ? (
            <Loader />
          ) : (
      <section className="w-full h-full flex flex-col">
        {/* Tabs header */}
        <Tabs
          value={tabsValue}
          onValueChange={setTabsValue}
          className="self-end"
        >
          <TabsList className="flex gap-2">
            <TabsTrigger value="PO">PO</TabsTrigger>
            <TabsTrigger value="LOA">LOA</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* COST CENTRE TAB */}

        <>
         
            <CustomTable
              headcells={HeadCells}
              rows={tabledata}
              pageName={tabsValue}
              hide={{
                add: false,
                filter: false,
                hidden: false,
                download: false,
              }}
              access={{
                hasCreateAccess: true,
                hasUpdateAccess: hasUpdateAccess,
              }}
              functions={{
                addFn: handleOpen,
                optionHandler: (option: any, row: any) =>
                  handleOptionClick(option, row),
              }}
                onClick={(row, headcellId) => {
                if (headcellId === 'documentName') {
                  handleDownloadDocument(row.document);
                }
              }}
              clickableColumn={clickableColumnList}
                includedDownloadColumns={includedDownloadColumns}
            />
        
        </>

        {/* COST HEADER TAB */}
      </section>
    )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal open={isOpen} onClose={handleClose}>
            <CustomForm
              initialValues={formFields}
              submitFunction={(data) =>
                edit ? onUpdate(data) : onSubmit(data)
              }
              onClose={handleClose}
              fields={fields}
              options={options}
              styles={formStyles}
              label={label}
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
