import { useEffect, useMemo, useState } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import type { HeadCell, Row } from '@/types/table';
import type { ProductDTO, ProductUpdateDTO } from '@/models/productDTO';
import type { BaseProps } from '@/types/common';
import type { Field } from '@/types/form';
import type { JSX } from 'react/jsx-runtime';
import type { EmployeeDTO,EmployeeUpdateDTO } from '@/models/employeeManagementDTO';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import { CustomTable } from '@/components/table/customTable';
import { CustomForm } from '@/components/form/customForm';
import Loader from '@/utils/common/components/loader';
import {
  EmployeeQueries,
  EmployeeServices,
} from '@/integrations/Services/employeemanagementServices';

interface EmployeeProps extends BaseProps {}
export  function EmployeeManagement(props: EmployeeProps): JSX.Element {

   const { hasCreateAccess, hasUpdateAccess, session } = props;
 
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);



  const [tableValue, setTableValue] = useState<Array<Row>>([]);
    const defaultValues = {
    employeeName: '',
    emailId: '',
    employeeCode:'',
    bankName: '',
    bankBranch: '',
    bankIfscCode:'',
    accountNo:'',
    bankDetailsFilepath:'',
  };

  
   const [formFields, setFormFields] = useState<any>(defaultValues);


  const headCell: Array<HeadCell> = [
   
    {
      id: 'employeeName',
      label: 'Full Name' ,
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: tableValue.map((row: Row) => row.productName),
    },
    {
      id: 'emailId',
      label: 'Email Id',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'text',

    },
    {
      id: 'employeeCode',
      label: 'Employee Code',
      filterable: true,
      defaultView: true,
      view: true,
      filterType: 'text',
         
    },
   {
      id: 'bankName',
      label: 'Bank Name',
          filterType: 'text',
     defaultView:true,
          view:true,
          filterable:true,
    },
    {
      id: 'bankBranch',
      label: 'Bank Branch',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'bankIfscCode',
      label: 'IFSC',
      defaultView: true,
      view: true,
      filterable: true,
    },
      {
      id: 'accountNo',
      label: 'Account No',
      defaultView: true,
      view: true,
      filterable: true,
    },
 
      {
      id: 'documentName',
      label: 'passbook',
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

  const { isLoading, isError } = useQueriesFn([
    {
      queryKey: EmployeeQueries.GET_ALL_EMPLOYEE,
      api: EmployeeServices.fetchgetallemployee,
      setState: (data: any) => {
     const getDocumentName = (url: string | null) => {
  if (!url) return '-';

  const splitKey = 'amazonaws.com/Vendor%20registration/';
  return url.includes(splitKey) ? url.split(splitKey)[1] : url;
};
        
     const finalData = data.map((item: any) => ({
    ...item,
 documentName: getDocumentName(item.bankDetailsFilepath),
  }));


    setTableValue(finalData);
  },
    },
  
  ]);

  const putMutation = useMutationFn(
    EmployeeServices.UpdateEmployeeById,
   EmployeeQueries.GET_ALL_EMPLOYEE,
  );
  const postMutation = useMutationFn(
    EmployeeServices.AddNewemployee,
    EmployeeQueries.GET_ALL_EMPLOYEE,
  );


  function onSubmit(data: EmployeeDTO): void {
    const payload: EmployeeDTO = {
     ...data,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: 1,
    };
    postMutation.mutate(
      { employee: payload },
      {
        onSuccess: () => {
          toast.success('Product added successfully!');
          setIsOpen(false);
          setFormFields(defaultValues); // Reset form fields
        },
        onError: (error: any) => {
          console.log(error);
          
                  const errors=error.response.data
                  console.log(errors);
                  
          if (errors?.includes('Employee Code')) {
    toast.error('Employee Code already exists');
  }else if(errors?.includes('Email')) {
    toast.error('Email already exists');
  }else if(errors?.includes('Account Number')) {
    toast.error('Account Number already exists');
  }else{
    toast.error(error.message);
  }
          // setFormFields(defaultValues);
        },
      },
    );
  }

  function onUpdate(data: EmployeeUpdateDTO): void {

    const payload: EmployeeUpdateDTO = {
      ...data,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      

    };
    console.log('text1', payload);


    putMutation.mutate(
      { employeeId: data.employeeId?.toString() || '',employee: payload },
      {
        onSuccess: () => {
          toast.success('Product updated successfully!');
          setIsOpen(false);
          setFormFields(defaultValues); // Reset form fields
        },
        onError: (error: any) => {
           const errors=error.response.data
                  console.log(errors);
                  
          if (errors?.includes('Employee Code')) {
    toast.error('Employee Code already exists');
  }else if(errors?.includes('Email')) {
    toast.error('Email already exists');
  }else if(errors?.includes('Account Number')) {
    toast.error('Account Number already exists');
  }else{
    toast.error(error.message);
  }
        },
      },
    );
  }

  const fields: Array<Field> = [
    {
      name: 'employeeName',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Full Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
     
    },
    {
      name: 'emailId',
      label:'Email Id',
      type: 'text',
      placeholder: 'Email Id',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
      {  
      name: 'employeeCode',        
      label: 'Employee Code',
      type: 'text',
       required: true,
      placeholder: 'Employee Code',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      placeholder: 'Bank Name',
         required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'bankBranch',
      label: 'Bank Branch',
      type: 'text',
      placeholder: 'Bank Branch',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
 
    {
      name: 'bankIfscCode',
      label: 'IFSC',
      type: 'text',
      placeholder: 'IFSC',
      required: true,
      
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-2 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm whitespace-nowrap placeholder:text-gray-400',
      },
      
    },
 

    {
      name: 'accountNo',
      label: 'Account No',
      type: 'text',
      placeholder: 'Account No',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'bankDetailsFilepath',
      label: 'Passbook (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Passbook',
    required: true,
    hidden:edit,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
 
  ];

  const options = {
  
   
    
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

  const handleOpen = () => {
    setFormFields(defaultValues); // Reset form fields for new entry
    setEdit(false); // Ensure it's in add mode
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    setEdit(false); // Ensure edit mode is off when closing
    setFormFields(defaultValues); // Reset form fields to default
  
  };

  // Function to handle confirmation of delete


  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
     const updatedRow = {
  ...row,
 
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

  const includedDownloadColumns = headCell.filter((headcell) => 
    headcell.view === true)
  .map((headcell) => headcell.id);  
    const clickableColumnList: Array<string> = ['documentName'];
      const handleDownloadDocument = (row: any) => {
        console.log(row);
        
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
  return (
    <div className="m-2.5">
         <section className="w-full h-full flex flex-col">
            
      {isLoading ? (
        <Loader />
      ) : isError ? (
        toast.error('Failed to load products!')
      ) : (
        <CustomTable
          headcells={headCell}
          rows={tableValue}
          functions={allFunctions}
          access={{
            hasCreateAccess: hasCreateAccess,
            hasUpdateAccess: hasUpdateAccess,
          }}
          pageName="Employee"
          hide={{
            add: !hasCreateAccess,
            filter: false,
            hidden: false,
            download: false,
          }}
            clickableColumn={clickableColumnList}
              onClick={(row, headcellId) => {
                if (headcellId === 'documentName') {
                  handleDownloadDocument(row.bankDetailsFilepath);
                }
              }}
            includedDownloadColumns={includedDownloadColumns}
        />
      )}
      </section>
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
              label={edit ? 'Update Employee' : 'Create New Employee'}
              buttonLabel={edit ? 'Update' : 'Submit'}
            />
          </Modal>
        </div>
      )}

     
    </div>
  );
}
