import { useState ,useEffect} from 'react';

import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

import { Modal } from '@mui/material';
import { CustomTable } from '../table/customTable';
import { TicketcreateForm } from '../form/ticketcreateFrom';
import type { JSX } from 'react';
import type { BaseProps } from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';

import { useTicketApproval } from '@/hooks/data/useTicketapprovalist';
import {

  useMutationFn,
  useQueriesFn,
} from '@/utils/common/queryUtils';
import {
  TicketApprovalQueries,
  TicketApprovalServices,
} from '@/integrations/Services/ticketApprovalServices';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';


interface TicketProps extends BaseProps {}
export const TicketApproval = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: TicketProps): JSX.Element => {
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  console.log(tableValue);
  
  const [dataCocunt, setDatacocunt] = useState<Array<Row>>([]);
    const [approvaluserlist, setApprovalserlist] = useState<Array<Row>>([]);
  const [ticketTypes, setTicketTypes] = useState<Array<any>>([]);
  const [ticketCategory, setTicketCategory] = useState<Array<any>>([]);
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [userlist, setUserlist] = useState<Array<any>>([]);
  const [Sitelist, setSitelist] = useState<Array<any>>([]);
  const [ticketstate, setTicketstate] = useState<Array<any>>([]);
  const [SiteId, setSiteId] = useState<number | null>(0);
  const attachApproverLevel = (item: any) => {
  const match = approvaluserlist.find(
    (a) => a.siteId === item.siteId
  );

  const approverLevel = match?.approverLevel ?? null;

  const approverstatus =
    (item.stateName === 'Closed' && approverLevel === 1) ||
    (approverLevel === 2 && item.currentLevel !== null);

  return {
    ...item,
    tickets: item.ticketCode,
    approverLevel,
    approverstatus,
     currentLevelstatus:
            item.currentLevel > 0
              ? `${item.currentLevel} Approved`
              : item.currentLevel < 0
                ? 'Reassigned'
                : null,
    assignedBy: item.assignedBy ?? '-',
  };
};


  const queries = [
     {
      queryKey: TicketApprovalQueries.VITE_TICKET_APPROVAL_USERLIST,
      api: TicketApprovalServices.fetchapprovaluserlist,
      setState: setApprovalserlist,
      id: session.userId,
    },
     {
      queryKey: TicketApprovalQueries.GET_TICKET_APPROVAL_COCUNT,
      api: TicketApprovalServices.fetchgetTicketApprovalCount,
      setState: setDatacocunt,
      id: session.userId,
    },
    {
      queryKey: EIRASAAS_API_QUERIES.GET_TICKET_CATEGORY,
      api: EirasaasAPIs.FetchTicketCategory,
      setState: setTicketCategory,
      id: session.userId,
    }, {
      queryKey: EIRASAAS_API_QUERIES.GET_ALL_TICKET_STATE,
      api: EirasaasAPIs.FetchAllstate,
      setState: setTicketstate,
    },

    {
      queryKey: EIRASAAS_API_QUERIES.GET_USER_LIST_SITEID,
      api: EirasaasAPIs.FetchAlluserlistbySiteid,
      setState: setUserlist,
      id: SiteId,
    },
    {
      queryKey: EIRASAAS_API_QUERIES.GET_SITELIST_BY_USER,
      api: EirasaasAPIs.GetSiteListDropdownByUser,
      setState: setSitelist,
      id: session.userId,
    },

   
    // {
    //   queryKey: EIRASAAS_API_QUERIES.GET_ALL_TICKET_CATEGORY,
    //   api: EirasaasAPIs.FetchAllcategory,
    //   setState: setTicketCategory,
    // },
   
  ];
 
  const postTicketlistMutation = useMutationFn(
    TicketApprovalServices.TicketFilterlist,
    null,
  );
  const postTicketcocuntMutation = useMutationFn(
    TicketApprovalServices.TicketFiltercocuntlist,
    null,
  );
  const postMutation = useMutationFn(
    TicketApprovalServices.postTicketApproval,
   TicketApprovalQueries.GET_TICKET_APPROVAL_USERID,
  );
    const putApprovalReassignMutation = useMutationFn(
    TicketApprovalServices.ReassignApprovalticket,
    null,
  );
    const putTicketReassignMutation = useMutationFn(
    EirasaasAPIs.Reassignticket,
    null,
  );
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
      label: 'Ticket No',
      id: 'ticketCode',

      view: true,
      default: true,
    },
    {
      label: 'Site Name',
      id: 'siteName',
      view: true,
      default: true,
    },
    // {
    //   label: "Ticket Type",
    //   id: "ticketTypeName",
    //   view: true,
    //   default: true,
    // },
    {
      label: 'Ticket Category',
      id: 'categoryName',
      view: true,
      default: false,
    },
    {
      label: 'Equipment Name',
      id: 'displayName',
      view: true,
      default: true,
    },

    {
      label: 'Priority',
      id: 'priority',
      view: true,
      default: false,
    },
    // {
    //   label: "Created By",
    //   id: "userName",
    //   view: true,
    //   default: false,
    // },
    {
      label: 'Created Date',
      id: 'createdDate',
      view: true,
      default: false,
    },
    {
      label: 'Assigned To',
      id: 'assignedBy',
      view: true,
      default: true,
    },
    {
      label: 'Schedule  On',
      id: 'scheduleOn',
      view: true,
      default: true,
    },
    {
      label: 'State',
      id: 'stateName',
      view: true,
      default: true,
    },
    {
      label: 'Status',
      id: 'statusName',
      view: true,
      default: true,
    },
    {
      label: 'Current Level',
      id: 'currentLevelstatus',

      view: true,
      default: true,
    },
    {
      label: 'Subject',
      id: 'subject',
      view: true,
      default: true,
    },
    {
      label: 'Action',
      id: 'action',
      view: true,
      default: true,
    },
  ];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
    const [isCustom, setIscustom] = useState<boolean>(false);
  const defaultValues = {
    approvedBy: 0,
    lastUpdatedBy: 0,
    remarks: '',
    ticketId: 0,
    ticketStatusId: 0,
    assignedTo:0,
    assignedBy:''
  };
  const clickableColumnList: Array<string> = ['documentName'];
  const [formFields, setFormFields] = useState<approveFieldType>(defaultValues);
  
    const {
      data: [dependentResponse],
      status,
    } = useQueriesFn(queries);
  
    const TicketconfigQuery = useTicketApproval(session);
   
  
    useEffect(() => {
      if (TicketconfigQuery.data) {
        const sortedData = [...TicketconfigQuery.data].sort(
          (a: any, b: any) =>
            new Date(b.lastUpdatedDate).getTime() -
            new Date(a.lastUpdatedDate).getTime(),
        );
  
        setTableValue(sortedData);
      }
    }, [TicketconfigQuery.data]);
  const fields: Array<Field> = [
    {
      name: 'remark',
      label: 'Remark',
      type: 'text',
      placeholder: 'Enter Remark',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
  const fielddata: Array<Field> = [
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'multiSelect',
      placeholder: 'Site Name',
      required: true,
      // onChange: (name, value, form) => {
      //   form.setFieldValue(name, value);
      //   const selectSiteId = Sitelist.find(
      //     (type) => type.siteName === value,
      //   )?.siteId;
      //   setSiteId(selectSiteId);
      // },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'fromDate',
      label: 'From Date',
      type: 'date',
      placeholder: 'From Date',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'toDate',
      label: 'To Date',
      type: 'date',
      placeholder: 'To Date',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'basedOn',
      label: 'Based On',
      type: 'select',
      placeholder: 'Based On',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'ticketCategory',
      label: 'Ticket Category',
      type: 'select',
      placeholder: 'Ticket Category',
      required: false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      placeholder: 'Priority',
      required: false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'assigned',
      label: 'Assigned',
      type: 'select',
      placeholder: 'Assigned',
      required: false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    // {
    //   name: 'statusName',
    //   label: 'Ticket State',
    //   type: 'select',
    //   placeholder: 'Ticket State',
    //   required: false,
    //   styles: {
    //     wrapper: 'flex flex-col gap-1',
    //     label: 'text-sm font-medium text-gray-500',
    //     input:
    //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
    //   },
    // },
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
    container: 'fixed inset-0 z-50 flex items-center justify-center p-2',

    form: `
    w-full
  max-w-xl
    rounded-[28px]
    bg-white
    shadow-2xl
    border
    border-gray-200
    overflow-hidden
    flex
    flex-col
  `,

    grid: `
    grid
    grid-cols-1
    md:grid-cols-1
     gap-x-5
    gap-y-2
    w-full
  `,

    submitButton:
      'h-11 px-8 rounded-xl bg-violet-600 text-white hover:bg-violet-600 transition',

    cancelButton:
      'h-11 px-8 rounded-xl bg-violet-600 text-white hover:bg-violet-600 transition',
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
    setIscustom(false)
  };
    const handlReassign = () => {setIscustom(true)
  // let data = {
  //       ticketId: editValue?.ticketId,
  //       closedBy: editValue?.lastUpdatedBy,
  //       rejectedBy: sessionStorage.getItem("id"),
  //       reassignTo: editValue?.assignedTo,
  //       scheduleOn: formattedDate,
  //       lastUpdatedBy: Number(sessionStorage.getItem("id")),
  //     };
  //     let datas = {
  //       assignedTo: editValue?.assignedTo,
  //       scheduleOn: formattedDate,
  //       remarks: editValue?.remarks,
  //       lastUpdatedBy: Number(sessionStorage.getItem("id")),
  //     };
  };
  const options = {
    ticketTypes: ticketTypes.map((type) => type.ticketTypeName),
 
    priority: ['High', 'Medium', 'Low'],
    assigned: userlist.map((type) => type.userName),
    basedOn: ['Created Date', 'Scheduled On'],
    siteName: Sitelist.map((site) => site.siteName),
    ticketCategory: ticketstate.map((state) => state.statusName),
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
  const includedDownloadColumns = headCells
    .filter((headcell) => headcell.view === true)
    .map((headcell) => headcell.id);
  function onSubmit(data: any) {
    setToBackend(true);
    ((data.siteId = Sitelist.filter((site: any) =>
      data.siteName.includes(site.siteName),
    ).map((site: any) => site.siteId)),
      (data.ticketStatusId = ticketstate.find(
        (state: any) => state.statusName === data.statusName,
      )?.ticketStatusId),
      (data.categoryId = ticketCategory.find(
        (head: any) => head.categoryName === data.ticketCategory,
      )?.categoryId),
      (data.filterType =
        data.basedOn === 'Scheduled On' ? 'scheduleOn' : 'createdDate'),
         (data. ticketStateId = 3),
      (data.priority =
        data.priority === 'High'
          ? 3
          : data.priority === 'Medium'
            ? 2
            : data.priority === 'Low'
              ? 1
              : undefined),
      (data.fromDate = data.fromDate
        ? new Date(data.fromDate).toISOString().split('T')[0]
        : null),
      (data.toDate = data.toDate
        ? new Date(data.toDate).toISOString().split('T')[0]
        : null),

      postTicketlistMutation.mutate(data, {
        onSuccess: (e: any) => {
   const updatedData = e.map(attachApproverLevel);
    console.log(updatedData);
    
    setTableValue(updatedData);
          // setTableValue(e);
          handleClose();
          setFormFields(defaultValues);
          setToBackend(false);
        },
      }));
    postTicketcocuntMutation.mutate(data, {
      onSuccess: (e: any) => {
        setDatacocunt(e);
        setToBackend(false);
      },
    });
  }
    function handleReassignSubmit(data: any) {
      console.log(data);
      
    setToBackend(true);
      const tomorrowDate = format(
    addDays(new Date(), 1),
    'yyyy-MM-dd 00:00:00'
  );
   const datas={
   remarks:formFields.remarks,
    ticketId:formFields.ticketId,
    assignedTo:formFields.assignedTo,
    lastUpdatedBy:session.userId,
    scheduleOn:tomorrowDate 
   }
    const datavalue={
    ticketStatusId:8,
    ticketId:formFields.ticketId,reassignBy:formFields.assignedTo,
    remarks:formFields.remarks,closedBy:session.userId,rejectedBy:session.userId,
    lastUpdatedBy:session.userId,
    approvedBy:session.userId
   }
      putTicketReassignMutation.mutate(datas, {
        onSuccess: (e: any) => {
          setFormFields(defaultValues);
          setToBackend(false);
        },
      });
    putApprovalReassignMutation.mutate(datavalue, {
      onSuccess: (e: any) => {
        setDatacocunt(e);
        setToBackend(false);
      },
    });
  }
  function onSubmitdata(data: any) {
    const payload = {
      ticketStatusId: data?.ticketStatusId,
      ticketId: data?.ticketId,
      remarks: data?.remarks,
      lastUpdatedBy: data?.lastUpdatedBy,
      approvedBy: session.userId,
    };

    setToBackend(true);
    postMutation.mutate(payload, {
      onSuccess: (e: any) => {
        handleClose();
        setFormFields(defaultValues);
        setToBackend(false);
      },
      onError: (error: any) => {
        setToBackend(false);
      },
    });
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
              add: true,
              filter: false,
              hidden: false,
              download: false,
            }}
            access={{
              hasCreateAccess: true,
              hasUpdateAccess: hasUpdateAccess,
            }}
            labels={'Ticket Approval'}
            onSubmit={onSubmit}
            submitFunction={onSubmit}
            field={fielddata}
            option={options}
            carddata={dataCocunt}
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
            <TicketcreateForm
              initialValues={formFields}
              submitFunction={(data) => onSubmitdata(data)}
              onClose={handleClose}
              onReset={isCustom ?handleReassignSubmit:handlReassign}
              fields={fields}
              isCustom={isCustom}
      customdata={`Are you sure you want to reassign this ticket to ${
  formFields.assignedBy
} on ${format(addDays(new Date(), 1), 'dd-MM-yyyy')}`}
              options={options}
              buttonLabel={edit ? 'Update' : 'Approve'}
              optionalbuttonLabel={'Re-assign'}
              styles={formStyles}
              label={'Ticket Approval'}
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
