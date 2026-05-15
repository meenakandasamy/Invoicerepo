import { useEffect, useMemo, useState } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { format, isValid, parseISO } from 'date-fns';
import { Loader2, Zap } from 'lucide-react';
import { VendorFormLink } from '../vendorForm/vendorFormLink';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import type { Field } from '@/types/form';
import type { JSX } from 'react/jsx-runtime';
import type { HeadCell, Row } from '@/types/table';
import type { BaseProps } from '@/types/common';
import type { VendorDTO, VendorUpdateDTO } from '@/models/vendorDTO';
import type { VendorSearch } from '@/utils/Validators/schema/SearchSchemas';
import { CustomTable } from '@/components/table/customTable';
import { CustomForm } from '@/components/form/customForm';
import {
  ConfirmationModalScreen,
  CustomScreenForm,
} from '@/components/layout/LogScreen';

import {
  VendorQuery,
  VendorServices,
} from '@/integrations/Services/vendorServices';
import Loader from '@/utils/common/components/loader';
import { invalidateQuery, useMutationFn } from '@/utils/common/queryUtils';
import {
  downloadQuotationExcel,
  downloadQuotationPdf,
} from '@/lib/downloadQuotation';
import { useApproverDetails } from '@/hooks/data/useApproverDetails';
import { useVendors } from '@/hooks/data/useVendorGetAll';
import { useVendorLogs } from '@/hooks/data/useVendorLogs';
import { useSites } from '@/hooks/data/useSite';
import { useCostHeaders } from '@/hooks/data/useCostHeader';
import { useCostCenters } from '@/hooks/data/useCostCenter';
import { useUserList } from '@/hooks/data/useUserList';
import {
  APPROVER_CATEGORY,
  isPrimaryValidator,
  levelValidator,
} from '@/utils/common/permissions';
import { LogScreen } from '../layout/LogScreen';
import LogPopup from '../layout/LogPopup';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';

interface VenderProps extends BaseProps {
  search: VendorSearch;
}

export default function VendorPage(props: VenderProps): JSX.Element {
  const { hasCreateAccess, hasUpdateAccess, session, search } = props;
  const navigate = useNavigate({
    from: '/po/vendor',
  });

  const SiteQuery = useSites(session);
  const CostHeaderQuery = useCostHeaders();
  const CostCenterQuery = useCostCenters();
  const userQuery = useUserList(session);

  const dropdownLoading =
    SiteQuery.isLoading ||
    CostHeaderQuery.isLoading ||
    CostCenterQuery.isLoading ||
    userQuery.isLoading;
  const siteDropdown = useMemo(() => SiteQuery.data ?? [], [SiteQuery.data]);
  const costHeaderDropdown = useMemo(
    () => CostHeaderQuery.data ?? [],
    [CostHeaderQuery.data],
  );
  const costCentreDropdown = useMemo(
    () => CostCenterQuery.data ?? [],
    [CostCenterQuery.data],
  );
  const userDropdown = useMemo(() => userQuery.data ?? [], [userQuery.data]);

  enum METHOD {
    GET_ALL = 'GET_ALL',
    GET_BY_ID = 'GET_BY_ID',
    GET_BY_COMPANY_ID = 'GET_BY_COMPANY_ID',
    GET_BY_CUSTOMER_ID = 'GET_BY_CUSTOMER_ID',
    GET_BY_ORG_ID = 'GET_BY_ORG_ID',
  }
  const isOEM = session.userTypeId == 3;
  const isCustomer = session.userTypeId == 2;

  const vendorQuery = useVendors(
    session,
    METHOD.GET_BY_ORG_ID,
    // isOEM
    //   ? METHOD.GET_BY_COMPANY_ID
    //   : isCustomer
    //     ? METHOD.GET_BY_CUSTOMER_ID
    //     : METHOD.GET_BY_COMPANY_ID,
  );

  const allVendors = useMemo(
    () =>
      (vendorQuery.data ?? []).sort(
        (a: any, b: any) =>
          new Date(b.lastUpdatedDate).getTime() -
          new Date(a.lastUpdatedDate).getTime(),
      ),
    [vendorQuery.data],
  );

  const normalizeVendorType = (prev: Array<string>, next: Array<string>) => {
    const added = next.find((v) => !prev.includes(v));

    if (added === 'Property Owner') return ['Property Owner'];
    if (added === 'Consultant') return ['Consultant'];

    return next.filter((v) => v !== 'Property Owner' && v !== 'Consultant');
  };

  const [tableValue, setTableValue] = useState(allVendors);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!search.vendorId) return;
      try {
        const vendorData = await VendorServices.FetchVendorById({
          vendorId: search.vendorId,
        });
        handleVendorLog(vendorData);
      } catch (error) {
        console.error('Error fetching vendor data:', error);
      }
    };
    fetchVendor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.vendorId]);

  const [edit, setEdit] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false); // State for Add/Edit form modal
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isGstDisabled, setIsGstDisabled] = useState(true);
  const [isExceptionalDisabled, setIsExceptionalDisabled] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation modal
  const [vendorToDeleteId, setVendorToDeleteId] = useState<string | null>(null); // State to store ID of vendor to delete
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [toApprovalBackend, setToApprovalBackend] = useState<boolean>(false);
  const [toInstantApprovalBackend, setToInstantApprovalBackend] =
    useState<boolean>(false);
  const [isInstantApproval, setIsInstantApproval] = useState<boolean>(false);
  const [toRejectionBackend, setToRejectionBackend] = useState<boolean>(false);
  const [logTableValue, setLogTableValue] = useState<any>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isUpdated, setIsUpdated] = useState(false);

  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalFields, setApprovalModalFields] =
    useState<Array<Field>>();
  useApproverDetails(session.userId);
  const [selectedVendorId, setSelectedVendorId] = useState<number | string>('');
  const logsQuery = useVendorLogs(session, selectedVendorId);
  const logs = useMemo(() => logsQuery.data ?? [], [logsQuery.data]);

  const vendorApproveMutation = useMutation({
    mutationKey: [VendorQuery.APPROVE_VENDOR],
    mutationFn: async (data: any) => {
      setToApprovalBackend(true);
      return await VendorServices.approveVendor(data);
    },
    onSuccess: () => {
      invalidateQuery(VendorQuery.GET_ALL_VENDORS);
      handleCloseAll();
      setToApprovalBackend(false);
      handleApprovalModalClose();
    },
    onError: (error: any) => {
      console.error(error);
      setToApprovalBackend(false);
      toast.error(
        `Failed to approve expense ${error.response.data || error.message}`,
      );
    },
  });

  const vendorRejectMutation = useMutation({
    mutationKey: [VendorQuery.REJECT_VENDOR],
    mutationFn: async (data: any) => {
      setToRejectionBackend(true);
      return await VendorServices.rejectVendor(data);
    },
    onSuccess: () => {
      invalidateQuery(VendorQuery.GET_ALL_VENDORS);
      setToRejectionBackend(false);
      handleCloseAll();
      handleApprovalModalClose();
    },
    onError: (error: any) => {
      console.error(error);
      setToRejectionBackend(false);
      toast.error(
        `Failed to reject expense ${error.response.data || error.message}`,
      );
    },
  });
  const handleCloseAll = () => {
    handleClose();
    handleCloseLog();
  };
  function handleCloseLog() {
    setIsOpen(false);
    setIsLogOpen(false);
    setSelectedRow(null);
    setLogTabsValue('details');
    if (search.vendorId) {
      navigate({
        to: '/po/consolidatedDashboard',
        replace: true,
      });
      return;
    } else {
      navigate({
        to: '/po/vendor',
        replace: true,
      });
      return;
    }
  }
  // Table variables
  const headCells: Array<HeadCell> = [
    {
      id: 'vendorCode',
      label: 'Vendor Code',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'vendorType',
      label: 'Vendor Type',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Product', 'Service', 'Property Owner', 'Consultant'],
    },
    {
      id: 'createdDate',
      label: 'Created On',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'vendorName',
      label: 'Company Name',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'poc',
      label: 'POC',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'mobileNo',
      label: 'Mobile Number',
      defaultView: false,
      view: true,
      filterable: true,
    },
    {
      id: 'emailId',
      label: 'Email Id',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'gstNo',
      label: 'GST No',
      defaultView: false,
      view: false,
      filterable: true,
    },
    {
      id: 'panNo',
      label: 'PAN',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'bankName',
      label: 'Bank Name',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'bankBranch',
      label: 'Bank Branch',
      defaultView: false,
      view: false,
      filterable: false,
    },
    {
      id: 'accountNo',
      label: 'Account No',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'bankIfscCode',
      label: 'Bank IFSC',
      defaultView: false,
      view: false,
      filterable: false,
    },

    {
      id: 'description',
      label: 'Description',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'gstStatus',
      label: 'GST Status',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Registered', 'Unregistered',],
    },
    {
      id: 'createdBy',
      label: 'Created By',
      defaultView: false,
      view: true,
      filterable: true,
    },
    {
      id: 'msmeRegistration',
      label: 'MSME Registration',
      defaultView: false,
      view: false,
      filterable: true,
    },
    {
      id: 'view.bankFileName',
      label: 'Bank Details File',
      view: false,
      defaultView: false,
      filterable: false,
    },
    {
      id: 'view.panFileName',
      label: 'PAN File',
      view: false,
      defaultView: false,
      filterable: false,
    },
    {
      id: 'view.msmeFileName',
      label: 'MSME Registration File',
      view: false,
      defaultView: false,
      filterable: false,
    },
    {
      id: 'view.gstFileName',
      label: 'GST Certificate File',
      view: false,
      defaultView: false,
      filterable: false,
    },
    {
      id: 'approverStatusName',
      label: 'Status',
      defaultView: true,
      view: true,
    },

    {
      id: 'lastUpdatedDate',
      label: 'Last Updated On',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'visualLevelId',
      label: 'Current Level',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'isException',
      label: 'Exception',
      defaultView: false,
      view: false,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Yes', 'No'],
    },
    {
      id: 'expApprovedBy',
      label: 'Approver',
      defaultView: false,
      view: false,
      filterable: true,
      filterType: 'select',
      filterOptions: userDropdown
        .filter((item: any) => [1155, 917, 479].includes(item.userId))
        .map((item: any) => item.firstName),
    },
    // {
    //   id: 'nextApproverName',
    //   label: 'Next Approver',
    //   defaultView: true,
    //   view: true,
    //   filterable: true,
    // },
    {
      id: 'action',
      label: 'Action',
      defaultView: true,
      view: true,
      filterable: false,
    },
  ];

   const includedDownloadColumns = headCells.filter((headcell) => 
    headcell.view === true)
  .map((headcell) => headcell.id); 
  
  // Form variables
  const defaultValues = {
    vendorCode: '',
    vendorName: '',
    mobileNo: '',
    emailId: '',
    gstNo: '',
    panNo: '',
    bankIfscCode: '',
    accountNo: '',
    bankName: '',
    bankBranch: '',
    description: '',
    isGST: '',
    createdBy: '',
    createdDate: '',
    // msmeRegistration: '',
    accountNoFilpath: '',
    vendorType: [],
    panNoFilepath: '',
    msmeRegistrationFilepath: '',
    gstNoFilepath: '',
    costCentreName: [],
    costCentreIds: [],
    costHeaderName: [],
    costHeaderIds: [],
    siteName: [],
    siteIds: [],
    isException: false,
  };
  const [formFields, setFormFields] = useState<any>(defaultValues);

  const putMutation = useMutationFn(
    VendorServices.UpdateVendorById,
    VendorQuery.GET_ALL_VENDORS,
  );
  const postMutation = useMutationFn(
    VendorServices.AddNewVendor,
    VendorQuery.GET_ALL_VENDORS,
  );
  const deleteMutation = useMutationFn(
    VendorServices.DeleteVendorById,
    VendorQuery.GET_ALL_VENDORS,
  );
  const isValidFile = (value?: string | null) => {
    if (!value || value.trim() === '') return true;

    if (
      value.startsWith('JVBERi0x') || // PDF
      value.startsWith('/9j/') || // JPG
      value.startsWith('iVBORw0KG') // PNG
    ) {
      return true;
    }

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = value.split('.').pop()?.toLowerCase();

    return allowedExtensions.includes(ext || '');
  };

  function onSubmit(data: any): void {
    if (
      !isValidFile(data.accountNoFilpath) ||
      !isValidFile(data.panNoFilepath) ||
      !isValidFile(data.msmeRegistrationFilepath) ||
      !isValidFile(data.gstNoFilepath)
    ) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }
    setToBackend(true);

    data.createdBy = session.userId;
    data.lastUpdatedBy = session.userId;
    data.mobileNo = data.mobileNo ? Number(data.mobileNo) : null;
    data.status = 1;
    data.companyId = session.companyId;
    data.customerId = session.customerId;
    data.organizationId = sessionStorage.getItem('organizationId');

    data.siteIds = siteDropdown
      .filter((item: any) => data.siteName.includes(item.siteName))
      .map((item: any) => item.siteId);

    data.costCentreIds = costCentreDropdown
      .filter((item: any) => data.costCentreName.includes(item.costCentreName))
      .map((item: any) => item.costCentreId);

    data.costHeaderIds = costHeaderDropdown
      .filter((item: any) => data.costHeaderName.includes(item.costHeaderName))
      .map((item: any) => item.costHeaderId);

    // GST handling for non-property owners
    data.gstStatus = data.isGST?.toString() === 'Registered' ? 1 : 0;
    // data.panfileType = formFields.panfileType;
    // data.accfileType = formFields.accfileType;
    // data.msmefileType = formFields.msmefileType;
    // data.gstfileType = formFields.gstfileType;

    // ⭐ Property Owner logic override
    // if (formFields.vendorType?.includes('Property Owner')) {
    //   data.gstNo = data.aadharNo;
    //   data.gstNoFilepath = data.aadharNoFilepath;
    //   data.gstfileType = data.aadharfileType;
    //   data.isGST = null;
    //   data.gstStatus = null;
    // }
    data.expApprovedBy =
      userDropdown.find((user: any) => user.firstName === data.expApprovedBy)
        ?.userId || null;

    console.log(data, 'vendor onsubmit data');

    postMutation.mutate(
      { vendor: data },
      {
        onSuccess: () => {
          toast.success('Vendor added successfully!');
          setToBackend(false);
          setIsOpen(false);
          setFormFields(defaultValues);
          setIsGstDisabled(true);
        },
        onError: (error: any) => {
          const errorMsg = error?.response?.data?.error;
          const match = errorMsg?.match(/Key \((.*?)\)=\((.*?)\)/);

          if (match) {
            const field = match[1];
            const value = match[2];
            const formattedField = field
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c: string) => c.toUpperCase());
            toast.error(`${formattedField} already exists.`);
          }
          setToBackend(false);
          setFormFields(defaultValues);
        },
      },
    );
  }

  const putMutationFn = async (payload: any) => {
    await putMutation.mutateAsync(
      {
        vendorId: formFields?.vendorId,
        vendor: payload,
      },
      {
        onSuccess: () => {
          toast.success(
            isInstantApproval
              ? 'Vendor Approved successfully!'
              : 'Vendor updated successfully!',
          );

          setIsUpdated(true);
          setToBackend(false);
          setFormFields((prev: any) => ({
            ...prev,
            costCentreName: prev.costCentreName,
            costHeaderName: prev.costHeaderName,
            costCentreIds: prev.costCentreIds,
            costHeaderIds: prev.costHeaderIds,
          }));

          setIsOpen(false);
          setEdit(false);

          if (isInstantApproval) {
            setIsInstantApproval(false);
            setToInstantApprovalBackend(false);
            setLogTableValue([]);
            setIsLogOpen(false);
          }
          invalidateQuery(VendorQuery.GET_ALL_VENDORS);
        },
        onError: (error: any) => {
          toast.error(`Failed to update vendor: ${error.message || error}`);
          setToBackend(false);
          setToInstantApprovalBackend(false);
        },
      },
    );
  };
  function onUpdate(data: VendorUpdateDTO): void {
    setToBackend(true);

    // -------------------------
    // 🔧 Helper utilities
    // -------------------------

    const getIds = (dropdown: Array<any>, names: Array<any>) =>
      dropdown
        .filter((item) =>
          names.includes(
            item.siteName ?? item.costCentreName ?? item.costHeaderName,
          ),
        )
        .map(
          (item) =>
            item.id ?? item.siteId ?? item.costCentreId ?? item.costHeaderId,
        );

    const getFileType = (path: string | null | undefined) =>
      path ? path.split('.').pop()?.toLowerCase() : null;

    const getFileName = (path: string | null | undefined) =>
      path ? path.split('/').pop() : null;

    const flatVendorType = (type: any) =>
      Array.isArray(type) ? type.flat() : [];

    const newPayload = edit
      ? {
          ...data,
          mobileNo: data.mobileNo ? Number(data.mobileNo) : null,

          gstStatus: data.isGST === 'Registered' || data.isGST === 1 ? 1 : 0,
          vendorType: flatVendorType(data.vendorType),
          lastUpdatedBy: session.userId,
          accfileType: getFileType(data.accountNoFilePath),
          gstfileType: getFileType(data.gstNoFilePath),
          panfileType: getFileType(data.panNoFilePath),
          msmefileType: getFileType(data.msmeRegistrationFilePath),
          aadharfileType: getFileType(data.aadharNoFilePath),
          accfilename: getFileName(data.accountNoFilePath),
          organizationId: data.organizationId
            ? sessionStorage.getItem('organizationId')
            : null,
        }
      : {
          ...data,
          gstStatus: data.isGST === 'Registered' || data.isGST === 1 ? 1 : 0,
          accfileType: getFileType(data.accountNoFilePath),
          accfilename: getFileName(data.accountNoFilePath),
          gstfileType: getFileType(data.gstNoFilePath),
          panfileType: getFileType(data.panNoFilePath),
          msmefileType: getFileType(data.msmeRegistrationFilePath),
          aadharfileType: getFileType(data.aadharNoFilePath),
          lastUpdatedBy: session.userId,
          costCentreIds: getIds(costCentreDropdown, data.costCentreName),
          costHeaderIds: getIds(costHeaderDropdown, data.costHeaderName),
          organizationId: data.organizationId
            ? sessionStorage.getItem('organizationId')
            : null,
        };

    putMutationFn(newPayload);
    console.log(newPayload, 'costTested');
  }

  const baseFields: Array<Field> = [
    {
      name: 'vendorType',
      label: 'Vendor Type',
      type: 'multiSelect',
      placeholder: 'Vendor Type',
      required: true,
      disabled: toBackend,
      onChange: (name: string, value: Array<string>, form: any) => {
        setFormFields((prev: any) => {
          const nextValue = normalizeVendorType(prev.vendorType || [], value);

          form.setFieldValue(name, nextValue);
          return { ...prev, [name]: nextValue };
        });
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    // { name: '', label: '', type: '', placeholder: '' },

    {
      name: 'vendorName',
      label: 'Company Name',
      type: 'text',
      placeholder: 'Company Name',
      required: true,
      disabled: toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'poc',
      label: 'POC',
      type: 'text',
      placeholder: 'POC',
      required: isExceptionalDisabled,
      disabled: toBackend,
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
      type: 'text',
      placeholder: '9789564564',
      required: isExceptionalDisabled,
      disabled: toBackend,
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
      placeholder: 'Email',
      required: isExceptionalDisabled,
      disabled: toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'panNo',
      label: 'PAN',
      type: 'text',
      placeholder: 'PAN',
      required: isExceptionalDisabled,
      disabled: toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'isGST',
      label: 'GST Status',
      type: 'select',
      placeholder: 'Registered / Unregistered',
      required: isExceptionalDisabled,
      disabled: toBackend,
      onChange: (name: string, value: any, form: any) => {
        console.log(name, 'testChange', value);

        setFormFields((prev: any) => ({
          ...prev,
          [name]: value,
          ...(value !== 'Registered' && { gstNo: '', gstNoFilepath: '' }),
        }));
        form.setFieldValue([name], value);
        if (value !== 'Registered') {
          form.setFieldValue('gstNo', '');
          form.setFieldValue('gstNoFilepath', '');
        }
        setIsGstDisabled(value == 'Registered' ? false : true);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'gstNo',
      label: 'GST No',
      type: 'text',
      placeholder: 'GST No',
      disabled: isGstDisabled || toBackend,
      required: true,
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
      required: isExceptionalDisabled,
      disabled: toBackend,
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
      required: isExceptionalDisabled,
      disabled: toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'accountNo',
      label: 'Account No',
      type: 'text',
      placeholder: 'Account No',
      required: isExceptionalDisabled,
      disabled: toBackend,
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
      placeholder: 'Bank IFSC',
      required: isExceptionalDisabled,
      disabled: toBackend,
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
      placeholder: 'Description',
      disabled: toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'accountNoFilpath',
      label: 'Cancelled cheque (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      required: !edit && isExceptionalDisabled,
      hidden: edit && isExceptionalDisabled,
      disabled: toBackend,
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(
          value,
          form,
          'accountNoFilpath',
          'accfileType',
          'accfilename',
        );
      },
    },
    {
      name: 'panNoFilepath',
      label: 'PAN Card (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
      required: !edit && isExceptionalDisabled,
      hidden: edit && isExceptionalDisabled,

      disabled: toBackend,
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'panNoFilepath', 'panfileType');
      },
    },
    {
      name: 'msmeRegistrationFilepath',
      label: 'MSME Registration (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      disabled: toBackend,
      required: false,
      hidden: edit && isExceptionalDisabled,
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(
          value,
          form,
          'msmeRegistrationFilepath',
          'msmefileType',
        );
      },
      // hidden: edit,
    },
    {
      name: 'gstNoFilepath',
      label: 'GST Certificate (PDF, JPG, PNG)',
      type: 'file',
      placeholder: isGstDisabled
        ? 'Select GST status as Registered'
        : 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      disabled: isGstDisabled || toBackend,
      required: !isGstDisabled && !edit,
      hidden: edit, // optional but best practice
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'gstNoFilepath', 'gstfileType');
      },
    },
    {
      name: 'isException',
      label: 'Enable Exception',
      type: 'toggle',
      disabled: toBackend,
      hidden: edit, // ensures true/false
      onChange: (name, value, form) => {
        form.setFieldValue(name, value);

        if (value === true) {
          form.setFieldValue('panNo', '');
          form.setFieldValue('panNoFilepath', '');
          form.setFieldValue('panfileType', '');
        }
        setIsExceptionalDisabled(!value);

        if (!value) {
          form.setFieldValue('expApprovedBy', '');
          form.setFieldValue('exceptionfileType', '');
        }
      },
    },

    {
      name: 'expApprovedBy',
      label: 'Exception Approvered By',
      type: 'select',
      placeholder: 'Select Approver',
      hidden: edit,
      required: !isExceptionalDisabled,
      disabled: isExceptionalDisabled || toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },

    {
      name: 'expApprovedFilepath',
      label: 'Approved File (PDF, JPG, PNG)',
      type: 'file',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: !isExceptionalDisabled,
      disabled: isExceptionalDisabled || toBackend,
      hidden: edit,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
      onChange: (_name: string, value: any, form: any) => {
        handleFileChange(
          value,
          form,
          'expApprovedFilepath',
          'exceptionfileType',
        );
      },
    },
    // { name: '', label: '', type: '', placeholder: '' },
  ];
  const [fields, setFields] = useState(baseFields);
  const propertyOwnerFields = [
    {
      name: 'aadharNo',
      label: 'Aadhar No',
      type: 'text',
      placeholder: 'Aadhar No',
      required: true,
      disabled: toBackend,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'aadharNoFilepath',
      label: 'Aadhar Card (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      required: !edit,
      hidden: edit,
      disabled: toBackend,
      acceptTypes: '.pdf,.jpg,.jpeg,.png',

      onchange: (_name: string, value: any, form: any) => {
        handleFileChange(value, form, 'aadharNoFilepath', 'aadharfileType');
        // setFormFields((prev: any) => ({
        //   ...prev,
        //   [name]: value[0].file.name,
        //   aadharfileType: value[0].file.type.split('/')[1],
        // }));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
  useEffect(() => {
    setIsExceptionalDisabled(!formFields.isException);
  }, [formFields.isException]);

  useEffect(() => {
    let updatedFields = [...baseFields];

    const vendorType = formFields.vendorType || [];

    const isPropertyOwnerSelected = vendorType.includes('Property Owner');
    const isConsultantSelected = vendorType.includes('Consultant');

    updatedFields = updatedFields.map((field) => {
      if (['gstNo', 'gstNoFilepath'].includes(field.name)) {
        return { ...field, disabled: isGstDisabled };
      }
      if (['expApprovedBy', 'exceptionfileType'].includes(field.name)) {
        return {
          ...field,
          disabled: isExceptionalDisabled || toBackend,
          required: !isExceptionalDisabled,
        };
      }

      if (field.name === 'vendorName') {
        return {
          ...field,
          label: isPropertyOwnerSelected
            ? 'Owner Name'
            : isConsultantSelected
              ? 'Consultant Name'
              : 'Company Name',
          placeholder: isPropertyOwnerSelected
            ? 'Owner Name'
            : isConsultantSelected
              ? 'Consultant Name'
              : 'Company Name',
        };
      }

      return field;
    });

    if (isPropertyOwnerSelected || isConsultantSelected) {
      // Remove GST related fields
      updatedFields = updatedFields.filter((f) => !['poc'].includes(f.name));

      // Insert and move Aadhar-related fields
      const bankIndex = updatedFields.findIndex((f) => f.name === 'bankName');

      updatedFields.splice(bankIndex, 0, propertyOwnerFields[0]); // Aadhar No in middle
      !edit && updatedFields.push(propertyOwnerFields[1]); // File upload at the end

      // Reset GST fields
      // setFormFields((prev: any) => ({
      //   ...prev,
      //   isGST: null,
      //   gstNo: null,
      //   gstNoFilepath: null,
      // }));
    }

    setFields(updatedFields);
  }, [formFields.vendorType, isGstDisabled, isExceptionalDisabled]);

  const options = {
    isGST: ['Registered', 'Unregistered'],
    vendorType: ['Product', 'Service', 'Property Owner', 'Consultant'],
    costHeaderName: costHeaderDropdown.map((item: any) => item.costHeaderName),
    costCentreName: costCentreDropdown.map((item: any) => item.costCentreName),
    siteName: siteDropdown.map((item: any) => item.siteName),
    expApprovedBy: userDropdown
      .filter((item: any) => [1155, 917, 479].includes(item.userId))
      .map((item: any) => item.firstName),
  };
  const formStyles = {
    pageName: 'Vendor',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
    submitButton:
      'cursor-pointer border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const handleFileChange = (
    value: any,
    form: any,
    filePathKey: string,
    fileTypeKey: string,
    fileNameKey: string,
  ) => {
    const file = value?.[0]?.file;
    if (!file) return;

    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext || '')) {
      toast.error('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    console.log(ext, file.name, 'testTata');

    form.setFieldValue(filePathKey, file.name);
    form.setFieldValue(fileTypeKey, ext);
    form.setFieldValue(fileNameKey, file.name);
  };

  const handleOpen = () => {
    setFormFields(defaultValues); // Reset form fields for new entry
    setIsExceptionalDisabled(true);
    setEdit(false); // Ensure it's in add mode
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
    setIsLogOpen(false);
    setEdit(false); // Ensure edit mode is off when closing
    setFormFields(defaultValues); // Reset form fields to default
    setVendorToDeleteId(null); // Clear vendorToDeleteId
    setShowDeleteConfirm(false); // Hide delete confirm modal
    setIsGstDisabled(true);
    setToBackend(false);
  };

  // Function to handle confirmation of delete
  const handleConfirmDelete = () => {
    if (vendorToDeleteId) {
      deleteMutation.mutate(
        { vendorId: vendorToDeleteId },
        {
          onSuccess: () => toast.success('Vendor deleted successfully!'),
          onError: (error: any) =>
            toast.error(`Failed to delete vendor: ${error.message || error}`),
          onSettled: () => {
            setVendorToDeleteId(null); // Clear ID after mutation
            setShowDeleteConfirm(false); // Close confirmation modal
          },
        },
      );
    }
  };

  function handleOptionClick(option: string, row: Row) {
    if (option === 'Delete') {
      setVendorToDeleteId(row.vendorId?.toString() || null);
      setFormFields(row);
      setShowDeleteConfirm(true); // Show the confirmation modal
    } else if (option === 'Edit') {
      setFormFields({
        ...row,
        costCentreName: costCentreDropdown
          .filter((item: any) => row.costCentreIds?.includes(item.costCentreId))
          .map((item: any) => item.costCentreName),
        costHeaderName: costHeaderDropdown
          .filter((item: any) => row.costHeaderIds?.includes(item.costHeaderId))
          .map((item: any) => item.costHeaderName),
        siteName: siteDropdown
          .filter((item: any) => row.siteIds?.includes(item.siteId))
          .map((item: any) => item.siteName),
        isGST:
          row.gstStatus == 1 || row.gstStatus === 'Registered'
            ? 'Registered'
            : row.gstStatus == 0 || row.gstStatus === 'Unregistered'
              ? 'Unregistered'
              : 'Unregistered',
      });
      setIsGstDisabled(
        row.gstStatus == 'Registered' || row.gstStatus == 1 ? false : true,
      );
      setIsOpen(true);
      setEdit(true);
    }
  }

  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };
  const handleVendorLog = (row: any) => {
    setIsLogOpen(true);
    // function appendCentreAndHeaderNames(
    //   vendor: Row,
    //   centreList: any,
    //   headerList: any,
    //   siteList: any,
    // ): Row {
    //   if (!vendor.gstNo) {
    //     delete vendor.gstNo;
    //     delete vendor.gstNoFilepath;
    //   }

    //   vendor.costCentreName = centreList
    //     .filter((item: any) =>
    //       vendor.costCentreIds?.includes(item.costCentreId),
    //     )
    //     .map((item: any) => item.costCentreName);
    //   vendor.costHeaderName = headerList
    //     .filter((item: any) =>
    //       vendor.costHeaderIds?.includes(item.costHeaderId),
    //     )
    //     .map((item: any) => item.costHeaderName);
    //   vendor.siteName = siteList
    //     .filter((item: any) => vendor.siteIds?.includes(item.siteId))
    //     .map((item: any) => item.siteName);

    //   return {
    //     ...vendor,
    //   };
    // }
    console.log(row, 'vendrTes');

    const {
      siteNames,
      costCentreNames,
      costHeaderNames,
      // also removing unused fields as you already do:
      view,
      status,
      createdBy,
      lastUpdatedBy,
      msmeRegistration,
      ...cleaned
    } = row;

    // const formattedRow = appendCentreAndHeaderNames(
    //   rest,
    //   costCentreDropdown,
    //   costHeaderDropdown,
    //   siteDropdown,
    // );
    // console.log(
    //   {
    //     ...cleaned,
    //   },
    //   'cleaned',
    //   row,
    // );

    setSelectedRow({
      ...cleaned,
    });

    setLogTableValue(cleaned);
    setFormFields(row);
    setSelectedVendorId(row.vendorId);
  };
  const isDate = (value: any): boolean => {
    if (typeof value !== 'string') return false;

    const parsed = parseISO(value);

    return isValid(parsed);
  };

  const formatValue = (value: any, label: string) => {
    // --- Handle Date values ---
    if (isDate(value)) {
      try {
        return label === 'Invoice Date'
          ? format(new Date(value), 'MMM dd, yyyy')
          : format(new Date(value), 'MMM dd, yyyy h:mm a');
      } catch {
        return value;
      }
    }

    // --- Handle URL values ---
    if (typeof value === 'string' && value.startsWith('http')) {
      try {
        const url = new URL(value);
        const pathname = url.pathname;
        const filename =
          pathname.substring(pathname.lastIndexOf('/') + 1) || 'Download';

        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#007bff', textDecoration: 'underline' }}
          >
            {filename}
          </a>
        );
      } catch {
        return value;
      }
    }

    return value;
  };

  function handleInstantApprove() {
    setIsInstantApproval(true);
  }
  function handleApproveUpdate() {
    const { view, ...rest } = formFields;
    const payload = {
      ...rest,
      gstStatus:
        rest.gstStatus &&
        (rest.gstStatus.toString() === 'Registered' || rest.gstStatus == 1)
          ? 1
          : 0,
      approverStatusId: 3,
      accountNo: Number(rest.accountNo),
    };
    console.log(payload, 'dataTestdata');
    setToInstantApprovalBackend(true);
    putMutationFn(payload);
  }

  function handleConfirmPopupClose() {
    setIsInstantApproval(false);
    setShowDeleteConfirm(false);
  }

  const formatLabel = (label: string) => {
    if (!label) return '';
    if (typeof label === 'number') return label;

    const key = label.toLowerCase();

    if (key === 'createdbyname') return 'Created by';
    if (key === 'lastupdatedbyname') return 'Last updated by';
    if (key === 'approverstatusname') return 'Approver status';
    if (key === 'lastupdateddate') return 'Last updated on';
    if (key === 'createddate') return 'Created on';
    if (key === 'costcentrename') return 'Cost centre';
    if (key === 'costheadername') return 'Cost header';
    if (key === 'nextapprovername') return 'Next approver';
    const spaced = label
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');

    // Replace underscores (snake_case → snake case)
    const cleaned = spaced.replace(/_/g, ' ');

    // Capitalize first letter of each word
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map((word, index) => {
        if (/gst/i.test(word)) return 'GST';
        if (/tds/i.test(word)) return 'TDS';
        if (/ifsc/i.test(word)) return 'IFSC';
        if (/\bpan/i.test(word)) return 'PAN';
        if (/msme/i.test(word)) return 'MSME';
        if (/accfile/i.test(word)) return 'ACC file';
        if (/aadhar/i.test(word)) return 'AADHAR';
        if (/poc/i.test(word)) return 'POC';
        if (/id/i.test(word)) return 'ID';
        if (/no/i.test(word)) return 'No';

        return index === 0
          ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          : word.toLowerCase();
      })
      .join(' ');
  };

  const DetailItem = ({ row, headcells }: any) => {
    const normalFields: Array<any> = [];
    const objectArrays: Array<any> = [];

    // Separate normal fields and object-array fields
    headcells.forEach((hc: any) => {
      const value = row[hc.id];
      if (
        hc.id.toLowerCase() !== 'vendorType' &&
        hc.id.toLowerCase().includes('id') &&
        hc.id.toLowerCase() !== 'emailid'
      )
        return;
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === 'object'
      ) {
        objectArrays.push({ label: formatLabel(hc.label), value });
      } else {
        normalFields.push({ label: formatLabel(hc.label), value });
      }
    });
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {normalFields.map((item, idx) => (
            <div key={idx}>
              <p className="text-sm text-gray-600 dark:text-gray-500 font-medium">
                {item.label}:
              </p>
              <p className="text-base text-gray-900 dark:text-gray-300 font-semibold mt-1 break-words whitespace-normal">
                {Array.isArray(item.value)
                  ? item.value.join(', ')
                  : formatValue(item.value, item.label) || '-'}
              </p>
            </div>
          ))}
        </div>
        <CustomForm
          initialValues={formFields}
          submitFunction={(data) => onUpdate(data)}
          onClose={() => {}}
          // isTableView={true}
          // fields={expenseFields
          //   .filter((f) => !expenseFieldNames.includes(f.name))
          //   .sort(
          //     (a, b) =>
          //       expenseFieldNames.indexOf(a.name) -
          //       expenseFieldNames.indexOf(b.name),
          //   )}
          options={options}
          styles={{
            pageName: 'Expenses',
            label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
            container:
              'flex h-fit overflow-auto bg-transparent dark:bg-transparent',
            form: 'w-[100%] max-h-[100vh] border rounded-xl backdrop-blur-md p-1 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-hidden',
            grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
            submitButton:
              'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
            cancelButton:
              'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
          }}
          toBackend={toBackend}
          buttonLabel={toBackend ? 'Updating' : 'Update'}
          hide={{
            // label: false,
            button: false,
            container: false,
            form: false,
            cancelButton: true,
            submitButton:
              toBackend ||
              toApprovalBackend ||
              toRejectionBackend ||
              !isAccounts ||
              selectedRow?.approverStatusId !== ApproverStatus.Pending,
          }}
          fields={[
            {
              name: 'costCentreName',
              label: 'Cost Centre',
              type: 'select',
              placeholder: 'Cost Centre',
              // required: true,
              disabled: !isAccounts || disableApprovalFlow,
              //  || toBackend,
              onChange: (_name: string, value: any, form: any) => {
                const costCentreIds = costCentreDropdown
                  .filter((cost: any) => value.includes(cost.costCentreName))
                  .map((cost: any) => cost.costCentreId);

                form.setFieldValue('costCentreName', value);
                form.setFieldValue('costCentreIds', costCentreIds);

                setFormFields((prev: any) => ({
                  ...prev,
                  costCentreName: value,
                  costCentreIds,
                }));
              },
              value: formFields.costCentreName || [],
              styles: {
                wrapper: 'flex flex-col gap-1',
                label: 'text-sm font-medium text-gray-500',
                input:
                  'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
              },
            },
            // {
            //   name: 'siteName',
            //   label: 'Site Name',
            //   type: 'multiSelect',
            //   placeholder: 'Site Name',
            //   required: true,
            //   disabled:
            //     !isAccounts ||
            //     !isPrimaryValidator(APPROVER_CATEGORY.VENDOR_REGISTRATION) ||
            //     toBackend,
            //   onChange: (name: string, value: any, form: any) => {
            //     setFormFields((prev: any) => ({
            //       ...prev,
            //       [name]: value,
            //     }));
            //   },
            //   value: formFields.siteName || [],
            //   styles: {
            //     wrapper: 'flex flex-col gap-1',
            //     label: 'text-sm font-medium text-gray-500',
            //     input:
            //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
            //   },
            // },
            {
              name: 'costHeaderName',
              label: 'Cost Header',
              type: 'select',
              placeholder: 'Cost Header',
              // required: true,
              disabled:
                !isAccounts ||
                disableApprovalFlow ||
                !isPrimaryValidator(APPROVER_CATEGORY.VENDOR_REGISTRATION),
              // || toBackend,
              onChange: (_name, value, form) => {
                form.setFieldValue('costHeaderName', value);

                const ids = costHeaderDropdown
                  .filter((header) => value.includes(header.costHeaderName))
                  .map((header) => header.costHeaderId);

                form.setFieldValue('costHeaderIds', ids);

                setFormFields((prev: any) => ({
                  ...prev,
                  costHeaderName: value,
                  costHeaderIds: ids,
                }));
              },
              value: formFields.costHeaderName || [],
              styles: {
                wrapper: 'flex flex-col gap-1',
                label: 'text-sm font-medium text-gray-500',
                input:
                  'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
              },
            },
            // {
            //   name: 'isHostBook',
            //   label: 'Host Book',
            //   type: 'select',
            //   placeholder: 'Yes / No',
            //   styles: {
            //     wrapper: 'flex flex-col gap-1',
            //     label: 'text-sm font-medium text-gray-500',
            //     input:
            //       'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
            //   },
            // },
          ]}
          label=""
        />
      </div>
    );
  };

  const DetailTable = ({ row, headcells }: { row: any; headcells: any }) => {
    return (
      <div className="w-full max-w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {headcells.map((hc: any) => (
                <th
                  key={hc.id}
                  className={`px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 ${
                    hc.id === 'changes' ? 'w-[50%] max-w-[60%]' : 'w-auto'
                  }`}
                >
                  {hc.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {row?.length > 0 ? (
              row.map((rw: any, rowIndex: number) => (
                <tr key={rowIndex} className="border-b dark:border-gray-700">
                  {headcells.map((hc: any) => (
                    <td
                      key={hc.id}
                      className={`px-4 py-2 text-sm text-gray-800 dark:text-gray-300 ${
                        hc.id === 'changes' ? 'whitespace-pre-line' : ''
                      }`}
                    >
                      {rw[hc.id] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headcells.length}
                  className="px-4 py-3 text-center text-gray-500"
                >
                  No Records Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const [logTabsValue, setLogTabsValue] = useState<any>('details');
  const tabList = [
    {
      value: 'details',
      label: 'Details',
      component: DetailItem,
    },
    {
      value: 'logs',
      label: 'Logs',
      component: DetailTable,
      className:
        'w-full max-w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700',
    },
  ];
  const [tabsValue, setTabsValue] = useState<string>('all');
  useEffect(() => {
    switch (tabsValue) {
      case 'all':
        setTableValue(allVendors);
        break;
      case 'pending':
        setTableValue(() => {
          return allVendors.filter(
            (vendor: any) =>
              vendor.approverStatusId === ApproverStatus.Pending ||
              vendor.approverStatusId === ApproverStatus.InProgress ||
              vendor.approverStatusId === ApproverStatus.Hold,
          );
        });
        break;
      case 'approved':
        setTableValue(() => {
          return allVendors.filter(
            (vendor: any) =>
              vendor.approverStatusId === ApproverStatus.Approved,
          );
        });
        break;
      // case 'partiallyApproved':
      //   setTableValue(() => {
      //     return allVendors.filter(
      //       (vendor: any) =>
      //         vendor.approverStatusId === ApproverStatus.PartiallyApproved,
      //     );
      //   });
      //   break;
      case 'rejected':
        setTableValue(() => {
          return allVendors.filter(
            (vendor: any) =>
              vendor.approverStatusId === ApproverStatus.Rejected,
          );
        });
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsValue, allVendors]);

  const tabsCount = useMemo(() => {
    const all = allVendors.length;

    const pending = allVendors.filter(
      (item: any) =>
        item.approverStatusId === ApproverStatus.Pending ||
        item.approverStatusId === ApproverStatus.InProgress ||
        item.approverStatusId === ApproverStatus.Hold,
    ).length;

    const approved = allVendors.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Approved,
    ).length;

    // const partiallyApproved = allVendors.filter(
    //   (item: any) => item.approverStatusId === ApproverStatus.PartiallyApproved,
    // ).length;

    const rejected = allVendors.filter(
      (item: any) => item.approverStatusId === ApproverStatus.Rejected,
    ).length;

    return { all, pending, approved, rejected };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allVendors]);

  const headcells = useMemo(() => {
    if (!logTableValue) return [];
    if (logTabsValue === 'logs') {
      return [
        { id: 'action', label: 'Action' },
        { id: 'changes', label: 'Changes' },
        { id: 'occuredOn', label: 'Occured On' },
        { id: 'updatedByName', label: 'Updated By' },
      ];
    }

    return Object.keys(logTableValue || {}).map((key) => ({
      id: key,
      label:
        key === 'vendorName'
          ? 'CompanyName'
          : key === 'description'
            ? 'Description'
            : key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }, [logTableValue]);

  const sortByOccurredOnAsc = (data: any) => {
    const parseDate = (str: string) => {
      const [datePart, timePart] = str.split(' ');
      const [day, month, year] = datePart.split('-');
      return new Date(`${year}-${month}-${day} ${timePart}`).getTime();
    };

    return [...data].sort(
      (a, b) => parseDate(b.occuredOn) - parseDate(a.occuredOn),
    );
  };

  function handleLogsTabChange(value: string) {
    setLogTabsValue(value);
    if (value === 'logs') {
      const sorted = sortByOccurredOnAsc(logs);
      console.log(logs, 'logsTxt');
      setLogTableValue(sorted);
    } else if (value === 'details') {
      setLogTableValue(selectedRow);
    }
  }
  const handleDownloadQuotation = (row: Row, headcellId: string) => {
    console.log(headcellId.split('.')[1], 'headcellId');
    let key = '';
    switch (headcellId.split('.')[1]) {
      case 'panFileName':
        key = 'panNoFilepath';
        break;
      case 'msmeFileName':
        key = 'msmeRegistrationFilepath';
        break;
      case 'bankFileName':
        key = 'accountNoFilpath';
        break;
      case 'gstFileName':
        key = 'gstNoFilepath';
        break;
      default:
        break;
    }

    const url = row[key];
    const fileType = url.split('.').pop()?.toLowerCase();

    fileType === 'pdf'
      ? downloadQuotationPdf(url)
      : downloadQuotationExcel(url);
  };
  const clickableColumnList: Array<string> = [
    'vendorCode',
    'view.gstFileName',
    'view.msmeFileName',
    'view.panFileName',
    'view.bankFileName',
  ];

  function handleApprovalModalClose() {
    setIsApprovalModalOpen(false);
    setApprovalModalFields([]);
  }

  enum ApproverStatus {
    Pending = 1,
    InProgress = 2,
    Approved = 3,
    Rejected = 4,
    Paid = 5,
    Overdue = 6,
    Hold = 7,
    PartiallyApproved = 8,
  }

  const handleApproval = async (data: any) => {
    const payload: any = {
      vendorId: logTableValue.vendorId!,
      approvedBy: session.userId,
      isAccounts: session.roleName.toLowerCase() === 'accounts',
      description: data.description,
    };
    console.log(payload, data, 'payload');

    await vendorApproveMutation.mutateAsync(payload);
    search.vendorId &&
      navigate({
        to: '/po/consolidatedDashboard',
        replace: true,
      });
  };

  const handleReject = (data: any) => {
    if (!selectedRow) return;
    const payload: any = {
      vendorId: selectedRow.vendorId!,
      rejectedBy: session.userId,
      levelId: +sessionStorage.getItem('levelId')!,
      description: data.description,
    };
    console.log(payload, 'payload');

    vendorRejectMutation.mutate(payload);
  };

  const handleApprovalModal = (approveStatus: boolean) => {
    // if (
    //   !formFields.costCentreName?.length ||
    //   !formFields.costHeaderName?.length
    // ) {
    //   toast.error('Please enter Cost Header and Cost Center');
    //   return;
    // }

    // if (!isUpdated) {
    //   toast.error('Please click Update before Approving');
    //   return;
    // }

    console.log(
      formFields.costCentreNames,
      formFields,
      formFields.costHeaderNames,
      'testFielsds',
    );

    setIsApproved(approveStatus);
    setIsApprovalModalOpen(true);

    if (approveStatus) {
      setApprovalModalFields([
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          required: false,
          disabled: toBackend,
          onChange: (_name: string, value: any, form: any) => {
            form.setFieldValue('description', value);
          },
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
      ]);
    } else {
      setApprovalModalFields([
        {
          name: 'description',
          label: 'Description',
          type: 'text',
          required: true,
          disabled: toBackend,
          onChange: (_name: string, value: any, form: any) => {
            form.setFieldValue('description', value);
          },
          styles: {
            wrapper: 'flex flex-col gap-1',
            label: 'text-sm font-medium text-gray-500',
            input:
              'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
          },
        },
      ]);
    }
  };

  const isAccounts = useMemo(() => {
    return isPrimaryValidator(APPROVER_CATEGORY.VENDOR_REGISTRATION);
  }, []);

  const shouldBeTrue = useMemo(() => {
    const isNonAccounts = !isAccounts;
    const levelMismatch = !(
      selectedRow &&
      selectedRow.levelId &&
      levelValidator(
        APPROVER_CATEGORY.VENDOR_REGISTRATION,
        +selectedRow.levelId - 1,
        {
          costCentreIds: selectedRow.costCentreIds || [],
          costHeaderIds: selectedRow.costHeaderIds || [],
        },
      )
    );

    const isPending = selectedRow?.approverStatusId === +ApproverStatus.Pending;
    console.log(isNonAccounts, levelMismatch, isPending, 'disableApprovalFlow');

    return (isNonAccounts && levelMismatch) || (isAccounts && !isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRow, isAccounts]);

  const statusId = +(selectedRow?.approverStatusId ?? -1);
  const disableApprovalFlow =
    [
      ApproverStatus.Approved,
      ApproverStatus.Rejected,
      // ApproverStatus.PartiallyApproved,
    ].includes(statusId) ||
    shouldBeTrue ||
    toBackend ||
    toRejectionBackend ||
    toApprovalBackend;

  const tabsHeadcells = [
    {
      id: 'all',
      label: 'All',
      countClassName: 'bg-gray-200 text-gray-800',
    },
    {
      id: 'pending',
      label: 'Pending',
      countClassName: 'bg-yellow-200 text-yellow-800',
    },
    {
      id: 'approved',
      label: 'Approved',
      countClassName: 'bg-green-200 text-green-800',
    },
    // {id: 'partiallyApproved', label: 'Partially Approved'},
    {
      id: 'rejected',
      label: 'Rejected',
      countClassName: 'bg-red-200 text-red-800',
    },
  ];
  const tabsFns = {
    setTabsValue,
  };
  const allTabsValues = {
    tabsValue,
    tabsCount,
    tabsHeadcells,
  };
  return (
    <div className="m-2.5 h-[80%]">
      {vendorQuery.isLoading || toBackend || dropdownLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <section className="w-full h-full flex flex-col">
          <CustomTable
            key={tableValue.length}
            headcells={headCells}
            rows={tableValue}
            pageName="Vendor"
            functions={allFunctions}
            access={{
              hasCreateAccess: hasCreateAccess,
              hasUpdateAccess: hasUpdateAccess,
            }}
            hide={{
              add: !hasCreateAccess,
              filter: false,
              hidden: false,
              download: false,
            }}
            colorCode={true}
            colorCodeLogic={(row, headcellId) => {
              if (headcellId === 'approverStatusName') {
                switch (row.approverStatusId) {
                  case 1:
                    return { backgroundColor: '#FEF9C3', color: '#92400E' };
                  case 2:
                    return { backgroundColor: '#FFEDD5', color: '#9A3412' };
                  case 7:
                    return { backgroundColor: '#EDE9FE', color: '#5B21B6' };
                  case 3:
                    return { backgroundColor: '#DCFCE7', color: '#065F46' };
                  case 4:
                    return { backgroundColor: '#FEE2E2', color: '#991B1B' };
                  case 8:
                    return { backgroundColor: '#DBEAFE', color: '#1E40AF' };
                  default:
                    return { backgroundColor: '#F3F4F6', color: '#374151' };
                }
              }
              return undefined;
            }}
           includedDownloadColumns={includedDownloadColumns}

            customToolbarItems={{
              position: 'before',
              element: <VendorFormLink session={session} />,
            }}
            clickableColumn={clickableColumnList}
            onClick={(row, headcellId) => {
              if (headcellId === 'vendorCode') {
                handleVendorLog(row);
              } else {
                handleDownloadQuotation(row, headcellId);
              }
            }}
            tabsFns={tabsFns}
            allTabsValues={allTabsValues}
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
              label={edit ? 'Update Vendor Details' : 'Create New Vendor'}
              buttonLabel={
                edit
                  ? toBackend
                    ? 'Updating '
                    : 'Update'
                  : toBackend
                    ? 'Submitting '
                    : 'Submit'
              }
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}

      {isApprovalModalOpen && !dropdownLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal
            open={isApprovalModalOpen}
            onClose={() => setIsApprovalModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <CustomForm
              initialValues={{
                expenseId: selectedRow?.expenseId,
                approvedBy: session.userId,
                amountApproved: null,
                description: null,
              }}
              submitFunction={(data) =>
                isApproved ? handleApproval(data) : handleReject(data)
              }
              onClose={() => setIsApprovalModalOpen(false)}
              fields={approvalModalFields!}
              options={{}}
              // isTableView={true}
              styles={formStyles}
              label={isApproved ? 'Approve Vendor' : 'Reject Vendor'}
              buttonLabel={
                isApproved
                  ? toBackend
                    ? 'Approving '
                    : 'Approve'
                  : toBackend
                    ? 'Rejecting '
                    : 'Reject'
              }
              toBackend={toBackend}
            />
          </Modal>
        </div>
      )}

      {isLogOpen && (
        <LogPopup
          open={isLogOpen}
          onClose={handleCloseLog}
          pageName="Vendor"
          row={logTableValue}
          headcells={headcells}
          tabList={tabList}
          tabsValue={logTabsValue}
          onTabChange={(val: string) => handleLogsTabChange(val)}
          toBackend={toBackend}
          footerActions={
            <>
              <Button
                onClick={() => handleApprovalModal(false)}
                disabled={disableApprovalFlow || toRejectionBackend}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                {toRejectionBackend ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </Button>

              <Button
                onClick={() => handleApprovalModal(true)}
                disabled={disableApprovalFlow || toApprovalBackend}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                {toApprovalBackend ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Approve'
                )}
              </Button>

              {isAccounts && (
                <Button
                  onClick={() => handleInstantApprove()}
                  disabled={
                    toInstantApprovalBackend ||
                    toBackend ||
                    selectedRow.levelId != 1 ||
                    selectedRow.approverStatusId !== 1
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                >
                  {toApprovalBackend ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      Instant Approve <Zap />
                    </>
                  )}
                </Button>
              )}
            </>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm || isInstantApproval}
        onClose={handleConfirmPopupClose}
        onConfirm={
          isInstantApproval ? handleApproveUpdate : handleConfirmDelete
        }
        title={isInstantApproval ? 'Instant Approve ' : 'Confirm Deletion'}
        description={
          isInstantApproval
            ? `Are you sure you want to directly approve vendor ${formFields.vendorName}?`
            : `Are you sure you want to delete vendor ${formFields.vendorName}?`
        }
        confirmButtonText={isInstantApproval ? 'Approve' : 'Delete'}
        cancelButtonText="Cancel"
        confirmButtonColor={isInstantApproval ? 'blue' : 'red'}
        disableCancelButton={toInstantApprovalBackend || toBackend}
        disableConfirmButton={toInstantApprovalBackend || toBackend}
      />
    </div>
  );
}
