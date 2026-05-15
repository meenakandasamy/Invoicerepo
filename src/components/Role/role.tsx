import { useState } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import { CustomForm } from '../form/customForm';
import type { Field } from '@/types/form';
import type { JSX } from 'react/jsx-runtime';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type { RoleDTO, RoleUpdateDTO } from '@/models/RoleDTO';
import type { QueryConfig } from '@/utils/common/queryUtils';
import { useMutationFn, useQueriesFn } from '@/utils/common/queryUtils';
import { CustomTable } from '@/components/table/customTable';
import Loader from '@/utils/common/components/loader';
import {
  AddNewRole,
  FetchActivity,
  FetchAllRole,
  RoleQuery,
  UpdateRoleById,
  
} from '@/integrations/Services/roleService';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';

interface RoleProps extends BaseProps {}
export default function Role (props: RoleProps): JSX.Element {
  interface Activitydata {
    activityId: number;
    activityName: string;
    status?: number;
  }

  const headCells: Array<HeadCell> = [
    {
      id: 'roleName',
      label: 'Role',
      defaultView: true,
      filterable: true,
      view: true,
    },
    {
      id: 'description',
      label: 'Description',
      filterable: true,
      defaultView: true,
      view: true,
    },
    {
      id: 'createdDate',
      label: 'Created Date',
      defaultView: true,
      view: true,
    },
    {
      id: 'lastUpdatedDate',
      label: 'Last Updated Date',
      defaultView: true,
      view: true,
    },
    {
      id: 'status',
      label: 'Status',
      filterable: true,
      filterType: 'select',
      filterOptions: ['Active', 'Inactive'],
      defaultView: true,
      view: true,
    },
    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
    },
  ];

  const { hasCreateAccess, hasUpdateAccess, session } = props;
  // console.log(formFields);
  const [tabsValue, setTabsValue] = useState<'Active' | 'Inactive'>('Active');
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
    const [role, setRole] = useState<boolean>(false);
  const [activity, setAllActivity] = useState<Array<Activitydata>>([]);

  const defaultActivity = [
    'userRole',
    'vendorProduct',
    'vendors',
    'purchaseOrder',
    'dashboard',
    'requestor',
    'approvalDashboard',
    'poInstallment',
    'paymentTerms',
    'approverConfiguration',
    'approvalMapping',
  ];
  const defaultPermissions = {
    create: 0,
    edit: 0,
    view: 0,
  };
  const generateActivityMap = () => {
    return defaultActivity.reduce((acc, name) => {
      acc[name] = { ...defaultPermissions };
      return acc;
    }, {});
  };
  const defaultValues = {
    roleName: '',
    description: '',
    status: 'Active',
    activityMap: generateActivityMap(),
  };

  const [formFields, setFormFields] = useState(defaultValues);


  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  async function optimizedFetchRole() {
const ord = sessionStorage.getItem('organizationId');
   console.log(ord);
    
    try {
      const response = await FetchAllRole(ord);
      const manipulatedRows = response.map((row: any) => ({
        ...row,
        status: row.status === 1 ? 'Active' : 'Inactive',
      }));
      return manipulatedRows;
    } catch (error) {
      console.error(error);
    }
  }
  const { isLoading, isError } = useQueriesFn([
   
  ]);
  const queries = [
   {
      queryKey: RoleQuery.GET_ALL_ROLE,
      api: optimizedFetchRole,
      setState: setTableValue,
      id:session.organizationId
    },
   
    {
      queryKey: RoleQuery.GET_ALL_ACTIVITY,
      api: FetchActivity,
      setState: setAllActivity,
    },
   ];
   const {
     data: [dependentResponse],
     status,
   } = useQueriesFn(queries);

  const putMutation = useMutationFn(UpdateRoleById, RoleQuery.GET_ALL_ROLE);
  const postMutation = useMutationFn(AddNewRole, RoleQuery.GET_ALL_ROLE);
  //  const deleteMutation = useMutationFn(DeleteRoleId, RoleQuery.GET_ALL_ROLE);

  function onSubmit(data: RoleDTO): void {
    const currentDate = new Date().toISOString();
    console.log(data);
    console.log(activity);
    
   const userMap = activity.map((activityInfo) => {
  const activityData =
    data.activityMap[activityInfo.activityName] || {};

  return {
    createdDate: currentDate,
    lastUpdatedDate: currentDate,
    activityId: activityInfo.activityId,
    status: 1,
    organizationId: session.organizationId,
    create: activityData.create || 0,
    edit: activityData.edit || 0,
    view: activityData.view || 0,
    activityName: activityInfo.activityName,
  };
});
    const payload = {
      roleName: data.roleName.trim(),
      description: data.description,
      status: 1,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      userMap,
    };
    console.log(payload);
    
    postMutation.mutate(
      { role: payload },
      {
        onSuccess: () => {
          toast.success('Role added successfully!');
          setIsOpen(false);
          setFormFields(defaultValues);
        },
        onError: (error: any) => {
          toast.error(`Failed to add Role: ${error.message || error}`);
          setFormFields(defaultValues);
        },
      },
    );
  }

  function onUpdate(data: RoleUpdateDTO): void {
    console.log(data,"data");
    
    const currentDate = new Date().toISOString();
    switch (data.status) {
      case 'Active':
      case 1:
        data.status = 1;
        break;
      case 'Inactive':
      case 0:
        data.status = 0;
        break;
      default:
        data.status = 1;
        break;
    }
      const userMap = activity.map((activityInfo) => {
  const activityData =
    data.activityMap[activityInfo.activityName] || {};

  return {
    createdDate: currentDate,
    lastUpdatedDate: currentDate,
    activityId: activityInfo.activityId,
    status: 1,
    organizationId: session.organizationId,
    create: activityData.create || 0,
    edit: activityData.edit || 0,
    view: activityData.view || 0,
    activityName: activityInfo.activityName,
  };
});

    const payload = {
      roleId: data.roleId,
      roleName: data.roleName,
      description: data.description,
      status: data.status,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      userMap,
    };
    console.log('payloapayloadd', payload);

    putMutation.mutate(
      { roleId: data.roleId?.toString() || '', role: payload },
      {
        onSuccess: () => {
          toast.success('Role updated successfully!');
          setIsOpen(false);
          setFormFields(defaultValues);
        },
        onError: (error: any) => {
          toast.error(`Failed to update Role: ${error.message || error}`);
          setFormFields(defaultValues);
        },
      },
    );
  }


  const fields: Array<Field> = [
    {
      name: 'roleName',
      label: 'Role',
      type: 'text',
      placeholder: 'Role Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1 w-full',
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
        wrapper: 'flex flex-col gap-1 w-full',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'status',
      disabled: !edit,
      styles: {
        wrapper: 'flex flex-col gap-1 w-full',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'activityMap',
      label: 'Activity',
      type: 'activityMap',
      placeholder: 'Activity',
      styles: {},
      onChange: (activityName: any, header: string) => {
        setFormFields({ ...formFields, [header]: activityName });
      },
      activityArr: activity.map((act) => act.activityName),
    },
  ];
 
  const options = {
    status: ['Active', 'Inactive'],
    activities: ['Activities', 'View', 'Create', 'Edit'],
  };
  console.log(tableValue);
  console.log(tabsValue);
  
const tabledata = tableValue.filter((item) =>
    tabsValue === 'Active' ? item.status?.toUpperCase() === 'ACTIVE' : item.status?.toUpperCase() === 'INACTIVE',
     
  );
  console.log(tabledata);
  
  const formStyles = {
    grid: 'grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full dark:text[var(--foreground)]',
    label:
      'text-sm font-bold text-black dark:text-[var(--foreground)]  mb-1 font-size: 14px',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto ',
    form: 'w-[60%] md:w-[50%] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] max-h-[85vh] overflow-auto',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white',
  };

  const handleOpen = () => {
    setEdit(false);
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    setEdit(false);
    setFormFields(defaultValues);
    // setroleDeleteId(null);
    // setShowDeleteConfirm(false);
  };

  // const handleConfirmDelete = () => {
  //   console.log(roleDeleteId);

  //   if (roleDeleteId) {
  //     deleteMutation.mutate(
  //       { roleId: roleDeleteId },
  //       {
  //         onSuccess: () => toast.success('Role deleted successfully!'),
  //         onError: (error: any) =>
  //           toast.error(`Failed to delete Role: ${error.message || error}`),
  //         onSettled: () => {
  //           setroleDeleteId(null);
  //           setShowDeleteConfirm(false);
  //         },
  //       },
  //     );
  //   }
  // };
  function handleOptionClick(option: string, row: Row) {
    const activityMap = row.usermap.reduce(
      (acc: Record<string, any>, item: any) => {
        const { activityName, create, edit, view } = item;
        acc[activityName] = { create, edit, view };
        return acc;
      },
      {},
    );

    const modifiedRow = {
      ...row,
      activityMap,
    };
    setFormFields(modifiedRow);
    setIsOpen(true);
    setEdit(true);
    console.log('Transformed permission map:', modifiedRow);
    0;
  }

  // function handleOptionClick(option: string, row: Row) {
  //   const userMap = row.usermap; // Assuming it's an object

  //   const activityMap = Object.keys(userMap).reduce(
  //     (acc, key) => {
  //       acc['activityMap'] = {
  //         create: 0,
  //         edit: 0,
  //         view: 0,
  //       };
  //       return acc;
  //     },
  //     {} as Record<string, { create: number; edit: number; view: number }>,
  //   );

  //   const modifedRow = {
  //     ...row,
  //     activityMap: row.usermap.map((key: string) => ({
  //       [key.activityName]: row.usermap[key],
  //     })),
  //   };
  //   row.usermap.map((key: string) => {
  //     console.log(key, key['activityName'], 'kesy');
  //   });
  //   console.log('Transformed permission map:', userMap);

  //   if (option === 'Delete') {
  //     // setroleDeleteId(row.roleId?.toString() || null);
  //     // setFormFields(permissionMap);
  //     // setShowDeleteConfirm(true);
  //   } else if (option === 'Edit') {
  //     // setFormFields(modifedRow);
  //     setIsOpen(true);
  //     setEdit(true);
  //   }
  // }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };

  return (
    <div className="m-2.5">
      {isLoading ? (
        <Loader />
      ) : isError ? (
        toast.error('Failed to load vendors!')
      ) : (
          <section className="w-full h-full flex flex-col">
                {/* Tabs header */}
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
          headcells={headCells}
          rows={tabledata}
          pageName="roles"
          functions={allFunctions}
          access={{
            hasCreateAccess: true,
            hasUpdateAccess: true,
          }}
          hide={{
            add: !hasCreateAccess,
            filter: false,
            hidden: false,
            download: false,
          }}
        />
        </section>
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
                edit ? onUpdate(data) : onSubmit(data)
              }
              onClose={handleClose}
              fields={fields}
              options={options}
              styles={formStyles}
              label={edit ? 'Update Role' : 'Create New Role'}
              buttonLabel={edit ? 'Update' : 'Create'}
            />
          </Modal>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete Product ${formFields.roleName}?`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      /> */}
    </div>
  );
}
