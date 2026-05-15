import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { CostHeaderPage } from '../costHeader/costHeader';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import type { JSX } from 'react';
import type {
  BaseProps,
  countryDropdownType,
  stateDropdownType,
} from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import {
  UserQueries,
  userServices,
} from '@/integrations/Services/userconfigService';

import Loader from '@/utils/common/components/loader';

interface PoloaProps extends BaseProps {}
export const UserConfig = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: PoloaProps): JSX.Element => {
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
 const [tabsValue, setTabsValue] = useState<'Active' | 'Inactive'>('Active');
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [country, setCountry] = useState<Array<countryDropdownType>>([]);
  const [state, setState] = useState<Array<stateDropdownType>>([]);
  const [role, setRole] = useState<Array<any>>([]);
  const [countryId, setCountryId] = useState<number>(0);
  const queries = [
         {
      queryKey: UserQueries.GET_ALL_COUNTRIE,
      api: userServices.fetchgetcountry,
          setState:setCountry,
    },
      {
          queryKey: UserQueries.GET_ALL_USER_ROLE,
      api: userServices.fetchgetuserrole,
          setState: setRole,
          id: session.organizationId
        },
    {
      queryKey: UserQueries.GET_ALL_STATE,
      api: userServices.fetchgetstate,
          setState:setState,
    },
    {
      queryKey: UserQueries.GET_ALL,
      api: userServices.fetchgetallUser,
          setState: (data: any) => {
  console.log(data);
  
        
     const finalData = data.map((item: any) => ({
      
    ...item,
 status: item.status === 1 ? 'Active' : 'Inactive',
  }));

        setTableValue(finalData);
      },
    },

 
  ];
  const {
    data: [dependentResponse],
    status,
    isLoading,
  } = useQueriesFn(queries);

  enum METHOD {
    GET_ALL = 'GET_ALL',
  }

  const postMutation = useMutationFn(
    userServices.AddNewUser,
    UserQueries.GET_ALL,
  );
  const putMutation = useMutationFn(
    userServices.UpdateUseraById,
    UserQueries.GET_ALL,
  );

  const HeadCells = [
    {
      id: 'firstName',
      label: 'First Name',
      view: true,
      filterable: true,
    },
    {
      id: 'lastName',
      label: 'Last Name',
      view: true,
      filterable: true,
    },
    {
      id: 'emailId',
      label: 'Email Id',
      view: true,
      filterable: true,
    },
    {
      id: 'mobileNo',
      label: 'Mobile No',
      view: true,
      filterable: true,
    },
    {
      id: 'city',
      label: 'City',
      view: true,
      filterable: true,
    },
    {
      id: 'country',
      label: 'Country',
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: country.map((item) => item.countryName),
    },
    {
      id: 'state',
      label: 'State',
      view: true,
      filterable: true,
      fiterType:'select',
      filterOptions: state.map((item) => item.stateName)
    },
    {
      id: 'postalCode',
      label: 'Postal Code',
      view: true,
      filterable: true,
    },
     {
      id: 'roleName',
      label: 'Role',
      view: true,
      filterable: true,
    },
    {
      id: 'status',
      label: 'Status',
      view: true,
      filterable: true,
      filterType: 'select',
       filterOptions: ['Active', 'Inactive'],
    },
    { id: 'action', label: 'Action', view: true, filterable: false },
  ];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  
  const defaultValues = {
    firstName: '',
    lastName: '',
    emailId: '',
    mobileNo: '',
    city: '',
    state: '',
    country: '',
    postalCode:0,
    status: 0,
    role:''
  };
  const clickableColumnList: Array<string> = ['documentName'];
  const [formFields, setFormFields] = useState<UserconfigType>(defaultValues);
  const fields: Array<Field> = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter First Name',
      required: true,
      // disabled: edit || toBackend,
      onChange: (_name: string, value: any, form: any) => {
        setCountryId(value);
        form.setFieldValue('vendorName', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter Last Name',
      //   disabled: true,
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
      label: 'Email Id',
      type: 'text',
      onChange: (name: string, value: any, form: any) => {
        console.log(value);

        setFormFields({ ...formFields, 'emailId': value });
        form.setFieldValue('uploadType', value);
      },
      required: true,
      placeholder: 'Enter Email Id',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'mobileNo',
      label: 'Mobile Number',
      type: 'number',
      placeholder: 'Enter Mobile Number',
      onChange: (name: string, value: any, form: any) => {
        //     form.setFieldValue('uploadType', value);
        setFormFields({ ...formFields, 'mobileNo': value });
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
      name: 'city',
      label: 'City',
      type: 'text',
      required: false,

      onChange: (name: string, value: any, form: any) => {
        setFormFields({ ...formFields, 'city': value });
      },
      placeholder: 'Select City',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'country',
      label: 'Country',
      type: 'select',
      // placeholder: 'Select Country',
      required: false,
      onChange: (name: string, value: any, form: any) => {
        form.setFieldValue(name, value); // ✅ important
        setFormFields({ ...formFields, country: value });
         // optional
         const selectedCountry = country.find((item) => item.countryName === value)?.countryId;
         setCountryId(Number(selectedCountry));
      },

      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    {
      name: 'state',
      label: 'State',
      type: 'select',
      placeholder: 'Select State',
      required: false,
      disabled: !countryId,
      onChange: (name: string, value: any, form: any) => {
        form.setFieldValue(name, value); // ✅ important
        setFormFields({ ...formFields, state: value });
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
        {
      name: 'role',
      label: 'Role',
      type: 'select',
      placeholder: 'Select Role',
      required: false,
       onChange: (name: string, value: any, form: any) => {
    form.setFieldValue(name, value); // ✅ important
    setFormFields({ ...formFields, role: value }); 
  },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'postalCode',
      label: 'Postal Code',
      type: 'text',
      placeholder: 'Enter Postal Code',
      required: false,
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
      // placeholder: 'Select Status',
      required: false,
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
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
    setEdit(false);
    setCountryId(0);
  };
  const options = {
   status: ['Active', 'Inactive' ],
    country: country.map((item) => item.countryName),
    state: state.map((item) => item.stateName),
  };
  const handleOpen = () => {
    setEdit(false);
    setIsOpen(true);
  };
 const options = {
  status: ['Active', 'Inactive'],
  country: country.map((item) => item.countryName),
  state: state.map((item) => item.stateName),
  role: role.map((item) => item.roleName),
};
  function handleOptionClick(option: string, row: any) {
    console.log(row,'rowww');   
    if (option === 'Edit') {
      const data = {
        ...row,
      
        vendorName: row.vendorCode,
        selectedVendorName: row.vendorName,
      };
      setFormFields(data);
      setCountryId(row.countryId);
      setStateId(row.stateId);

      setIsOpen(true);
      setEdit(true);
    }
  }
  const includedDownloadColumns = HeadCells.filter(
    (headcell) => headcell.view === true,
  ).map((headcell) => headcell.id);
  function onSubmit(data: any) {
    setToBackend(true);
    const roleId = role.find((item) => item.roleName === data.role)?.roleId || null;
     (data.organizationId = session.organizationId),
 (data.status = data.status === 'Active' ? 1 : 0),
  (data.roleId = roleId)
    postMutation.mutate(data, {
      onSuccess: () => {
        toast.success('User created successfully!');
        handleClose();
        setFormFields(defaultValues);
        setToBackend(false);
      },
      onError: (error: any) => {
        setToBackend(false);
        console.log(error,'test');
        
        const errors = error.response.data;
        
        
        if (errors?.includes('Email already exists')) {
          toast.error(
            'Email already exists. Please use a different email.',
          );
        } else {
          toast.error(error.message);
        }
      },
    });
  }

  function onUpdate(data: any) {
      const roleId = role.find((item) => item.roleName === data.role)?.roleId || null;
     (data.status = data.status === 'Active' ? 1 : 0),
      (data.organizationId = session.organizationId),
      (data.roleId = roleId),
    putMutation.mutate(data, {
      onSuccess: () => {
        toast.success('User Updated successfully!');
        handleClose();
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        setToBackend(false);
        console.log(error,'test');
        
        const errors = error.response.data;
        
        
        if (errors?.includes('Email already exists')) {
          toast.error(
            'Email already exists. Please use a different email.',
          );
        } else {
          toast.error(error.message);
        }
      },
    });
  }

  // ----- TABS STATE -----
const tabledata = tableValue.filter((item) =>
    tabsValue === 'Active' ? item.status?.toUpperCase() === 'ACTIVE' : item.status?.toUpperCase() === 'INACTIVE',
     
  );

  return (
    <div className="m-2.5">
      {isLoading || status.some((item) => item === 'pending') ? (
        <Loader />
      ) : (
        <section className="w-full h-full flex flex-col">
          <>
           <Tabs
                  value={tabsValue}
                  onValueChange={setTabsValue}
                  className="self-end"
                >
                  <TabsList className="flex gap-2">
                    <TabsTrigger value="Active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>
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
               label={edit ? 'Update User' : 'Create New User'}
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
