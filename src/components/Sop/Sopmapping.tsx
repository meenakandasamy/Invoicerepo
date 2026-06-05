import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import type { JSX } from 'react';
import type { BaseProps} from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';

import {
  useDependentQueriesWithId,
  useMutationFn,
  useQueriesFn,
} from '@/utils/common/queryUtils';
import { usePoloalist } from '@/hooks/data/usePoloalist';
import {
  TicketSopmappingQueries,
  TicketSopmappingServices,
} from '@/integrations/Services/ticketSopmappingServices';
import Loader from '@/utils/common/components/loader';
import { useSopmappinglist } from '@/hooks/data/useSopmappinglist';
import { useSoplist } from '@/hooks/data/useSoplist';
import { TicketcreateForm } from '../form/ticketcreateFrom';

interface PoloaProps extends BaseProps {}
export const Sopmapping = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: PoloaProps): JSX.Element => {
  const sopQuery = useSoplist(session);
      const sopDropdown = useMemo(
    () => sopQuery.data ?? [],
    [sopQuery.data],
  );
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [tabledata,settabledata] = useState<any>([]);
  const queries = [
    {
      queryKey:
        (TicketSopmappingQueries.GET_TICKET_SOPMAPPING) + 'CCM',
      api: TicketSopmappingServices.fetchgetallTicketSopmappig,
      setState: settabledata,
    },
    // {
    //   queryKey: CostCentreQueries.GET_COST_CENTRE_DROPDOWN + 'CCM',
    //   api: CostCentreServices.fetchCostCentreDropdown,
    //   setState: setPouploadlist,
    // },
  ];
  const {
    data: [dependentResponse],
    isLoading,
    status,
  } = useQueriesFn(queries);
   enum METHOD {
    GET_ALL = 'GET_ALL',
  }
  const SopmappingQuery = useSopmappinglist(
    session,
  );
  const allsopmap = useMemo(
    () =>
      (SopmappingQuery.data ?? []).sort(
        (a: any, b: any) =>
          new Date(b.lastUpdatedDate).getTime() -
          new Date(a.lastUpdatedDate).getTime(),
      ),
    [SopmappingQuery.data],
  );
console.log(allsopmap,'allsopmap');
  // const postMutation = useMutationFn(
  //   PoloaServices.AddNewpoloa,
  //   PoloaQueries.GET_ALL,
  // );
  // const putMutation = useMutationFn(
  //   PoloaServices.UpdatePoloaById,
  //   PoloaQueries.GET_ALL,
  // );
  const HeadCells = [
    {
      id: 'templateName',
      label: 'Template Name',
      view: true,
      filterable: true,
    },
    {
      id: 'description',
      label: 'Description',
      view: true,
      filterable: true,
    },
   
    { id: 'action', label: 'Action', view: true, filterable: false },
  ];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const defaultValues = {
    templateName: '',
    sopName: '',
    description: '',
    status: '',
    sopId: '',
  };
  const clickableColumnList: Array<string> = ['documentName'];
  const [formFields, setFormFields] = useState<poloaFieldType>(defaultValues);
  const fields: Array<Field> = [
    {
      name: 'templateName',
      label: 'Template Name',
      type: 'text',
      placeholder: 'Enter Template Name',
      required: true,
        styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
     {
      name: 'sopName',
      label: 'Sop Name',
      type: 'multiSelect',
      placeholder: 'Enter Sop Name',
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
      placeholder: 'Enter Description',
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
      placeholder: 'Enter Status',
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
  // const formStyles = {
  //   pageName: 'Cost centre',
  //   label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
  //   container:
  //     'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
  //   form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
  //   submitButton:
  //     'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-blue-500 dark:text-[var(--primary-foreground)]',
  //   cancelButton:
  //     'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  // };
  const formStyles = {
    container:
      'fixed inset-0 z-50 flex items-center justify-center p-2',

    form: `
    w-full
 max-w-[500px]
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
      'h-10 px-4 rounded-xl bg-violet-600 text-white hover:bg-violet-600 transition',

    cancelButton: `
    border bg-red-500 rounded-xl text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]
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
    // setToBackend(false);
    // setEdit(false);
  };
  const options = {
    uploadType: ['PO', 'LOA'],
    status: ['Active', 'Inactive'],
      sopName: sopDropdown.map((sop) => sop.sopName),
  
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

  return (
    <div className="m-2.5">
       {/* {queries.isLoading ||
          status.some((item) => item === 'pending') ? (
            <Loader />
          ) : ( */}
      <section className="w-full h-full flex flex-col">
        <>
            <CustomTable
              headcells={HeadCells}
              rows={allsopmap}
              pageName={'SOP Mapping'}
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
            <TicketcreateForm
              initialValues={formFields}
              submitFunction={(data) =>
                edit ? onUpdate(data) : onSubmit(data)
              }
              onClose={handleClose}
                 onReset={handleReset}
              fields={fields}
              options={options}
              styles={formStyles}
              label={'Add SOP Mapping'}
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
