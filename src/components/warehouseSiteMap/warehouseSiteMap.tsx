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
  useDependentQueries,
  useMutationFn,
  useQueriesFn,
} from '@/utils/common/queryUtils';
import {WarehouseSiteMapServices, WarehouseSiteMapQuery } from '@/integrations/Services/warehouseSiteMapServices';
import {WarehouseServices, WarehouseQuery } from '@/integrations/Services/warehouseService';
import Loader from '@/utils/common/components/loader';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';
import type { WarehouseSiteMapDTO, WarehouseSiteMapUpdateDTO } from '@/models/warehouseSiteMapDTO';

interface WarehouseMapProps extends BaseProps {}
export default function WarehousePage(props: WarehouseMapProps): JSX.Element {
  // Services for fetching dropdown data
  // const { getSiteListDrowndownByCompany, getSiteListDrowndownByCustomer } = EirasaasAPIs;
  const {GetSiteListDropdownByUser}= EirasaasAPIs;
  // const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } = EIRASAAS_API_QUERIES;  
  const { GET_SITELIST_BY_USER } = EIRASAAS_API_QUERIES
  const { hasCreateAccess, hasUpdateAccess, session } = props;

  const [tableValue, setTableValue] = useState<Array<any>>([]);
  const [siteDropdown, setSiteDropdown] = useState<Array<siteDropdownType>>([]);
  const [warehouseDropdown, setWarehouseDropdown] = useState<Array<any>>([]);

  // Fetch initial dropdown data for Sites and Warehouses
  const queries = [
    // {
    //   queryKey: isOEM ? GET_SITELIST_BY_COMPANY : GET_SITELIST_BY_CUSTOMER,
    //   api: isOEM ? getSiteListDrowndownByCompany : getSiteListDrowndownByCustomer,
    //   setState: setSiteDropdown,
    //   id: isOEM ? session.companyId : session.customerId,
    // },
       {
      queryKey: GET_SITELIST_BY_USER + 'WSM',
      api: GetSiteListDropdownByUser,
      setState: setSiteDropdown,
      id: session.userId,
    },
    {
      queryKey: WarehouseQuery.GET_ALL_WAREHOUSE_DROPDOWN_MAP+ 'WSM',
      api: WarehouseServices.FetchAllWarehousesDropdown,
      setState: setWarehouseDropdown,
    },
  ];
  const {
    data: [dependentResponse], // dependentResponse now holds site data
    status,
  } = useQueriesFn(queries);

  // Groups sites by warehouse
  function dependentLogic(response: any, siteData: any) {
    const groupedRows = Object.values(
      response.reduce((acc: Row, row: Row) => {
        const key = row.warehouseId;
        if (!acc[key]) {
          acc[key] = {
            warehouseId: row.warehouseId,
            warehouseName: row.warehouseName,
            siteId: [],
            siteName: [],
          };
        }

        acc[key].siteId.push(row.siteId);
        const siteName = siteData.find(
          (item: any) => item.siteId === row.siteId,
        )?.siteName;
        if (siteName) {
            acc[key].siteName.push(siteName);
        }

        return acc;
      }, {}),
    ).map((group: any) => ({
      ...group,
      siteId: group.siteId.join(', '),
      siteName: group.siteName.join(', '),  
    }));
    return groupedRows;
  }

  // Fetch the main table data after dropdowns are loaded
  const dependentQueries = [
    {
      queryKey: WarehouseSiteMapQuery.GET_ALL_WAREHOUSE_MAPPING + 'WSM',
      api: WarehouseSiteMapServices.FetchAllWarehouseMapping,
      setState: setTableValue,
    },
  ];

  const { isLoading } = useDependentQueries(
    status,
    dependentResponse, // Pass site data to the logic function
    dependentLogic,
    dependentQueries,
  );
  
  const postMutation = useMutationFn(WarehouseSiteMapServices.AddWarehouseSiteMap,WarehouseSiteMapQuery.GET_ALL_WAREHOUSE_MAPPING);
  const putMutation = useMutationFn(WarehouseSiteMapServices.UpdateWarehouseSiteMapById, WarehouseSiteMapQuery.GET_ALL_WAREHOUSE_MAPPING);

  const headCells = [
    { id: 'warehouseName', label: 'Warehouse', view: true, filterable: true },
    { id: 'siteName', label: 'Site', view: true, filterable: true},
    { id: 'action', label: 'Action', view: true, filterable: false },
  ];

  // Form Logic
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const defaultValues: any = {
    warehouseName: '',
    siteName: [],
  };
  const [formFields, setFormFields] = useState<any>(defaultValues);

  const fields: Array<Field> = [
    {
      name: 'warehouseName',
      label: 'Warehouse',
      type: 'select',
      placeholder: 'Select Warehouse',
      required: true,
      onChange: (_, value: any) =>
        setFormFields({ ...formFields, warehouseName: value }),
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
      placeholder: 'Select Sites',
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
    setEdit(false);
    setFormFields(defaultValues);
  };

  const options = {
    siteName: siteDropdown.map((item) => item.siteName),
    warehouseName: warehouseDropdown.map((item) => item.warehouseName),
  };

  const label = 'Map Warehouse to Sites';

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

  function onSubmit(_data: WarehouseSiteMapDTO): void {
    const siteIds = formFields.siteName.map(
      (site: any) => siteDropdown.find((item: any) => item.siteName === site)?.siteId,
    );
    const warehouseId = warehouseDropdown.find(
      (item: any) => item.warehouseName === formFields.warehouseName,
    )?.warehouseId;

   const payload:  Omit< WarehouseSiteMapDTO,'warehouseName'> = {
  warehouseId: warehouseId ? [warehouseId] : [],
  siteId: Array.isArray(siteIds) && siteIds.length ? siteIds : [],
  createdBy: session.userId,
  lastUpdatedBy: session.userId,
};
    
    postMutation.mutate(
       { warehouseSiteMap: payload },
       {
      onSuccess: () => {
        toast.success('Warehouse mapped successfully!');
        handleClose();
      },
      onError: (error: any) => toast.error(error.message),
    });
  }

  function onUpdate(data: WarehouseSiteMapUpdateDTO): void {
    const { siteName, warehouseName } = data;
    const siteIds = siteName.map(
      (selectedSiteName: any) =>
        siteDropdown.find((site: any) => site.siteName === selectedSiteName)?.siteId,
    );
    const warehouseId = warehouseDropdown.find(
        (item: any) => item.warehouseName === warehouseName,
      )?.warehouseId;
      
    const payload: Omit< WarehouseSiteMapUpdateDTO,'warehouseName' | 'siteName'>= {
  warehouseId: warehouseId ? [warehouseId] : [],
  siteId: Array.isArray(siteIds)
    ? siteIds.filter((id): id is number => typeof id === 'number')
    : [],
  lastUpdatedBy: session.userId,
};
    
    putMutation.mutate(
       { warehouseId: warehouseId?.toString() || '', warehouseSiteMap: payload },
       {
      onSuccess: () => {
        toast.success('Warehouse mapping updated successfully!');
        handleClose();
      },
      onError: (error: any) => toast.error(error.message),
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
          pageName="WarehouseSiteMap"
          hide={{ add: !hasCreateAccess, filter: false, hidden: false, download: false }}
          access={{ hasCreateAccess: hasCreateAccess, hasUpdateAccess: hasUpdateAccess }}
          functions={{
            addFn: handleOpen,
            optionHandler: (option: any, row: any) => handleOptionClick(option, row),
          }}
        />
      )}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal open={isOpen} onClose={handleClose}>
            <CustomForm
              initialValues={formFields}
              submitFunction={(data) => (edit ? onUpdate(data) : onSubmit(data))}
              onClose={handleClose}
              fields={fields}
              options={options}
              styles={formStyles}
              label={label}
              buttonLabel={edit ? 'Update' : 'Submit'}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};