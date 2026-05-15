import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Modal from '@mui/material/Modal';
import { CustomForm } from '../form/customForm';
import { CustomTable } from '../table/customTable';
import type { Field } from '@/types/form';
import type { HeadCell, Row } from '@/types/table';
import type { JSX } from 'react/jsx-runtime';
import type { BaseProps, userDropdownType } from '@/types/common';
import {
  ApproverCreationQuery,
  approvalCreationAPIs,
} from '@/integrations/Services/approverCreationServices';
import {
  // useDependentQueries,
  useMutationFn,
  // useQueriesFn,
} from '@/utils/common/queryUtils';
// import {
//   EIRASAAS_API_QUERIES,
//   EirasaasAPIs,
// } from '@/integrations/Services/commonServices';
// import { formatDate } from '@/utils/common/DateUtil';
// import {
//   CostHeaderQueries,
//   CostHeaderServices,
// } from '@/integrations/Services/costHeaderServices';
// import {
//   CostCentreQueries,
//   CostCentreServices,
// } from '@/integrations/Services/costCentreServices';
// import {
//   ApproverCategoryQueries,
//   ApproverCategoryServices,
// } from '@/integrations/Services/approverCategory';
import Loader from '@/utils/common/components/loader';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useApproverCreation } from '@/hooks/data/useApproverCreation';
import { useApproverCategory } from '@/hooks/data/useApproverCategory';
import { useUserList } from '@/hooks/data/useUserList';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';

interface PaymentTermProps extends BaseProps {}
export default function ApproverCreationPage(
  props: PaymentTermProps,
): JSX.Element {
  const {
    // fetchAllApprovers,
    addNewApprover,
    updateExistApprover,
    // deleteApprover,
  } = approvalCreationAPIs;
  // const { FetchUsersByCompanyId, FetchUsersByCustomerId } = EirasaasAPIs;
  // const { GET_USERS_BY_COMPANY_ID } = EIRASAAS_API_QUERIES;
  const { GETALL_APPROVERS } = ApproverCreationQuery;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [removedApprover, setRemovedApprover] = useState<any>({});
  // const [confirmedRemovers, setConfirmedRemovers] = useState<any>([]);
  const [formHolder, setFormHolder] = useState<any>(null);
  const { hasCreateAccess, hasUpdateAccess, session } = props;
  // interface userDropdownTypes {
  //   userEmailId: string;
  //   userId: number;
  //   firstName: string;
  //   userTypeId: number;
  //   customerId: number;
  //   userTypeName: string;
  //   userName: string;
  // }

  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();
  const ApproverCategoryQuery = useApproverCategory();
  const userQuery = useUserList(session);

  const allLoading =
    CostCenterQuery.isLoading ||
    CostHeaderQuery.isLoading ||
    ApproverCategoryQuery.isLoading ||
    userQuery.isLoading;

  const costHeaderDropdown: Array<costHeaderDropdownTypes> = useMemo(
    () => CostHeaderQuery.data ?? [],
    [CostHeaderQuery.data],
  );
  const costCentreDropdown: Array<costCentreDropdownTypes> = useMemo(
    () => CostCenterQuery.data ?? [],
    [CostCenterQuery.data],
  );
  const approverQuery = useApproverCreation(session);
  const allApprovers = useMemo(() => approverQuery.data ?? [], [approverQuery]);
  const approverCategoryDropdown: Array<approverCategoryDropdownTypes> =
    useMemo(
      () => ApproverCategoryQuery.data ?? [],
      [ApproverCategoryQuery.data],
    );
  const userDropdown: Array<userDropdownType> = useMemo(
    () => userQuery.data ?? [],
    [userQuery.data],
  );

  const headCells: Array<HeadCell> = [
    {
      id: 'categoryName',
      label: 'Category Name',
      view: true,
      defaultView: true,
      filterable: true,
      filterType: 'select',
      filterOptions:approverCategoryDropdown.map((category) => category.categoryName,),
    },
    {
      id: 'costCentreName',
      label: 'Cost Centre',
      view: true,
      defaultView: true,
      filterable: true,
      filterType:"select",
      filterOptions: costCentreDropdown.map((centre) => centre.costCentreName),
    },
    {
      id: 'costHeaderName',
      label: 'Cost Header',
      view: true,
      defaultView: true,
      filterable: true,
      filterType:"select",  
      filterOptions: costHeaderDropdown.map((header) => header.costHeaderName),
    },
    {
      id: 'approverName0',
      label: 'Approver 0',
      view: false,
      defaultView: false,
      filterable: false,
    },
    {
      id: 'approverName1',
      label: 'Approver 1',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      id: 'approverName2',
      label: 'Approver 2',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      id: 'approverName3',
      label: 'Approver 3',
      view: true,
      defaultView: true,
      filterable: true,
    },
    {
      id: 'action',
      label: 'Action',
      view: true,
      defaultView: true,
      filterable: true,
    },
  ];

  const includedDownloadColumns = headCells.filter((headcell) => 
    headcell.view === true)
  .map((headcell) => headcell.id);  

  const [tableValue, setTableValue] = useState(allApprovers);
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [duplicateUsersList, setDuplicateUsersList] = useState<Array<Row>>([]);
  const [isZerothApproverFound, setIsZerothApproverFound] =
    useState<boolean>(false);
  // const [disableIndexList, setDisableIndexList] = useState<boolean>(false);

  useEffect(() => {
    setTableValue(allApprovers);
  }, [allApprovers]);
  const disabledOptions: Array<string> = tableValue.map((item: any) =>
    item?.levelId?.toString(),
  );

  function removeApprover(row: Row, form: any) {
    // if (row.levelId == 1) {
    //   const firstApprover = defaultApprover(1);
    //   setFormFields((prev: any) => ({
    //     ...prev,
    //     approverDetails: [firstApprover],
    //   }));
    //   form.setFieldValue('approverDetails', [firstApprover]);
    // } else {
    const updatedRows =
      row.levelId == 1
        ? [defaultApprover(1)]
        : formFields.approverDetails.filter(
            (item) => item.levelId != row.levelId,
          );
    const updatedBackup = formFields.approverBackup.filter(
      (item) => item.levelId != row.levelId,
    );
    setFormFields((prev: any) => ({
      ...prev,
      approverDetails: updatedRows,
      approverBackup: updatedBackup,
      confirmedRemovers: [...prev.confirmedRemovers, row],
    }));

    form.setFieldValue('approverDetails', updatedRows);
    form.setFieldValue('approverBackup', updatedBackup);
    // }
    // setConfirmedRemovers((prev: any) => [...prev, row]);
  }

  async function deleteApprovers(row) {
    const { approverLevelId } = row;
    if (!approverLevelId) return;
    try {
      const response =
        await approvalCreationAPIs.deleteApprover(approverLevelId);
      toast.success('Approver Removed successfully!');
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  const defaultApprover = (level: number) => ({
    userName: '',
    levelId: String(level),
    emailId: '',
  });

  const existingApprover = (level: number | string, backup: Array<any>) => {
    const found = backup.find((a) => a?.levelId == String(level));

    return {
      userName: found?.userName ?? '',
      levelId: String(level),
      emailId: found?.emailId ?? '',
      approverLevelId: found?.approverLevelId ?? 0,
    };
  };

  const defaultValues = {
    userName: '',
    levelId: '',
    costHeaderIds: [],
    costCentreIds: [],
    costCentreName: '',
    costHeaderName: '',
    categoryId: '',
    categoryName: '',
    // status: 'Active',
    approverDetails: [
      defaultApprover(1),
      defaultApprover(2),
      defaultApprover(3),
    ],
    tabValue: 'All Approvers',
    approverBackup: [
      defaultApprover(1),
      defaultApprover(2),
      defaultApprover(3),
    ],
    confirmedRemovers: [],
  };
  const [formFields, setFormFields] = useState(defaultValues);
  console.log(formFields, 'allApprovers');

  const fields: Array<Field> = [
    {
      name: 'categoryName',
      type: 'select',
      label: 'Category Name',
      placeholder: 'Select Category',
      required: true,
      disabled: edit,
      onChange: (name: string, value: any, form?: any) => {
        handleCostCentreAndHeaderAndCategoryChanges(name, value, form);
      },
      value: formFields.categoryName,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'costCentreName',
      type: 'select',
      label: 'Cost Center ',
      placeholder: 'Select Level',
      required: true,
      disabled: edit,
      onChange: (name: string, value: any, form?: any) => {
        handleCostCentreAndHeaderAndCategoryChanges(name, value, form);
      },
      value: formFields.costCentreName,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'costHeaderName',
      type: 'select',
      label: 'Cost Header ',
      placeholder: 'Select Level',
      required: true,
      disabled: edit,

      onChange: (name: string, value: any, form?: any) => {
        handleCostCentreAndHeaderAndCategoryChanges(name, value, form);
      },
      value: formFields.costHeaderName,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'approverDetails',
      label: 'Approver Details',
      type: 'multiItems',
      // disableIndex: disableIndexList,
      itemFields: [
        {
          name: 'userName',
          label: 'Approver Name',
          type: 'select',
          placeholder: 'Select Approver',
          disabled:
            isZerothApproverFound && formFields.tabValue !== 'All Approvers',
          // onChange: (name: string, value: any, form: any, index?: number) => {
          //   const prevApproverDetails = [formFields.approverDetails];
          //   const prevApproverBackup = [formFields.approverBackup];

          //   const alreadyExistingUser = prevApproverBackup.some(
          //     (item: any, i: number) => i !== index && item.userName === value,
          //   );
          //   if (alreadyExistingUser) {
          //     toast.error('This user has already been selected!');
          //     form.setFieldValue(`approverDetails[${index}].userName`, '');
          //     return;
          //   }

          //   const selectedUserDetails = userDropdown.find(
          //     (user: any) => user.firstName === value,
          //   );

          //   const updatedSelectedUserDetails = {
          //     userName: selectedUserDetails?.firstName ?? '',
          //     userId: selectedUserDetails?.userId ?? '',
          //     emailId: selectedUserDetails?.userEmailId ?? '',
          //     levelId:
          //       formFields.tabValue == '0th Approver'
          //         ? '0'
          //         : (index ? index + 1 : 1).toString(),
          //   };

          //   setFormFields((prev: any) => ({
          //     ...prev,
          //     approverBackup: prev.approverBackup.map(
          //       (item: any, i: number) => {
          //         if (i === index) {
          //           return updatedSelectedUserDetails;
          //         } else {
          //           return item;
          //         }
          //       },
          //     ),
          //   }));

          //   form.setFieldValue(
          //     `approverDetails[${index}].userName`,
          //     updatedSelectedUserDetails.userName,
          //   );
          //   form.setFieldValue(
          //     `approverDetails[${index}].userId`,
          //     updatedSelectedUserDetails.userId,
          //   );
          //   form.setFieldValue(
          //     `approverDetails[${index}].emailId`,
          //     updatedSelectedUserDetails.emailId,
          //   );

          //   // console.log(index, updatedSelectedUserDetails, 'valueTest');
          // },
          onChange: (name: string, value: any, form: any, index?: number) => {
            // console.log(value, form, index, name, 'valueTest');

            setFormFields((prev: any) => {
              const updatedApproverDetails = [...prev.approverDetails];
              const updatedBackup = [...prev.approverBackup]; // permanent storage

              if (name === 'userName') {
                const alreadyExists = prev.approverDetails.some(
                  (item: any, i: number) =>
                    i !== index && item.userName === value,
                );

                if (alreadyExists) {
                  toast.error('This user has already been selected!');
                  form.setFieldValue(`approverDetails[${index}].userName`, '');
                  return prev;
                }

                const userDetails =
                  userDropdown.find(
                    (user: userDropdownType) => user.firstName === value,
                  ) || {};

                const email = userDetails?.userEmailId || '';
                const selectedUserId = userDetails?.userId || '';
                // const existingLevels = updatedApproverDetails
                //   .map((appr) => parseInt(appr.levelId))
                //   .filter((level) => !isNaN(level));
                // const maxLevel =
                //   existingLevels.length > 0 ? Math.max(...existingLevels) : 0;
                // const nextLevel = maxLevel + 1;

                // update active tab approverDetails
                updatedApproverDetails[index] = {
                  ...updatedApproverDetails[index],
                  userName: value,
                  emailId: email,
                  userId: selectedUserId,
                  // levelId: (prev.approverDetails.length + 1).toString(),
                };

                // write the same change to backup based on levelId
                const levelId = updatedApproverDetails[index].levelId;
                const backupIndex = updatedBackup.findIndex(
                  (a: any) => a.levelId === levelId,
                );

                if (backupIndex > -1) {
                  // update existing
                  updatedBackup[backupIndex] = {
                    ...updatedBackup[backupIndex],
                    userName: value,
                    emailId: email,
                    userId: selectedUserId,
                  };
                } else {
                  // if not found, add new
                  updatedBackup.push({
                    levelId,
                    userName: value,
                    emailId: email,
                    userId: selectedUserId,
                  });
                }

                // update form fields
                form.setFieldValue(`approverDetails[${index}].userName`, value);
                form.setFieldValue(`approverDetails[${index}].emailId`, email);
                form.setFieldValue(
                  `approverDetails[${index}].userId`,
                  selectedUserId,
                );
              }

              // return updated state
              return {
                ...prev,
                approverDetails: updatedApproverDetails,
                approverBackup: updatedBackup,
              };
            });
          },
        },
        {
          name: 'emailId',
          label: 'Email Id',
          type: 'text',
          placeholder: 'Enter Email Id',
          disabled: true,
        },
        {
          name: 'levelId',
          type: 'select',
          label: 'Approver Level',
          placeholder: 'Select Level',
          disabled: true,
        },
      ],
      listOfTabs: ['0th Approver', 'All Approvers'],
      defaultTab: 'All Approvers',
      handleTabFn: (tabValue: string, form: any) => {
        const backup = formFields.approverBackup;

        let resetApprovers;

        if (tabValue === '0th Approver') {
          resetApprovers = [existingApprover(0, backup)];
        } else {
          resetApprovers = getDynamicLevelsFromBackup(backup);
        }

        // update active form state only
        setFormFields((prev) => ({
          ...prev,
          approverDetails: resetApprovers,
          tabValue,
        }));

        form.setFieldValue('approverDetails', resetApprovers);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (name: string, value: any, form: any, _, removedItem: any) => {
        // if (removedItem === undefined) {
        //   const newItems = value.filter(
        //     (v) =>
        //       !formFields.approverBackup.some((b) => b.levelId === v.levelId),
        //   );
        //   console.log(
        //     value,
        //     [...formFields.approverBackup, newItems[0]],
        //     newItems[0],
        //     'valueTest',
        //   );
        //   // setFormFields((prev: any) => ({
        //   //   ...prev,
        //   //   approverBackup: [...prev.approverBackup, newItems[0]],
        //   // }));
        // }
        if (removedItem) {
          console.log(removedItem, 'fieldName, updated');
          // removeApprover(removedItem);
          if (removedItem.approverLevelId) {
            setShowDeleteConfirm(true);
            setRemovedApprover(removedItem);
            setFormHolder(form);
          } else {
            removeApprover(removedItem, form);
          }
        }
        // // Get existing approver details
        // const current = form.getFieldValue('approverDetails') || [];
        // // New level = length + 1
        // const newLevel = current.length + 1;
        // // Add new row
        // const updated = [...current, defaultApprover(newLevel)];
        // setFormFields((prev: any) => ({
        //   ...prev,
        //   approverDetails: updated,
        // }));
        // // Update Formik
        // form.setFieldValue('approverDetails', updated);
      },
    },
  ];
  const formStyles = {
    pageName: 'Approver Creation',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[70%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
    grid: 'grid grid-cols-1 sm:grid-cols-3 gap-4  md:gap-6 w-full',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const handleOpen = () => {
    setFormFields(defaultValues); // Reset form fields for new entry
    setEdit(false); // Ensure it's in add mode
    setIsOpen(true);
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEdit(false); // Ensure edit mode is off when closing
    setFormFields(defaultValues); // Reset form fields to default
    setIsZerothApproverFound(false);
    setShowDeleteConfirm(false);
    setRemovedApprover(null);
    setFormHolder(null);
    // setConfirmedRemovers([]);
  };

  function handleConfirmDelete() {
    setShowDeleteConfirm(false);
    // console.log(removedApprover, 'remoedApp');

    removeApprover(removedApprover, formHolder);
  }

  const getDynamicLevelsFromBackup = (backup: Array<any>) => {
    console.log(backup, 'testVal');

    const otherLevels = backup
      .map((a) => Number(a?.levelId))
      .filter((level) => level !== 0)
      .sort((a, b) => a - b);

    return backup.length == 0 ||
      (backup.length == 1 && backup[0]?.levelId == '0')
      ? [defaultApprover(1), defaultApprover(2), defaultApprover(3)]
      : otherLevels.map((level) => existingApprover(level, backup));
  };

  // const deleteMutation = useMutationFn(deleteApprover, GETALL_APPROVERS);
  const handleOptionClick = (option: string, row: any) => {
    if (option === 'Edit') {
      // console.log(row, 'payload,payload');
      const backup = row.approverDetails || [];
      const currentTab = formFields.tabValue || 'All Approvers';

      const approverDetails =
        currentTab === '0th Approver'
          ? [existingApprover(0, backup)]
          : getDynamicLevelsFromBackup(backup);

      setFormFields((prev: any) => ({
        ...prev,
        ...row, // set all row values
        approverBackup: backup, // permanent storage
        approverDetails, // active UI storage
      }));
      // const { status, approverName, ...rest } = row;
      // setFormFields({
      //   ...rest,
      //   status: status === 1 ? 'Active' : 'Inactive',
      //   userName: approverName,
      //   costCentreName: costCentreDropdown
      //     .filter((centre) => row.costCentreIds.includes(centre.costCentreId))
      //     .map((item) => item.costCentreName),
      //   costHeaderName: costHeaderDropdown
      //     .filter((header) => row.costHeaderIds.includes(header.costHeaderId))
      //     .map((item) => item.costHeaderName),
      //   categoryName: approverCategoryDropdown.find(
      //     (category) => row.categoryId === category.categoryId,
      //   )?.categoryName,
      // });
      setIsOpen(true);
      setEdit(true);
    }
  };

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };
  const options: Record<string, Array<string | number>> = {
    status: ['Active', 'Inactive'],
    levelId: ['0', '1', '2', '3', '4', '5'],
    userName: userDropdown
      // .filter(
      //   (user) =>
      //     user.userEmailId.includes('inspire-ce') ||
      //     user.userEmailId.includes('eira'),
      // )
      ?.map((user) => user.userName),
    costCentreName: costCentreDropdown.map((centre) => centre.costCentreName),
    costHeaderName: costHeaderDropdown.map((header) => header.costHeaderName),
    categoryName: approverCategoryDropdown.map(
      (category) => category.categoryName,
    ),
  };
  const label = edit ? 'Edit Approver' : 'Approver Creation';
  const postMutation = useMutationFn(addNewApprover, GETALL_APPROVERS);
  function handleCostCentreAndHeaderAndCategoryChanges(
    name: string,
    value: any,
    form?: any,
  ) {
    // ------------ Resolve IDs based on the changed field ------------
    const costCentreId =
      name === 'costCentreName'
        ? costCentreDropdown
            .filter((i) => i.costCentreName === value)
            .map((i) => i.costCentreId)
        : formFields.costCentreIds;

    const costHeaderId =
      name === 'costHeaderName'
        ? costHeaderDropdown
            .filter((i) => i.costHeaderName === value)
            .map((i) => i.costHeaderId)
        : formFields.costHeaderIds;

    const categoryId =
      name === 'categoryName'
        ? approverCategoryDropdown.find((i) => i.categoryName === value)
            ?.categoryId || null
        : formFields.categoryId;

    // ========== EDIT MODE → ONLY UPDATE FIELD + ID, NOTHING ELSE ==========
    if (edit) {
      setFormFields((prev) => ({
        ...prev,
        [name]: value,
        costCentreIds: costCentreId,
        costHeaderIds: costHeaderId,
        categoryId,
      }));

      form.setFieldValue(name, value);
      form.setFieldValue('costCentreIds', costCentreId);
      form.setFieldValue('costHeaderIds', costHeaderId);
      form.setFieldValue('categoryId', categoryId);

      return; // ⛔ STOP — NO DUPLICATE CHECK IN EDIT MODE
    }

    // ================================================================
    // ========= NORMAL MODE → Duplicate Check Applies Below ===========
    // ================================================================

    const updatedCostCentre =
      name === 'costCentreName' ? value : formFields.costCentreName;

    const updatedCostHeader =
      name === 'costHeaderName' ? value : formFields.costHeaderName;

    const updatedCategory =
      name === 'categoryName' ? value : formFields.categoryName;

    const validToCheck =
      updatedCostCentre && updatedCostHeader && value?.length > 0;

    if (validToCheck) {
      const duplicates =
        isDuplicateApprovers(
          updatedCostCentre,
          updatedCostHeader,
          updatedCategory,
        )[0]?.approverDetails || [];

      if (duplicates.length > 0) {
        toast.warning(
          'Approver already exists for selected Cost Centre, Cost Header, and Category!',
        );

        setDuplicateUsersList(duplicates);

        const updatedApproverBackup = duplicates.map((item) => ({
          userName: item.userName,
          levelId: String(item.levelId),
          emailId: item.emailId,
          approverLevelId: item.approverLevelId,
        }));

        const updatedApproverDetails = duplicates.filter((item: any) => {
          return item.levelId != 0;
        });
        // .map((item) => ({
        //   userName: item.userName,
        //   levelId: String(item.levelId),
        //   emailId: item.emailId,
        //   approverLevelId: item.approverLevelId,
        // }));
        // console.log(
        //   updatedApproverBackup,
        //   updatedApproverDetails,
        //   duplicates,
        //   'updatedApprovers',
        // );

        setFormFields((prev) => ({
          ...prev,
          [name]: value,
          costCentreIds: costCentreId,
          costHeaderIds: costHeaderId,
          categoryId,
          approverDetails: updatedApproverDetails,
          approverBackup: updatedApproverBackup,
        }));

        form.setFieldValue(name, value);
        form.setFieldValue('costCentreIds', costCentreId);
        form.setFieldValue('costHeaderIds', costHeaderId);
        form.setFieldValue('categoryId', categoryId);
        form.setFieldValue('approverDetails', updatedApproverDetails);
        // form.setFieldValue('approverBackup', updatedApprovers);

        return;
      }
    }

    // ------------ No duplicate → normal reset ------------
    setDuplicateUsersList([]);

    const resetApprovers = [
      defaultApprover(1),
      defaultApprover(2),
      defaultApprover(3),
    ];

    setFormFields((prev) => ({
      ...prev,
      [name]: value,
      costCentreIds: costCentreId,
      costHeaderIds: costHeaderId,
      categoryId,
      // approverDetails: resetApprovers,
    }));

    form.setFieldValue(name, value);
    form.setFieldValue('costCentreIds', costCentreId);
    form.setFieldValue('costHeaderIds', costHeaderId);
    form.setFieldValue('categoryId', categoryId);
    // form.setFieldValue('approverDetails', resetApprovers);
    // setDisableIndexList(true);

    if (name === 'categoryName') {
      const selectedCatRows = tableValue.filter(
        (item: any) => item.categoryId === categoryId,
      );
      const zerothApproverDetails = selectedCatRows
        .map((item: any) => item.approverDetails)
        .flat()
        .find((item: any) => item.levelId == 0);
      setIsZerothApproverFound(
        zerothApproverDetails == undefined
          ? false
          : [zerothApproverDetails].length > 0,
      );
      console.log([zerothApproverDetails], 'testValue');
      setFormFields((prev) => ({
        ...prev,
        approverBackup: [zerothApproverDetails],
      }));
      form.setFieldValue('approverBackup', [zerothApproverDetails]);
      if (formFields.tabValue === '0th Approver') {
        setFormFields((prev) => ({
          ...prev,
          approverDetails: [zerothApproverDetails],
        }));
        form.setFieldValue('approverDetails', [zerothApproverDetails]);
      }
    }
  }

  function isDuplicateApprovers(
    costCentre: string,
    costHeader: string,
    category: string,
  ): Array<any> {
    const selectedCostCentreId = costCentreDropdown.find(
      (item) => item.costCentreName === costCentre,
    )?.costCentreId;
    const selectedCostHeaderId = costHeaderDropdown.find(
      (item) => item.costHeaderName === costHeader,
    )?.costHeaderId;
    const selectedCategoryId = approverCategoryDropdown.find(
      (item) => item.categoryName === category,
    )?.categoryId;

    const matchedApprovers = tableValue.filter((row: any) => {
      if (costCentre && costHeader && category) {
        return (
          row.costCentreIds.includes(selectedCostCentreId) &&
          row.costHeaderIds.includes(selectedCostHeaderId) &&
          row.categoryId === selectedCategoryId
        );
      }
    });

    return matchedApprovers;
  }
  async function onSubmit(data: any) {
    setToBackend(true);
    const {
      status,
      costCentreId,
      costHeaderId,
      categoryId,
      approverDetails,
      approverBackup,
      levelId,
      ...rest
    } = data;

    const companyId = session.companyId;
    const customerId = session.customerId;
    const created = session.userId;

    const costCentreIds = costCentreDropdown
      .filter((item) => data.costCentreName === item.costCentreName)
      .map((item) => item.costCentreId);

    const costHeaderIds = costHeaderDropdown
      .filter((item) => data.costHeaderName === item.costHeaderName)
      .map((item) => item.costHeaderId);

    const categoryObj = approverCategoryDropdown.find(
      (item) => data.categoryName === item.categoryName,
    );
    // const zerothCatTest = allApprovers.filter(
    //   (item: any) => item.categoryId === categoryId && item.levelId === 0,
    // );
    // console.log(zerothCatTest, 'zerothCatTest');

    const approverBackupState = formFields.approverBackup;
    // 1️⃣ REMOVE DUPLICATES
    const filteredApprovers = approverBackupState.filter(
      (item: any) =>
        !duplicateUsersList.some((dup) => dup.userName === item.userName),
    );
    // console.log(approverBackupState, 'approverBackupState');

    if (filteredApprovers.length === 0) {
      toast.error('All selected approvers already exist!');
      setIsOpen(false);
      setFormFields(defaultValues);
      setToBackend(false);
      return;
    }

    // 2️⃣ REMOVE EMPTY OBJECTS
    const emptyApprovers = filteredApprovers.filter(
      (item: any) => item.userName?.trim() == '' || item.emailId?.trim() == '',
    );

    if (emptyApprovers.length > 0) {
      toast.error('No valid approvers found!');
      setIsOpen(false);
      setFormFields(defaultValues);
      setToBackend(false);
    }
    for (const approver of filteredApprovers) {
      const userInfo = userDropdown.find(
        (u) => u.userEmailId === approver.emailId,
      );

      if (!userInfo) {
        toast.error(`User not found: ${approver.userName}`);
        return;
      }

      const payload = {
        approverName: userInfo.userName,
        status: 1,
        userId: userInfo.userId,
        emailId: approver.emailId,
        levelId: Number(approver.levelId),
        companyId,
        createdBy: created,
        lastUpdatedBy: created,
        customerId,
        costCentreIds,
        costHeaderIds,
        categoryId: categoryObj?.categoryId,
        ...rest,
      };
      console.log('Calling API with payload:', payload);
      await postMutation.mutateAsync(payload);
    }

    toast.success('All approvers added successfully!');
    setToBackend(false);
    setIsOpen(false);
    setFormFields(defaultValues);
  }
  // console.log(isZerothApproverFound, 'isZerothApproverFound');

  const putMutation = useMutationFn(updateExistApprover, GETALL_APPROVERS);
  async function onUpdate(data: any): Promise<void> {
    setToBackend(true);
    const {
      costCentreIds,
      costHeaderIds,
      categoryId,
      approverDetails,
      approverBackup,
      ...rest
    } = data;

    // const updatedApproverBackup = formFields.approverBackup.map(
    //   (backup: any) => {
    //     const matchedRemover = formFields.confirmedRemovers.find(
    //       (remover: any) => remover.levelId === backup.levelId,
    //     );

    //     return matchedRemover
    //       ? {
    //           ...backup,
    //           approverLevelId: matchedRemover.approverLevelId,
    //         }
    //       : backup;
    //   },
    // );
    const removerMap = new Map(
      formFields.confirmedRemovers.map((r: any) => [r.levelId, r]),
    );

    // 1️⃣ Update approverBackup
    const updatedApproverBackup = formFields.approverBackup.map(
      (backup: any) =>
        removerMap.has(backup.levelId)
          ? {
              ...backup,
              approverLevelId: removerMap.get(backup.levelId).approverLevelId,
            }
          : backup,
    );

    // 2️⃣ Remove used removers
    const updatedConfirmedRemovers = formFields.confirmedRemovers.filter(
      (r: any) =>
        !formFields.approverBackup.some((b) => b.levelId === r.levelId),
    );

    updatedConfirmedRemovers.forEach(async (r: any) => {
      await deleteApprovers(r);
    });

    console.log(
      'Calling API with payload:',
      updatedApproverBackup,
      updatedConfirmedRemovers,
      data,
    );

    for (const approver of formFields.approverBackup) {
      const payload = {
        approverName: approver.userName,
        approverLevelId: approver.approverLevelId,
        status: 1,
        userId: approver.userId,
        emailId: approver.emailId,
        levelId: Number(approver.levelId),
        companyId: approver.companyId,
        customerId: approver.customerId,
        createdBy: session.userId,
        lastUpdatedBy: session.userId,
        costCentreIds: formFields.costCentreIds,
        costHeaderIds: costHeaderIds,
        categoryId: categoryId,
      };

      // console.log('Calling API with payload:', payload, data);
      await putMutation.mutateAsync(payload);
    }
    toast.success('All approvers updated successfully!');
    setToBackend(false);
    setIsOpen(false);
    setFormFields(defaultValues);
    // console.log(data, 'payload,payload');
  }
  // console.log(formFields);
  const editOptions = ['Edit'];
  return (
    <>
      <div className="m-2.5 h-[80%]">
        {allLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          // // isLoading ||
          // toBackend  ? (
          //   <Loader />
          <CustomTable
            headcells={headCells}
            rows={tableValue}
            pageName="Approver Creation"
            functions={allFunctions}
            access={{
              hasCreateAccess: hasCreateAccess,
              hasUpdateAccess: hasUpdateAccess,
            }}
            editOptions={editOptions}
            hide={{
              add: !hasCreateAccess,
              filter: false,
              hidden: false,
              download: false,
            }}
          />
          // )
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
                label={label}
                buttonLabel={
                  edit
                    ? toBackend
                      ? 'Updating '
                      : 'Update'
                    : toBackend
                      ? 'Submitting '
                      : 'Submit'
                }
                disabledOptions={!edit ? disabledOptions : []}
                toBackend={toBackend}
                edit={edit}
              />
            </Modal>
          </div>
        )}

        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmation For Approver Removal "
          description={
            <>
              Are you sure you want to remove the approver:{' '}
              <strong>{removedApprover?.userName}</strong>?
            </>
          }
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
        />
      </div>
    </>
  );
}
