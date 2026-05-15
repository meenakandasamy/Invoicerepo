import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import type { JSX } from 'react';
import type { BaseProps, siteDropdownType } from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';
import {
  useDependentQueriesWithId,
  useMutationFn,
  useQueriesFn,
} from '@/utils/common/queryUtils';
import approverSiteMapServices, {
  approverSiteMapQuery,
} from '@/integrations/Services/approverSiteMapServices';
import Loader from '@/utils/common/components/loader';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';
import {
  LevelApproverQuery,
  levelApproverServices,
} from '@/integrations/Services/levelApproverServices';


interface ApproverMapProps extends BaseProps {}
export const ApproverSiteMap = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: ApproverMapProps): JSX.Element => {
  const { getAllApproverMappingBYCompany, getAllApproverMappingBYCustomer } =
    approverSiteMapQuery;
  const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } =
    EIRASAAS_API_QUERIES;
  const { GET_APPROVER_BY_COMPANY, GET_APPROVER_BY_CUSTOMER } =
    LevelApproverQuery;
  const {
    getAllApproverMappingByCompany,
    getAllApproverMappingByCustomer,
    PostMapSiteApprover,
    putApproverSiteMap,
  } = approverSiteMapServices;
  const { GetSiteListDropdownByCompany, GetSiteListDropdownByCustomer  } =
    EirasaasAPIs;
  const { getApproversByCompanyId, getApproversByCustomerId } =
    levelApproverServices;

  const isOEM = session.userTypeName === 'OEM';
  const getAllApproverQueryByOEM = isOEM
    ? getAllApproverMappingBYCompany
    : getAllApproverMappingBYCustomer;
  const [tableValue, setTableValue] = useState<Array<approverGetallType>>([]);
  const [siteDropdown, setSiteDropdown] = useState<Array<siteDropdownType>>([]);
  const [approverDropdown, setApproverDropdown] = useState<
    Array<approverDropdownType>
  >([]);

  const queries = [
    {
      queryKey: isOEM ? GET_SITELIST_BY_COMPANY + 'ASM' : GET_SITELIST_BY_CUSTOMER + 'ASM',
      api: isOEM
        ? GetSiteListDropdownByCompany
        : GetSiteListDropdownByCustomer,
      setState: setSiteDropdown,
      id: isOEM ? session.companyId : session.customerId,
    },
    {
      queryKey: isOEM ? GET_APPROVER_BY_COMPANY+ 'ASM': GET_APPROVER_BY_CUSTOMER + 'ASM',
      api: isOEM ? getApproversByCompanyId : getApproversByCustomerId,
      setState: setApproverDropdown,
      id: isOEM ? session.companyId : session.customerId,
    },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);

  function dependentLogic(response: any, response2: any) {
    const groupedRows = Object.values(
      response.reduce((acc: Row, row: Row) => {
        const key = row.approverLevelId;
        if (!acc[key]) {
          acc[key] = {
            approverLevelId: row.approverLevelId,
            approverName: row.approverName,
            siteId: [],
            siteName: [],
          };
        }

        acc[key].siteId.push(row.siteId);
        const siteName = response2.find(
          (item: any) => item.siteId === row.siteId,
        )?.siteName;
        acc[key].siteName.push(siteName);

        return acc;
      }, {}),
    ).map((group: any) => ({
      ...group,
      siteId: group.siteId.join(', '),
      siteName: group.siteName.join(', '),
    }));
    return groupedRows;
  }
  const dependentQueries = [
    {
      queryKey: getAllApproverQueryByOEM + 'ASM',
      api: isOEM
        ? getAllApproverMappingByCompany
        : getAllApproverMappingByCustomer,
      setState: setTableValue,
      id: isOEM ? session.companyId : session.customerId,
    },
  ];
  const { isLoading } = useDependentQueriesWithId(
    status,
    dependentResponse,
    dependentLogic,
    dependentQueries,
  );
  const postMutation = useMutationFn(
    PostMapSiteApprover,
    getAllApproverQueryByOEM,
  );
  const putMutation = useMutationFn(
    putApproverSiteMap,
    getAllApproverQueryByOEM,
  );
  const headCells = [
    {
      id: 'approverName',
      label: 'Approver Name',
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: approverDropdown.map((item: any) => item.approverName),
    },
    {
      id: 'approverLevelId',
      label: 'Approver Level',
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: approverDropdown.map((item: any) => item.approverLevelId),
    },
    { id: 'siteName', label: 'Site Name', view: true, filterable: true},  
      { id: 'action', label: 'Action', view: true, filterable: true },
  ];

  // Form Logics:
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const defaultValues = {
    approverName: '',
    siteName: [],
  };
  const [formFields, setFormFields] =
    useState<approverFieldType>(defaultValues);

  const fields: Array<Field> = [
    {
      name: 'approverName',
      label: 'Approver Name',
      type: 'select',
      placeholder: 'Approver Name',
      required: true,
      onChange: (_, value: any) =>
        setFormFields({ ...formFields, approverName: value }),
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 placeholder:text-gray-400 ',
      },
    },
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'multiSelect',
      placeholder: 'Site Name',
      required: true,
      onChange: (_, value: any) =>
        setFormFields({ ...formFields, siteName: value }),
      value: formFields.siteName,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100 placeholder:text-gray-400 ',
      },
    },
  ];
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

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
  };
  const options = {
    siteName: siteDropdown.map((item) => item.siteName),
    approverName: approverDropdown.map((item) => item.approverName),
  };
  const label = 'Map Sites';
  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      const formattedRow = {
        ...row,
        siteName: row.siteName.split(', '),
      };
      setFormFields(formattedRow);
      setIsOpen(true);
      setEdit(true);
    }
  }

  function onSubmit(_: any) {
    const siteIds = formFields.siteName.map(
      (site: any) =>
        siteDropdown.find((item: any) => item.siteName === site)?.siteId,
    );
    const approverIds = approverDropdown.find(
      (item: any) => item.approverName === formFields.approverName,
    )?.approverLevelId;
    const payload = {
      approverLevelId: [approverIds],
      siteId: siteIds,
      createdBy: 1,
      lastUpdatedBy: 1,
    };
    postMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Site mapped successfully!');
        handleClose();
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
    });
  }
  function onUpdate(data: any) {
    const { siteName, approverName } = data;
    const siteIds = siteName.map(
      (selectedSiteName: any) =>
        siteDropdown.find((site: any) => site.siteName === selectedSiteName)
          ?.siteId,
    );
    console.log(siteName, siteIds);

    const approverIds = approverDropdown
      .filter((item: any) => item.approverName === approverName)
      .map((item: any) => item.approverLevelId);
    const payload = {
      siteName,
      approverName,
      siteId: siteIds,
      approverLevelId: approverIds,
      lastUpdatedBy: session.userId,
      createdBy: session.userId,
    };
    console.log(payload, 'payloads', formFields);
    putMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Site mapped successfully!');
        handleClose();
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
    });
  }

  return (
    <div>
      {isLoading || status.some((item) => item === 'pending') ? (
        <Loader />
      ) : (
        <CustomTable
          headcells={headCells}
          rows={tableValue}
          pageName="ApproverSiteMap"
          hide={{
            add: !hasCreateAccess,
            filter: false,
            hidden: false,
            download: false,
          }}
          access={{
            hasCreateAccess: hasCreateAccess,
            hasUpdateAccess: hasUpdateAccess,
          }}
          functions={{
            addFn: handleOpen,
            optionHandler: (option: any, row: any) =>
              handleOptionClick(option, row),
          }}
        />
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
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
