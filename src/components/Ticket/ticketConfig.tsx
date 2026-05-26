import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { CustomTable } from '../table/customTable';
import { TicketcreateForm } from '../form/ticketcreateFrom';
import type { JSX } from 'react';
import type { BaseProps, siteDropdownType } from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import { useTicketconfig } from '@/hooks/data/useTicketconfig';
import {
  TicketconfigQueries,
  TicketconfigServices,
} from '@/integrations/Services/TicketconfigServices';

interface TicketconfigProps extends BaseProps {}
export const Ticketconfig = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: TicketconfigProps): JSX.Element => {
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [ticketTypes, setTicketTypes] = useState<Array<any>>([]);
  const [ticketCategory, setTicketCategory] = useState<Array<any>>([]);
  const [ticketstate, setTicketstate] = useState<Array<any>>([]);
  const [ticketDataState, setTicketDataState] = useState<Array<any>>([]);
  const [ticketchart, setTicketchart] = useState<Array<any>>([]);
  const [userlist, setUserlist] = useState<Array<any>>([]);
  const [Sitelist, setSitelist] = useState<Array<any>>([]);
  const [SiteId, setSiteId] = useState<number | null>(0);
    const [equipmentIdlist, setEquipmentlist] =useState<Array<any>>([]);

  const queries = [
    {
      queryKey: EIRASAAS_API_QUERIES.GET_TICKET_TYPE,
      api: EirasaasAPIs.FetchTicketType,
      setState: setTicketTypes,
      id: session.userId,
    },
    {
      queryKey: TicketconfigQueries.GET_TICKET_COCUNT_USERID,
      api: TicketconfigServices.fetchgetallTicketlistcocunt,
      setState: setTicketchart,
      id: session.userId,
    },
    {
      queryKey: EIRASAAS_API_QUERIES.GET_ALL_TICKET_CATEGORY,
      api: EirasaasAPIs.FetchAllcategory,
      setState: setTicketCategory,
    },
    {
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
     {
      queryKey: EIRASAAS_API_QUERIES.GET_ALL_EQUIPMENT_LIST,
      api: EirasaasAPIs.FetchAllEquipmentlistbysiteId,
      setState: setEquipmentlist,
      id: SiteId,
    },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);

  const TicketconfigQuery = useTicketconfig(session);
  // const Ticketdata = useMemo(
  //   () =>
  //     (TicketconfigQuery.data ?? []).sort(
  //       (a: any, b: any) =>
  //         new Date(b.lastUpdatedDate).getTime() -
  //         new Date(a.lastUpdatedDate).getTime(),
  //     ),
  //   [TicketconfigQuery.data],
  // );

  useEffect(() => {
    if (TicketconfigQuery.data) {
      const sortedData = [...TicketconfigQuery.data].sort(
        (a: any, b: any) =>
          new Date(b.lastUpdatedDate).getTime() -
          new Date(a.lastUpdatedDate).getTime(),
      );

      setTicketDataState(sortedData);
    }
  }, [TicketconfigQuery.data]);
  const postTicketlistMutation = useMutationFn(
    TicketconfigServices.TicketFilterlist,
    null,
  );
  const postTicketchartMutation = useMutationFn(
    TicketconfigServices.TicketFilterchart,
    null,
  );
  const postTicketMutation = useMutationFn(
    TicketconfigServices.TicketCreation,
  TicketconfigQueries.GET_TICKET_COCUNT_USERID,
  );
  const putMutation = useMutationFn(
   TicketconfigServices.UpdateTicketconfigById,
  TicketconfigQueries.GET_TICKET_COCUNT_USERID,
  );
  const HeadCells = [
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
    {
      label: 'Ticket Type',
      id: 'ticketTypeName',
      view: true,
      default: false,
    },
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
    {
      label: 'Created By',
      id: 'userName',
      view: true,
      default: false,
    },
    {
      label: 'Created Date',
      id: 'createdDate',
      view: false,
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
      label: 'Subject',
      id: 'subject',
      view: true,
      default: false,
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
  const defaultValues = {
    siteName: '',
    displayName: '',
    ticketTypeName: '',
    categoryName: '',
    ticketTypeId: 0,
    subject: '',
    priority: '',
    description: '',
    equipmentId: [],
    ticketCategory: 0,
    cycle: 0,
    createdBy: 0,ticketId:0,fromDate:'',toDate:'',filterType:''
  };
  const clickableColumnList: Array<string> = ['documentName'];
  const [formFields, setFormFields] = useState<ticketFiledType>(defaultValues);
  
  const fields: Array<Field> = [
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'select',
      disabled:edit,
      placeholder: 'Enter Site Name',
       onChange: (name, value, form) => {
        form.setFieldValue(name, value);
        const selectSiteId = Sitelist.find(
          (type) => type.siteName === value,
        )?.siteId;
        setSiteId(selectSiteId);
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
      name: 'displayName',
      label: 'Equipment Name',
      type: 'multiSelect',
       disabled:edit,
      placeholder: 'Enter Equipment Name',
      required: true,
       styles: {
    wrapper: 'flex flex-col gap-1 w-full',
    label: 'text-sm font-medium text-gray-500',
    input:
      'w-full h-11 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300',
  },
    },
    {
      name: 'ticketType',
      label: 'Ticket Type', disabled:edit,
      type: 'select',
      placeholder: 'Enter Ticket Type',
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
      type: 'select', disabled:edit,
      placeholder: 'Enter Ticket Category',
      required: true,
         styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'subject',
      label: 'Subject',
      type: 'text',
      placeholder: 'Enter Subject',
      required: true,
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
      placeholder: 'Enter Priority',
      required: true,
       styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'cycle',
      label: 'Cycle',
      type: 'select',
      placeholder: 'Enter Cycle',
      required: false,
       styles: {
    wrapper: 'flex flex-col gap-1 w-full',
    label: 'text-sm font-medium text-gray-500',
    input:
      'w-full h-11 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300',
  },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Enter Description',
      required: true,
      styles: {
    wrapper: 'flex flex-col gap-1 w-full',
    label: 'text-sm font-medium text-gray-500',
    input:
      'w-full h-11 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-300',
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
    {
      name: 'statusName',
      label: 'Ticket State',
      type: 'select',
      placeholder: 'Ticket State',
      required: false,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
  const formStyles = {
    container:
      'fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm p-2',

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

    cancelButton: `
    h-11
    px-8 
    rounded-xl
    border
    border-gray-300
    bg-white
    hover:bg-gray-100
    text-gray-700
    font-semibold
    transition-all
    duration-200
  `,
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
   const handleReset = () => {
    // setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
    // setEdit(false);
  };
  const options = {
    basedOn: ['Created Date', 'Scheduled On'],
    ticketType: ticketTypes.map((type) => type.ticketTypeName),
    ticketCategory: ticketCategory.map((category) => category.categoryName),
    Category: ticketCategory.map((category) => category.categoryName),
    priority: ['High', 'Medium', 'Low'],
     cycle: ['N/A', '1', '2','3','4','5'],
    assigned: userlist.map((type) => type.userName),
    siteName: Sitelist.map((site) => site.siteName),
    displayName:equipmentIdlist.map((equip)=>equip.displayName),
    statusName: ticketstate.map((state) => state.statusName),
  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      setSiteId(row?.siteId)
    
      const data = {
      ticketType:row?. ticketTypeName,
     ticketCategory:row?.categoryName,
        ...row,
      };
      setFormFields(data);
      setIsOpen(true);
      setEdit(true);
    }
  }
  const includedDownloadColumns = HeadCells.filter(
    (headcell) => headcell.view === true,
  ).map((headcell) => headcell.id);
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
          setTicketDataState(e);

          setToBackend(false);
        },
      }));
    postTicketchartMutation.mutate(data, {
      onSuccess: (e: any) => {
        setTicketchart(e);

        setToBackend(false);
      },
    });
  }
    function onSubmitdata(data: any) {
    setToBackend(true);
    ((data.equipmentId = equipmentIdlist.filter((site: any) =>
      data.displayName.includes(site.displayName),
    ).map((site: any) => site.equipmentId)),
       (data.siteId = Sitelist.find(
        (head: any) => head.siteName === data.siteName,
      )?.siteId),
      (data.ticketCategory = ticketCategory.find(
        (head: any) => head.categoryName === data.ticketCategory,
      )?.categoryId),
        (data.createdBy = session.userId),
      (data.priority =
        data.priority === 'High'
          ? 3
          : data.priority === 'Medium'
            ? 2
            : data.priority === 'Low'
              ? 1
              : undefined),
     
      postTicketMutation.mutate(data,{
          onSuccess: () => {
                setToBackend(false);
            toast.success('Ticket Created successfully!');
            handleClose();
            setFormFields(defaultValues);
          },
          onError: (error: any) => {
                setToBackend(false);
            const errors=error.response.data.error
            if (errors?.includes('unique_po_number')) {
      toast.error('PO number already exists. Document already uploaded for this PO.');
    }else{
      toast.error(error.message);
    }
          },
        }));
   
  }

  function onUpdate(data: any) {
   ((data.equipmentId = equipmentIdlist.filter((site: any) =>
      data.displayName.includes(site.displayName),
    ).map((site: any) => site.equipmentId)),
       (data.siteId = Sitelist.find(
        (head: any) => head.siteName === data.siteName,
      )?.siteId),
      (data.ticketCategory = ticketCategory.find(
        (head: any) => head.categoryName === data.ticketCategory,
      )?.categoryId),
        (data.createdBy = session.userId),
      (data.priority =
        data.priority === 'High'
          ? 3
          : data.priority === 'Medium'
            ? 2
            : data.priority === 'Low'
              ? 1
              : undefined),
        putMutation.mutate(data, {
          onSuccess: () => {
            toast.success('Site mapped to Cost Centre successfully!');
            handleClose();
            setFormFields(defaultValues);
          },
          onError: (error: any) => {
            const errors=error.response.data.error
            if (errors?.includes('unique_po_number')) {
      toast.error('PO number already exists. Document already uploaded for this PO.');
    }else{
      toast.error(error.message);
    }
          },
        }));
  }

  // ----- TABS STATE -----

  return (
    <div className="m-2.5">
      {/* {TicketconfigQuery.isLoading ||
          status.some((item) => item === 'pending') ? (
            <Loader />
          ) : ( */}
      <section className="w-full h-full flex flex-col">
        <>
          <CustomTable
            headcells={HeadCells}
            rows={ticketDataState}
            pageName={'Ticket Configuration'}
            hide={{
              add: false,
              filter: false,
              hidden: false,
              download: false,
            }}
            onSubmit={onSubmit}
            submitFunction={onSubmit}
            field={fielddata}
            option={options}
            dataChart={ticketchart}
            labels={'Ticket Config'}
            toBackend={toBackend}
            access={{
              hasCreateAccess: true,
              hasUpdateAccess: hasUpdateAccess,
            }}
            functions={{
              addFn: handleOpen,
              optionHandler: (option: any, row: any) =>
                handleOptionClick(option, row),
            }}
            clickableColumn={clickableColumnList}
            includedDownloadColumns={includedDownloadColumns}
          />
        </>

        {/* COST HEADER TAB */}
      </section>
      {/* // )} */}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal open={isOpen} onClose={handleClose}>
            <TicketcreateForm
              initialValues={formFields}
              submitFunction={(data) =>
                edit ? onUpdate(data) : onSubmitdata(data)
              }
              onClose={handleClose}
              onReset={handleReset}
              fields={fields}
              options={options}
              buttonLabel={edit?'Update':'Create'}
              optionalbuttonLabel={'Reset'}
              styles={formStyles}
              label={'Add New Ticket'}
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
