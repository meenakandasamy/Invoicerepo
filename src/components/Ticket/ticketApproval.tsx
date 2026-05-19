import { useState } from 'react';
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
import { useQueriesFn } from '@/utils/common/queryUtils';
import {
  TicketApprovalQueries,
  TicketApprovalServices,
} from '@/integrations/Services/ticketApprovalServices';
import {
EIRASAAS_API_QUERIES,EirasaasAPIs
} from '@/integrations/Services/commonServices';

interface TicketProps extends BaseProps {}
export const TicketApproval = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: TicketProps): JSX.Element => {
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
   const [ticketTypes, setTicketTypes] = useState<Array<any>>([]);
      const [ticketCategory, setTicketCategory] = useState<Array<any>>([]);
  const [toBackend, setToBackend] = useState<boolean>(false);

  const queries = [
    {
      queryKey: TicketApprovalQueries.GET_TICKET_APPROVAL_USERID,
      api: TicketApprovalServices.fetchgetallTicketApproval,
      setState: setTableValue,
      id: session.userId,
    },
        {
      queryKey: EIRASAAS_API_QUERIES.GET_TICKET_TYPE,
      api: EirasaasAPIs.FetchTicketType,
      setState: setTicketTypes,
      id: session.userId,
    },
        {
      queryKey: EIRASAAS_API_QUERIES.GET_TICKET_CATEGORY,
      api: EirasaasAPIs.FetchTicketCategory,
      setState: setTicketCategory,
      id: session.userId,
    },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);

  // const postMutation = useMutationFn(
  //   PoloaServices.AddNewpoloa,
  //   PoloaQueries.GET_ALL,
  // );
  // const putMutation = useMutationFn(
  //   PoloaServices.UpdatePoloaById,
  //   PoloaQueries.GET_ALL,
  // );
  // const HeadCells = [
  //   {
  //     id: 'vendorCode',
  //     label: 'Vendor Code',
  //     view: true,
  //     filterable: true,
  //   },
  //   { id: 'action', label: 'Action', view: true, filterable: false },
  // ];
  const headCells = [
  {
    label: "Ticket No",
    id: "ticketCode",

    view: true,
    filterable: true,
  },
  {
    label: "Site Name",
    id: "siteName",
    view: true,
    filterable: true,
  },
  // {
  //   label: "Ticket Type",
  //   id: "ticketTypeName",
  //   view: true,
  //   default: true,
  // },
  {
    label: "Ticket Category",
    id: "categoryName",
    view: true,
    filterable: false,
  },
  {
    label: "Equipment Name",
    id: "displayName",
    view: true,
    filterable: true,
  },

  {
    label: "Priority",
    id: "priority",
    view: true,
    filterable: false,
  },
  // {
  //   label: "Created By",
  //   id: "userName",
  //   view: true,
  //   default: false,
  // },
  {
    label: "Created Date",
    id: "createdDate",
    view: true,
    filterable: false,
  },
  {
    label: "Assigned To",
    id: "assignedBy",
    view: true,
    filterable: true,
  },
  {
    label: "Schedule  On",
    id: "scheduleOn",
    view: true,
    filterable: true,
  },
  {
    label: "State",
    id: "stateName",
    view: true,
    filterable: true,
  },
  {
    label: "Status",
    id: "statusName",
    view: true,
    filterable: true,
  },
  {
    label: "Current Level",
    id: "currentLevel",
    headerStyle: { width: "100px" },

    view: true,
    filterable: true,
  },
  {
    label: "Subject",
    id: "subject",
    view: true,
    filterable: true,
  },
  {
    label: "Action",
    id: "action",
    view: true,
    filterable: true,
  },
];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const defaultValues = {
    selectedVendorName: '',
    vendorName: '',
    poNumber: '',
    uploadType: '',
    castHeader: '',
    castCenter: '',
    document: '',
    poId: '',
  };
  const clickableColumnList: Array<string> = ['documentName'];
  const [formFields, setFormFields] = useState<poloaFieldType>(defaultValues);
  const fields: Array<Field> = [
    {
      name: 'vendorName',
      label: 'Vendor Email / Code',
      type: 'text',
      placeholder: 'Enter Vendor Email / Code',
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
      console.log('Invalid document URL');
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
    });
  };
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
    setEdit(false);
  };
  const options = {
    ticketTypes: ticketTypes.map((type) => type.ticketTypeName),
    ticketCategory: ticketCategory.map((category) => category.ticketCategoryName),
    uploadType: ['PO', 'LOA'],
  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      const data = {
        ...row,
      };
      setFormFields(data);
      setIsOpen(true);
      setEdit(true);
    }
  }
  const includedDownloadColumns = headCells.filter(
    (headcell) => headcell.view === true,
  ).map((headcell) => headcell.id);
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
    //   ((data.vendorId = vendorDropdown.find(
    //     (ven: any) => ven.vendorCode === data.vendorName,
    //   )?.vendorId),
    //     (data.costHeaderid = costHeadersDropdown.find(
    //       (head: any) => head.costHeaderName === data.castHeader,
    //     )?.costHeaderId),
    //     (data.costCentreid = costCentersDropdown.find(
    //       (head: any) => head.costCentreName === data.castCenter,
    //     )?.costCentreId),
    //     putMutation.mutate(data, {
    //       onSuccess: () => {
    //         toast.success('Site mapped to Cost Centre successfully!');
    //         handleClose();
    //         setFormFields(defaultValues);
    //       },
    //       onError: (error: any) => {
    //         const errors=error.response.data.error
    //         if (errors?.includes('unique_po_number')) {
    //   toast.error('PO number already exists. Document already uploaded for this PO.');
    // }else{
    //   toast.error(error.message);
    // }
    //       },
    //     }));
  }

  // ----- TABS STATE -----
  return (
    <div className="m-2.5">
      {/* {tableValue.isLoading ||
          status.some((item) => item === 'pending') ? (
            <Loader />
          ) : ( */}
      <section className="w-full h-full flex flex-col">
        <>
          <CustomTable
            headcells={headCells}
            rows={tableValue}
            pageName={'Ticket Approval'}
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
      {/* )} */}

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
              label={''}
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
