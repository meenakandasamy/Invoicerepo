import { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '@mui/material';
import { CostHeaderPage } from '../costHeader/costHeader';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import type { JSX } from 'react';
import type { BaseProps, siteDropdownType } from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  useDependentQueriesWithId,
  useMutationFn,
  useQueriesFn,
} from '@/utils/common/queryUtils';
import {
  CostCentreQueries,
  CostCentreServices,
} from '@/integrations/Services/costCentreServices';
import Loader from '@/utils/common/components/loader';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

interface CostCentreMapProps extends BaseProps {}
export const CostCentrePage = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: CostCentreMapProps): JSX.Element => {
  const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } =
    EIRASAAS_API_QUERIES;
  const { GetSiteListDropdownByCompany, GetSiteListDropdownByCustomer } =
    EirasaasAPIs;

  const isOEM = session.userTypeName === 'OEM';

  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const [siteDropdown, setSiteDropdown] = useState<Array<siteDropdownType>>([]);
  const [costCentreList, setCostCentreList] = useState<
    Array<costCentreDropdownTypes>
  >([]);

  const [toBackend, setToBackend] = useState<boolean>(false);

  const queries = [
    {
      queryKey:
        (isOEM ? GET_SITELIST_BY_COMPANY : GET_SITELIST_BY_CUSTOMER) + 'CCM',
      api: isOEM ? GetSiteListDropdownByCompany : GetSiteListDropdownByCustomer,
      setState: setSiteDropdown,
      id: isOEM ? session.companyId : session.customerId,
    },
    {
      queryKey: CostCentreQueries.GET_COST_CENTRE_DROPDOWN + 'CCM',
      api: CostCentreServices.fetchCostCentreDropdown,
      setState: setCostCentreList,
    },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);

  function dependentLogic(mappingResponse: Array<any>, siteList: Array<any>) {
    // Filter out rows where costCentreId is null
    const filtered = mappingResponse.filter((row) => row.costCentreId !== null);

    // Group by costCentreId and map site + cost centre names
    const groupedRows = Object.values(
      filtered.reduce((acc: any, row: any) => {
        const key = row.costCentreId;

        if (!acc[key]) {
          const costCentreName = costCentreList.find(
            (cc: any) => cc.costCentreId === row.costCentreId,
          )?.costCentreName;

          acc[key] = {
            costCentreId: row.costCentreId,
            costCentreName: costCentreName || '--',
            siteId: [],
            siteName: [],
          };
        }

        // Add siteId
        acc[key].siteId.push(row.siteId);

        // Map siteName
        const siteName = siteList.find(
          (s: any) => s.siteId === row.siteId,
        )?.siteName;
        acc[key].siteName.push(siteName || '--');

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
      queryKey: CostCentreQueries.GET_ALL_COST_CENTRE_MAPPINGS + 'CCM',
      api: CostCentreServices.fetchAllCostCentreMappings,
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
    CostCentreServices.postCostCentreSiteMap,
    CostCentreServices.fetchAllCostCentreMappings + 'CCM',
  );
  const putMutation = useMutationFn(
    CostCentreServices.putCostCentreSiteMap,
    CostCentreServices.fetchAllCostCentreMappings + 'CCM',
  );
  const ccHeadCells = [
    {
      id: 'costCentreName',
      label: 'Cost Centre',
      view: true,
      filterable: true,
    },
    { id: 'siteName', label: 'Site Name', view: true, filterable: true },
    { id: 'action', label: 'Action', view: true, filterable: false },
  ];
  const includedDownloadColumns = ccHeadCells.filter((ccHeadCells) => 
    ccHeadCells.view === true)
  .map((ccHeadCells) => ccHeadCells.id);
  console.log(includedDownloadColumns,'text');
  

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const defaultValues = {
    costCentreName: '',
    siteName: [],
  };
  const [formFields, setFormFields] =
    useState<costCentreFieldType>(defaultValues);

  const fields: Array<Field> = [
    {
      name: 'costCentreName',
      label: 'Cost Centre',
      type: 'text',
      placeholder: 'Cost Centre',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'multiSelect',
      placeholder: 'Site Name',
      required: false,
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

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
  };
  const options = {
    siteName: siteDropdown.map((item) => item.siteName),
  };
  const label = 'Create and map sites to Cost Centre';
  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      const siteIds = row.siteId
        .split(',')
        .map((id: string) => Number(id.trim()));

      const matchedSiteNames = siteIds
        .map(
          (id: number) =>
            siteDropdown.find((site: any) => site.siteId === id)?.siteName,
        )
        .filter(Boolean);

      const formattedRow = {
        ...row,
        siteName: matchedSiteNames,
      };
      setFormFields(formattedRow);
      setIsOpen(true);
      setEdit(true);
    }
  }

  function onSubmit(data: any) {
    setToBackend(true);
    const siteIds = formFields.siteName.map(
      (site: any) =>
        siteDropdown.find((item: any) => item.siteName === site)?.siteId,
    );
    console.log(data, 'data');
    console.log(formFields, 'formFields');

    const payload = {
      costCentreName: data.costCentreName,
      siteIds: siteIds,
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
    };
    console.log(payload, 'payload');

    postMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Cost Centre created successfully!');
        handleClose();
        setFormFields(defaultValues);
        setToBackend(false);
      },
      onError: (error: any) => {
        toast.error(error.message);
        setToBackend(false);
      },
    });
  }

  function onUpdate(data: any) {
    const { siteName } = data;
    const siteIds = siteName.map(
      (selectedSiteName: any) =>
        siteDropdown.find((site: any) => site.siteName === selectedSiteName)
          ?.siteId,
    );
    const payload = {
      siteIds: siteIds,
      costCentreId: data.costCentreId,
      costCentreName: data.costCentreName,
      lastUpdatedBy: session.userId,
      createdBy: session.userId,
    };
    console.log(payload, 'payloads', formFields);
    putMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Site mapped to Cost Centre successfully!');
        handleClose();
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
    });
  }

  // ----- TABS STATE -----
  const [tabsValue, setTabsValue] = useState<'costCentre' | 'costHeader'>(
    'costCentre',
  );

  return (
    <div className="m-2.5 h-[80%]">
      <section className="w-full h-full flex flex-col">
        {/* Tabs header */}
        <Tabs
          value={tabsValue}
          onValueChange={setTabsValue}
          className="self-end"
        >
          <TabsList className="flex gap-2">
            <TabsTrigger value="costCentre">Cost Centre</TabsTrigger>
            <TabsTrigger value="costHeader">Cost Header</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* COST CENTRE TAB */}
        {tabsValue === 'costCentre' && (
          <>
            {isLoading || status.some((item) => item === 'pending') ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <CustomTable
                headcells={ccHeadCells}
                rows={tableValue}
                pageName="Cost Centre"
                hide={{
                  add: false,
                  filter: true,
                  hidden: true,
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
                includedDownloadColumns={includedDownloadColumns}
              />
            )}
          </>
        )}

        {/* COST HEADER TAB */}
        {tabsValue === 'costHeader' && (
          <>
            {' '}
            <CostHeaderPage
              hasCreateAccess={hasCreateAccess}
              hasUpdateAccess={hasUpdateAccess}
              session={session}
            />
          </>
        )}
      </section>

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
              label={label}
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};