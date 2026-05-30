import { useState } from 'react';
import { toast } from 'sonner';
import {
  createFileRoute,
  useRouteContext,
  useSearch,
} from '@tanstack/react-router';
import { Modal } from '@mui/material';
import type { Field } from '@/types/form';
import { useMutationFn,useQueriesFn } from '@/utils/common/queryUtils';
import {
  TicketconfigQueries,
  TicketconfigServices,
  
} from '@/integrations/Services/TicketconfigServices';
import { TicketcreateForm } from '@/components/form/ticketcreateFrom';
import { Card, CardContent } from '@/components/ui/card';
import {CustomToolbar} from '@/components/table/customToolBar'
import TicketDetailsCard from '@/components/Ticketoverview/Ticketdetailscard'
import { Decrypt } from '@/utils/auth/encryptor';
import TicketActivityTable from '@/components/Ticketoverview/Tickettable'

export const Route = createFileRoute(
  '/ticket_expenditure/_wrapper/ticket_overview',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const search = useSearch({
    from: '/ticket_expenditure/_wrapper/ticket_overview',
  });

  const { hasCreateAccess, hasUpdateAccess, session } = useRouteContext({
    from: '/ticket_expenditure/_wrapper/ticket_overview',
  });
  const putMutation = useMutationFn(
   TicketconfigServices.UpdateTicketreassign,
  TicketconfigQueries.GET_TICKET_DETAILS,
  //  TicketconfigQueries.GET_TICKET_DETAILS,
  );
  const putholdMutation = useMutationFn(
   TicketconfigServices.UpdateTickethold,
  TicketconfigQueries.GET_TICKET_DETAILS,
  //  TicketconfigQueries.GET_TICKET_DETAILS,
  );
  const defaultValues = {
    date: '',
    assigned: '',
    timeslot: '00:00',
    remarks: '',
 
  };
  const decryptedUrl = Decrypt({
    encryptedString: search.ticketKey,
    key: import.meta.env.VITE_AES_SECRET_KEY,
    iv: import.meta.env.VITE_AES_IV,
  });
  const urlResponse = JSON.parse(decryptedUrl);

  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectdata,setSelectdata]= useState<string>('');
    const [formFields, setFormFields] = useState<viewticketFiledType>(defaultValues);
  const [ticketHistory, setTickethistory] = useState<Array<any>>([]);
  const [userlist, setUserlist] = useState<Array<any>>([])
  const [ticketdetails, setTicketdetails] = useState<Array<any>>([]);
    const [edit, setEdit] = useState<boolean>(false);
    const [toBackend, setToBackend] = useState<boolean>(false);
    const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
    setEdit(false);
  };
  console.log(selectdata);
  
  const queries = [
    {
    queryKey: TicketconfigQueries.GET_TICKET_DETAILS,
      api: TicketconfigServices.fetchgetallTicketdetails,
      setState: setTicketdetails,
      id: urlResponse?.ticketId,
    },
    {
     
            queryKey: TicketconfigQueries.GET_TICKET_HISTORY,
      api: TicketconfigServices.fetchgetallTicketHistory,
      setState: setTickethistory,
      id: urlResponse?.ticketId,
    },
       {
     
            queryKey: TicketconfigQueries.GET_TICKET_USERLIST,
      api: TicketconfigServices.fetchgetallTicketuserlist,
      setState: setUserlist,
      id: urlResponse?.siteId,
    },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);
  const fields: Array<Field> =
  selectdata === 'reassign'
    ? [
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          placeholder: 'Date',
          required: true,
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
        {
          name: 'assigned',
          label: 'Assigned To',
          type: 'select',
          placeholder: 'Assigned To',
          required: true,
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
        {
          name: 'timeslot',
          label: 'Time Slot',
          type: 'time',
          placeholder: 'Time Slot',
          required: false,
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
        {
          name: 'remarks',
          label: 'Remark',
          type: 'text',
          placeholder: 'Remark',
          required: true,
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
      ]
    : selectdata === 'hold'?[
        {
          name: 'remarks',
          label: 'Remark',
          type: 'text',
          placeholder: 'Remark',
          required: true,
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
      ]:[]
  function handleOpen(data: any) {
    setSelectdata(data)
    setIsOpen(true);
}
 function onSubmitdata(data: any) {
  setToBackend(true);

  if (selectdata === 'reassign') {
    const datas = {
      ...data,
      assignedTo: userlist.find(
        (head: any) => head.userName === data.assigned
      )?.userId,
      scheduleOn:
        new Date(data.date).toISOString().split('T')[0] +
        ' ' +
        data.timeslot,
      ticketId: urlResponse?.ticketId,
      lastUpdatedBy: session.userId,
    };

    putMutation.mutate(datas, {
      onSuccess: () => {
        setToBackend(false);
        toast.success('Ticket Re-Assigned successfully!');
        handleClose();
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        setToBackend(false);
        
       
          toast.error(error.message);
        
      },
    });
  } else if (selectdata === 'hold') {
    const datas = {
      remarks: data.remarks,
      lastUpdatedBy: session.userId,
      ticketId: urlResponse?.ticketId,
    };

    putholdMutation.mutate(datas, {
      onSuccess: () => {
        setToBackend(false);
        toast.success('Ticket put on hold successfully!');
        handleClose();
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        setToBackend(false);
      
          toast.error(error.message);
        
      },
    });
  }
}
  const options = {
    assigned:userlist.map((user)=>user.userName)
  }
    const formStyles = {
    container:
      'fixed inset-0 z-50 flex items-center justify-center p-2',

    form: `
    w-full
  max-w-[400px]
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
  const access={hasCreateAccess:true,hasUpdateAccess:true}
   const hide={
              add: false,
              filter: false,
              hidden: false,
              download: false,
            }
  return  (<div className="p-4 h-6">
    <div className="py-2">
          <Card>
            <CardContent className="flex justify-between h-9">
              {/* <SearchBar
                searchTerm={searchTerm}
                onChange={handleSearch}
                key={pageName + 'search'}

              /> */}
              <div></div>
              <div className="flex items-center gap-4">
                  <CustomToolbar    access={access} 
   
  addFn={(data) => handleOpen(data)}
                  hide={hide}/>
              </div>
            </CardContent>
          </Card>
        </div>

      <TicketDetailsCard
        ticketdetails={ticketdetails}
      />
            <TicketActivityTable
        ticketHistory={ticketHistory}
      />
        {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal open={isOpen}   onClose={handleClose}>
            <TicketcreateForm
              initialValues={formFields}
              submitFunction={(data) =>
                onSubmitdata(data)
              }
              onClose={handleClose}
              
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
    </div>)
}
