import { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import { toast } from 'sonner';
import { CustomTable } from '../table/customTable';
import { CustomForm } from '../form/customForm';
import PODetailsModal from './poDetailsModal';
import type { JSX } from 'react';
import type { Field } from '@/types/form';
import type { HeadCell, Row } from '@/types/table';
import { useLocation } from '@tanstack/react-router';
import type { BaseProps, siteDropdownType } from '@/types/common';
import type {
  PurchaseOrderDTO,
  PurchaseOrderUpdateDTO,
} from '@/models/purchaseOrderDTO';
import Loader from '@/utils/common/components/loader';
import {
  useMutationFn,
  useQueriesFn,
  useQueriesFnWithId,
} from '@/utils/common/queryUtils';
import { ConfirmationModal } from '@/utils/common/components/ConfirmationModal';
import { formatDate } from '@/utils/common/DateUtil';
import {
  PurchaseOrderQuery,
  PurschaseOrderService,
} from '@/integrations/Services/purchaseOrderService';
import {
  POInstallmentQuery,
  poInstallmentServices,
} from '@/integrations/Services/poInstallmentServices';
import { PaymentTermServices } from '@/integrations/Services/paymentTermServices';
import {
  VendorQuery,
  VendorServices,
} from '@/integrations/Services/vendorServices';
import {
  ApprovalQuery,
  ApprovalServices,
} from '@/integrations/Services/approvalService';
import { purchaseListServices } from '@/integrations/Services/purchaseListServices';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';

interface PurchaseOrderProps extends BaseProps {}

export default function PoPage(props: PurchaseOrderProps): JSX.Element {
  const { GetSiteListDropdownByCompany, GetSiteListDropdownByCustomer } =
    EirasaasAPIs;
  const { GET_SITELIST_BY_COMPANY, GET_SITELIST_BY_CUSTOMER } =
    EIRASAAS_API_QUERIES;
  const { FetchAllPaymentTerms } = PaymentTermServices;
  interface Vendor {
    vendorId: number;
    vendorName: string;
    vendorCode?: string;
  }
  interface payment {
    paymentTermsId: number;
    paymentTermsName: string;
    noOfInstallments: number;
  }

  type Request = {
    requestId: number;
    requestorName: string;
    requestCode: string;
  };

  const defaultValues = {
    poNumber: '',
    category: '',
    siteName: '',
    vendorCode: '',
    vendorName: '',
    povalueExcludeGst: 0,
    gstValue: 0,
    gstPercentage: 0,
    tdsValue: 0,
    tdsPercent: 0,
    paymentTermsName: '',
    totalInvoiceValue: 0,
    amountPaid: 0,
    balancePayable: 0,
    poDate: '',
    lastPaymentDate: '',
    requestorId: '',
  };
  // Role variables from props
  const { hasCreateAccess, hasUpdateAccess, session } = props;

  const [formFields, setFormFields] = useState<any>(defaultValues);
  const [isOpen, setIsOpen] = useState(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [allVendor, setAllVendor] = useState<Array<Vendor>>([]);
  const [siteDropdown, setSiteDropdown] = useState<Array<siteDropdownType>>([]);
  const [selectedPO, setSelectedPO] = useState<string>('');
  const [selectedPOId, setSelectedPOId] = useState<string>('');
  const [installmentsByPO, setInstallmentsByPO] = useState([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState<Array<payment>>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [poToDeleteId, setPoToDeleteId] = useState<string | null>(null);
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const [allPOs, setAllPOs] = useState([]);
  const [isPay, setisPay] = useState(false);
  const [showPODetails, setShowPODetails] = useState(false);
  const [poDetails, setPoDetails] = useState<any>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [requestorDropdown, setRequestorDropdown] = useState<Array<Request>>(
    [],
  );

  const headCells: Array<HeadCell> = [
    {
      id: 'poNumber',
      label: 'PO Number',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'text',
    },
    {
      id: 'category',
      label: 'Category',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['Goods', 'Service'],
    },
    {
      id: 'siteName',
      label: 'Site Name',
      defaultView: false,
      view: false,
      filterable: true,
      filterType: 'select',
      filterOptions: siteDropdown.map((site) => site.siteName)
    },
    {
      id: 'vendorCode',
      label: 'Vendor Code',
      defaultView: true,
      view: false,
      filterable: false,
      filterType: 'text',
    },
    {
      id: 'vendorName',
      label: 'Vendor Name',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: allVendor.map((vendor) => vendor.vendorName),
    },
    {
      id: 'paymentTermsName',
      label: 'Payment Terms',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'select',
      filterOptions: allPaymentTerms.map((payment) => payment.paymentTermsName),
    },
    {
      id: 'povalueExcludeGst',
      label: 'PO Value Ex-GST',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'gstPercentage',
      label: 'GST %',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'gstValue',
      label: 'GST Value',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'tdsPercent',
      label: 'TDS %',
      defaultView: true,
      view: true,
      filterable: true,
    },
    {
      id: 'tdsValue',
      label: 'TDS Value',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'totalInvoiceValue',
      label: 'Total Invoice',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'balancePayable',
      label: 'Balance Payable',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'amountPaid',
      label: 'Amount Paid',
      defaultView: true,
      view: true,
      filterable: true,
      filterType: 'range',
    },
    {
      id: 'poDate',
      label: 'Po Date',
      defaultView: true,
      view: false,
      filterable: true,
      filterType: 'dateRange',
    },
    { id: 'action', label: 'Action', view: true, filterable: true },
  ];
  const isOEM = session.userTypeName === 'OEM';

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const poId = queryParams.get('poId');


  // useEffect(() => {
  //   if (poId && allPOs.length > 0) {
  //     const filtered = allPOs.filter((po) => String(po.poId) === poId);
  //     setTableValue(filtered);
  //   } else {
  //     setTableValue(allPOs);
  //   }
  // }, [poId, allPOs]);
const isLoadingData = !allPOs.length || !siteDropdown.length;

useEffect(() => {
  if (isLoadingData) return; // don’t set table yet

  const siteMap: Record<number, string> = {};
  siteDropdown.forEach((site: any) => {
    siteMap[site.siteId] = site.siteName ?? `Site ${site.siteId}`;
  });

  const enrichedPOs = allPOs.map((po) => ({
    ...po,
    siteName: siteMap[po.siteId] ?? `Site ${po.siteId}`,
  }));

  setTableValue(
    poId ? enrichedPOs.filter((po) => String(po.poId) === poId) : enrichedPOs
  );
}, [poId, allPOs, siteDropdown]);


  const { isLoading, isError } = useQueriesFn([
    {
      queryKey: PurchaseOrderQuery.GET_ALL_PO_DETAILS + 'po',
      api: PurschaseOrderService.FetchAllPoDetails,
      setState: setAllPOs,
    },
    {
      queryKey: VendorQuery.GET_ALL_VENDOR_DROPDOWN + 'po',
      api: VendorServices.FetchAllVendorsDropdown,
      setState: setAllVendor,
    },
    {
      queryKey: PurchaseOrderQuery.GET_ALL_PAYMENTTERMS + 'po',
      api: FetchAllPaymentTerms,
      setState: setAllPaymentTerms,
    },
    {
      queryKey: isOEM ? GET_SITELIST_BY_COMPANY  + 'po' : GET_SITELIST_BY_CUSTOMER  + 'po',
      api: isOEM
        ? GetSiteListDropdownByCompany
        : GetSiteListDropdownByCustomer,
      setState: setSiteDropdown,
      id: isOEM ? session.companyId : session.customerId,
    },
  ]);
  const requestorListQuery = [
    {
      queryKey: ApprovalQuery.GET_REQUESTORCODE_DROPDOWN_BY_SITE  + 'po',
      api: ApprovalServices.fetchRequestorCodeDropdownBySite,
      setState: setRequestorDropdown,
      id: selectedSiteId,
    },
  ];
  useQueriesFnWithId(requestorListQuery);


  

  const putMutation = useMutationFn(
    PurschaseOrderService.UpdatePurchaseOrderById,
    PurchaseOrderQuery.GET_ALL_PO_DETAILS + 'po',
  );
  const postMutation = useMutationFn(
    PurschaseOrderService.AddNewPurchaseOrder,
    PurchaseOrderQuery.GET_ALL_PO_DETAILS + 'po',
  );
  const paymentMutation = useMutationFn(
    PurschaseOrderService.updatePaymentById,
    PurchaseOrderQuery.GET_ALL_PO_DETAILS + 'po',
  );
  const deleteMutation = useMutationFn(
    PurschaseOrderService.DeletePurchaseOrderById,
    PurchaseOrderQuery.GET_ALL_PO_DETAILS + 'po',
  );



  async function getInstallemtForm(row: string) {
    try {
      const response = await poInstallmentServices.fetchInstallmentsByPoId(
        row.poId,
      );
      function getInstallment(value) {
        const installmentCount = Object.keys(value).filter((key) =>
          key.includes('installment'),
        ).length;
        for (let i = 0; i <= installmentCount; i++) {
          if (value[`status${i}`] == 1) {
            return {
              amount: value[`installment${i}`],
              status: i,
            };
          }
        }
      }
      const amount = getInstallment(response[0]);
      if (amount === undefined) {
        return null;
      }
      setFormFields({
        ...row,
        installmentAmount: amount.amount,
        installmentStatus: amount.status,
      });
      setisPay(true);
      setIsOpen(true);
      return response;
    } catch (error) {
      console.error('Error fetching installments by id:', error);
    }
  }
  const getInstallmentQuery = [
    {
      queryKey: POInstallmentQuery.GET_INSTALLMENTS_BY_PO_ID + 'po',
      api: getInstallemtForm,
      setState: setInstallmentsByPO,
      id: selectedPO,
    },
      {
      queryKey: POInstallmentQuery.GET_INSTALLMENTS_BY_PO_ID + 'poID',
      api: poInstallmentServices.fetchInstallmentsByPoId,
      setState: setInstallmentsByPO,
      id: selectedPOId,
    },
  ];
const { isLoading: installmentLoading } = useQueriesFnWithId(getInstallmentQuery);


  const transformInstallments = (data: any) => {
    const installments = [];
    for (let i = 1; i <= 6; i++) {
      const amount = data[`installment${i}`];
      const payReference = data[`payReference${i}`];
      const paymentDate = data[`paymentDate${i}`];
      const status = data[`status${i}`];
      const dueDate = data[`dueDate${i}`];
      const overdueDays = data[`overdueDays${i}`];

      if (amount !== null && amount !== undefined) {
        installments.push({
          amount,
          payReference,
          paymentDate,
          dueDate,
          status:
            status === 5
              ? 'Paid'
              : status === 1
                ? 'Pending'
                : status === 6
                  ? 'Overdue'
                  : null,
          overdueDays,
        });
      }
    }
    return installments;
  };


  const handlePoNumberClick = (row: Row) => {
    setSelectedPOId(row.poId);
    setPoDetails(row);
    setShowPODetails(true); 
  };

  function extractPurchaseIds(
    purchases: Array<{ purchaseId: number }>,
  ): Array<number> {
    return purchases.map((p) => p.purchaseId);
  }

  async function onSubmit(data: PurchaseOrderDTO): Promise<void> {
    try {
      const selectedVendor = allVendor.find(
        (v) => v.vendorName === data.vendorName,
      );
      const selectedPaymentTerm = allPaymentTerms.find(
        (pt) => pt.paymentTermsName === data.paymentTermsName,
      );

      const { vendorName, vendorCode, paymentTermsName, ...restData } = data;

      const requestor = requestorDropdown.find((req) => {
        const match = data.requestorId.toString().match(/\(([^)]+)\)/);
        const valueInsideParentheses = match ? match[1] : null;
        return req.requestCode == valueInsideParentheses;
      });

      if (!requestor) {
        toast.error(`Requestor "${data.requestorId}" not found.`);
      }

      const reqID = requestor!.requestId;

      const purchases = await purchaseListServices.fetchPurchaseListByReqId(
        String(reqID),
      );

      if (!purchases || purchases.length === 0) {
        toast.error(`No purchases found for requestor ID ${reqID}.`);
      }

      const purchaseIds = extractPurchaseIds(purchases);

      const payload: PurchaseOrderDTO = {
        ...restData,
        vendorId: selectedVendor?.vendorId || 0,
        paymentTermsId: selectedPaymentTerm?.paymentTermsId ?? 0,
        povalueExcludeGst: Number(data.povalueExcludeGst),
        gstValue: Number(data.gstValue),
        gstPercentage: Number(data.gstPercentage),
        tdsValue: Number(data.tdsValue),
        tdsPercent: Number(data.tdsPercent),
        totalInvoiceValue: Number(data.totalInvoiceValue),
        balancePayable: Number(data.totalInvoiceValue),
        amountPaid: Number(data.amountPaid),
        lastPaymentDate: '',
        poDate: formatDate(
          data.poDate || new Date().toISOString(),
          'yyyy-mm-dd',
        ),
        createdBy: session.userId,
        lastUpdatedBy: session.userId,
        status: 1,
        requestorId: reqID,
        siteId:
          siteDropdown.find((site) => site.siteName === data.siteName)
            ?.siteId || 0,
        purchaseId: purchaseIds,
      };

      console.log(new Date(data.poDate).toLocaleDateString());
      console.log('Data before validation:', payload);

      postMutation.mutate(
        { purchaseOrder: payload },
        {
          onSuccess: () => {
            toast.success('PO added successfully!');
            setIsOpen(false);
            setFormFields(defaultValues);
          },
          onError: (error: any) => {
            toast.error(`Failed to add PO: ${error.message || error}`);
            setFormFields(defaultValues);
          },
        },
      );
    } catch (error: any) {
      toast.error(
        `Error submitting PO: ${error.message || 'Unexpected error'}`,
      );
      console.error('Submit error:', error);
    }
  }

  async function onUpdate(data: PurchaseOrderUpdateDTO): Promise<void> {
    const selectedVendor = allVendor.find(
      (v) => v.vendorName === data.vendorName,
    );
    const selectedPaymentTerm = allPaymentTerms.find(
      (pt) => pt.paymentTermsName === data.paymentTermsName,
    );
    const poID = data.poId;
    console.log(selectedPaymentTerm);
    console.log(selectedVendor);
    console.log(poID);
    const {
      vendorName, // remove
      vendorCode, // remove
      paymentTermsName,
      poId, // remove
      ...restData // keep the rest
    } = data;
    // const requestor = requestorDropdown.find(
    //   (r) => (r.requestorName as any) === data.requestorId,
    // );
    const requestor = requestorDropdown.find((req) => {
        const match = data.requestorId.toString().match(/\(([^)]+)\)/);
        const valueInsideParentheses = match ? match[1] : null;
        return req.requestCode == valueInsideParentheses;
      });

    if (!requestor) {
      toast.error(`Requestor "${data.requestorId}" not found.`);
    }

    const reqID = requestor!.requestId;

    const purchases = await purchaseListServices.fetchPurchaseListByReqId(
      String(reqID),
    );

    if (!purchases || purchases.length === 0) {
      toast.error(`No purchases found for requestor ID ${reqID}.`);
    }

    const purchaseIds = extractPurchaseIds(purchases);

    const payload: PurchaseOrderUpdateDTO = {
      ...restData,
      vendorId: selectedVendor?.vendorId || 0,
      paymentTermsId: selectedPaymentTerm?.paymentTermsId ?? 0,
      // Ensure numeric fields are numbers, even if CustomForm sends them as strings
      povalueExcludeGst: Number(data.povalueExcludeGst),
      gstValue: Number(data.gstValue),
      gstPercentage: Number(data.gstPercentage),
      tdsValue: Number(data.tdsValue),
      tdsPercent: Number(data.tdsPercent),
      totalInvoiceValue: Number(data.totalInvoiceValue),
      balancePayable: Number(data.totalInvoiceValue),
      amountPaid: Number(data.amountPaid),
      lastPaymentDate: '',
      poDate: formatDate(data.poDate || new Date().toISOString(), 'yyyy-mm-dd'),
      // Default values for new entries as per DTO
      createdBy: session.userId,
      lastUpdatedBy: session.userId,
      status: data.status,
      requestorId: reqID,
      purchaseId: purchaseIds,
      siteId:
        siteDropdown.find((site) => site.siteName === data.siteName)?.siteId ||
        0,
    };
    console.log('Data before validation:', payload);
    putMutation.mutate(
      { purchaseOrderId: poID?.toString() || '', purchaseOrder: payload },
      {
        onSuccess: () => {
          toast.success('PO updated successfully!');
          setIsOpen(false);
          setFormFields(defaultValues);
        },
        onError: (error: any) => {
          toast.error(`Failed to update PO: ${error.message || error}`);
          setFormFields(defaultValues);
        },
      },
    );
  }


  function onPayment(data: any): void {
    const {
      installmentAmount,
      payReference,
      paymentDate,
      amountPaid,
      balancePayable,
      paymentTermsId,
      ...rest
    } = data;

    const changedValue = {
      ...rest,
      ...installmentsByPO[0], // old values first
      paymentTermId: paymentTermsId,
      amountPaid: amountPaid + installmentAmount, // overwrite with new calculated
      balancePayable: balancePayable - installmentAmount, // overwrite with new calculated
      [`installmentAmount${data.installmentStatus}`]: installmentAmount,
      [`payReference${data.installmentStatus}`]: payReference,
      [`paymentDate${data.installmentStatus}`]: formatDate(
        paymentDate || new Date().toISOString(),
        'yyyy-mm-dd',
      ),
      [`status${data.installmentStatus}`]: 5,
      status: 1,
    };

    // const valueDate = {
    //   ...data,
    //   ...changedValue,
    // };
    console.log(changedValue, 'changedValudatae');
    // const response = updateNextInstallment(installmentsByPO, changedValue);
    paymentMutation.mutate(changedValue, {
      onSuccess: () => {
        toast.success('Payment added successfully!');
        setIsOpen(false);
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        toast.error(`Failed to add payment: ${error.message || error}`);
      },
    });
  }
  const fields: Array<Field> = [
    {
      name: 'poNumber',
      label: 'Po Number',
      type: 'text',
      placeholder: 'Po Number',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      placeholder: 'Category',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'siteName',
      label: 'Site Name',
      type: 'select',
      placeholder: 'Site Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (name: string, value: any) => {
        const selectedSite: any = siteDropdown.find(
          (s) => s.siteName === value,
        );
        if (selectedSite.length) return;
        const siteId = selectedSite?.siteId ?? '';
        setRequestorDropdown([]);
        setFormFields((prev: typeof defaultValues) => ({
          ...prev,
          [name]: value,
        }));
        setSelectedSiteId(siteId);
      },
    },
    {
      name: 'requestorId',
      label: 'Requestor',
      type: 'select',
      placeholder: !selectedSiteId ? 'Select Site' : 'Select Requestor',
      disabled: !selectedSiteId,
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'vendorName',
      label: 'Vendor Name',
      type: 'select',
      placeholder: 'Vendor Name',
      required: true,
      onChange: (name: string, value: any, form: any) => {
        const selectedVendor = allVendor.find((v) => v.vendorName === value);
        const vendorCode = selectedVendor?.vendorCode ?? '';

        setFormFields((prev: typeof defaultValues) => ({
          ...prev,
          [name]: value,
          vendorCode: vendorCode,
        }));
        form.setFieldValue('vendorCode', vendorCode);
      },

      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'vendorCode',
      label: 'Vendor Code',
      value: formFields.vendorCode,
      type: 'text',
      disabled: true,
      placeholder: 'Vendor Code',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'poDate',
      label: 'Po Date',
      type: 'date',
      placeholder: 'Po Date',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'povalueExcludeGst',
      label: 'Po Value Ex-GST',
      type: 'number',
      placeholder: 'Po Value',
      onChange: (name: string, value: string, form: any) => {
        handleCalculation(name, value, form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'gstPercentage',
      label: 'GST %',
      type: 'number',
      placeholder: 'GST %',
      onChange: (name: string, value: string, form: any) => {
        handleCalculation(name, value, form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'gstValue',
      label: 'GST Value',
      type: 'number',
      placeholder: 'GST',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'tdsPercent',
      label: 'TDS %',
      type: 'number',
      placeholder: 'TDS',
      onChange: (name: string, value: string, form: any) => {
        handleCalculation(name, value, form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'tdsValue',
      label: 'TDS Value ',
      type: 'number',
      disabled: true,
      placeholder: 'TDS Value',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'paymentTermsName',
      label: 'Payment Terms',
      type: 'select',
      placeholder: 'Payment Terms',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'totalInvoiceValue',
      label: 'Total Invoice',
      type: 'number',
      placeholder: 'Total Invoice',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];

  const payFields: Array<Field> = [
    {
      name: 'poNumber',
      label: 'Po Number',
      type: 'text',
      disabled: true,
      placeholder: 'Po Number',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'totalInvoiceValue',
      label: 'Total Invoice',
      type: 'number',
      placeholder: 'Total Invoice',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'amountPaid',
      label: 'Amount Paid',
      type: 'number',
      disabled: true,
      placeholder: 'Total Invoice',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'balancePayable',
      label: 'BalancePayable',
      type: 'number',
      disabled: true,
      placeholder: 'BalancePayable',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'paymentTermsName',
      label: 'Payment Terms',
      type: 'select',
      placeholder: 'Payment Terms',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    {
      name: 'installmentAmount',
      label: 'Installment Amount',
      type: 'text',
      disabled: true,
      placeholder: 'Installment Amount',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },

    {
      name: 'payReference',
      label: 'Payment Reference',
      type: 'text',
      placeholder: 'Payment Reference',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'paymentDate',
      label: 'Payment Date',
      type: 'date',
      placeholder: 'Payment Terms',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
      onChange: (name: string, value: any) => {
        setFormFields((prev: typeof defaultValues) => ({
          ...prev,
          [name]: value,
        }));
      },
    },
  ];
  const options = {
    category: ['Goods', 'Service'],
    paymentTermsName: allPaymentTerms.map((e) => e.paymentTermsName),
    vendorName: allVendor.map((vendor) => vendor.vendorName),
    siteName: siteDropdown.map((site) => site.siteName),
    requestorId: requestorDropdown.map(
      (requestor) => `${requestor.requestorName} (${requestor.requestCode})`,
    ),
  };


  const formStyles = {
    pageName: 'Vendor',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent ',
    form: 'w-[60%] max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-[var(--primary)] dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

const handleCalculation = (_name: string, _value: string, form: any) => {
  const poValue = Number(form.getFieldValue('povalueExcludeGst'));
  const gst = Number(form.getFieldValue('gstPercentage'));
  const tds = Number(form.getFieldValue('tdsPercent'));

  let gstAmount = 0;
  let tdsAmount = 0;

  if (!isNaN(poValue) && !isNaN(gst)) {
    gstAmount = Math.round((poValue * gst) / 100 * 100) / 100;
    form.setFieldValue('gstValue', gstAmount);
  }

  const totalBeforeTds = Math.round((poValue + gstAmount) * 100) / 100;

  if (!isNaN(tds)) {
    tdsAmount = Math.round((poValue * tds) / 100 * 100) / 100;
    form.setFieldValue('tdsValue', tdsAmount);
    form.setFieldValue('totalInvoiceValue', Math.round((totalBeforeTds - tdsAmount) * 100) / 100);
  } else {
    form.setFieldValue('totalInvoiceValue', totalBeforeTds);
  }
};

  const handleOpen = () => {
    setFormFields(defaultValues); // Reset form fields for new entry
    setEdit(false); // Ensure it's in add mode
    setIsOpen(true);
  };
  const handleClose = () => {
    setSelectedSiteId('');
    setFormFields(defaultValues);
    setSelectedPO('');
    setisPay(false);
    setIsOpen(false);
    setEdit(false); // Ensure edit mode is off when closing
    setPoToDeleteId(null); // Clear vendorToDeleteId
    setShowDeleteConfirm(false); // Hide delete confirm modal
  };
  const handleClosePODetailsModal = () => {
    setSelectedPO('');
    setisPay(false);
    setIsOpen(false);
    setEdit(false);

    setShowPODetails(false);
  }; // Function to close the handleClosePODetailsModal
  const handleConfirmDelete = () => {
    if (poToDeleteId) {
      deleteMutation.mutate(
        { purchaseOrderId: poToDeleteId },
        {
          onSuccess: () => toast.success('PO deleted successfully!'),
          onError: (error: any) =>
            toast.error(`Failed to delete PO: ${error.message || error}`),
          onSettled: () => {
            setPoToDeleteId(null); // Clear ID after mutation
            setShowDeleteConfirm(false); // Close confirmation modal
          },
        },
      );
    }
  };
 
  // When edit is clicked, set selectedRow but do NOT open the modal yet
const [selectedRow, setSelectedRow] = useState<Row | null>(null);

// Then, useEffect waits for dropdowns + selectedRow
useEffect(() => {
  if (
    selectedRow &&
    requestorDropdown.length > 0 &&
    siteDropdown.length > 0
  ) {
    const matchedRequestor = requestorDropdown.find(r => r.requestId === selectedRow.requestorId);
    const formattedRequestor = matchedRequestor
      ? `${matchedRequestor.requestorName} (${matchedRequestor.requestCode})`
      : '';

    setFormFields(prev => ({
      ...prev,
      ...selectedRow,
      siteName: siteDropdown.find(site => site.siteId === selectedRow.siteId)?.siteName,
      requestorId: formattedRequestor,
    }));

    setIsOpen(true);
    setEdit(true);
    setSelectedRow(null); // clean up
  }
}, [selectedRow, requestorDropdown, siteDropdown]);

  function handleOptionClick(option: string, row: Row) {
    if (option === 'Delete') {
      setPoToDeleteId(row.poId?.toString() || null);
      setFormFields(row);
      setShowDeleteConfirm(true);
    } else if (option === 'Edit') {
      if(row.amountPaid > 0){
        toast.warning('Cannot edit paid PO!');
        return;
      };
      setSelectedRow(row);
      setSelectedSiteId(row.siteId);
    } else if (option === 'Pay') {
  if (row.poId === selectedPO) {
    if (row.balancePayable === 0) {
      toast.warning('All installments paid!');
      return;
    }
    setisPay(true);
    setIsOpen(true);
  } else {
    setSelectedPO(row);

    // ✅ Add this check here
    if (row.balancePayable === 0) {
      toast.warning('All installments paid!');
      return;
    }

    setisPay(true);
    setIsOpen(true);
  }

  setFormFields({
    ...row,
    paybale: installmentsByPO,
  });

  console.log(installmentsByPO, 'installmentsByPO');
}
  }
  const allFunctions = {
    addFn: handleOpen,
    optionHandler: (option: any, row: any) => handleOptionClick(option, row),
  };
  console.log(formFields, 'formFields');

  return (
    <div className="m-2.5">
      {isLoading && <Loader />}
      {/* {isError && <div>Error fetching data</div>} */}
      {!isLoading && !isError && (
        <CustomTable
          pageName="Purchase Order"
          headcells={headCells}
          rows={tableValue}
          functions={allFunctions}
          access={{
            hasCreateAccess: hasUpdateAccess,
            hasUpdateAccess: hasCreateAccess,
          }}
          hide={{
            add: !hasCreateAccess,
            filter: false,
            hidden: false,
            download: false,
          }}
          editOptions={['Edit', 'Pay']}
          onClick={handlePoNumberClick}
          clickableColumn="poNumber"
        />
      )}

      {isOpen && !showPODetails && (
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
                edit ? onUpdate(data) : isPay ? onPayment(data) : onSubmit(data)
              }
              onClose={handleClose}
              fields={isPay ? payFields : fields}
              options={options}
              styles={formStyles}
              label={
                edit
                  ? 'Update PO Details'
                  : isPay
                    ? `Pay Installment ${formFields.installmentStatus || ''}`
                    : 'Create New PO'
              }
              buttonLabel={edit ? 'Update' : isPay ? 'Pay' : 'Submit'}
            />
          </Modal>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description={`Are you sure you want to delete PO ${formFields.poNumber}?`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
      {/* PO details modal */}

      {showPODetails && (
        <PODetailsModal
          po={poDetails} // Pass the fetched PO details object
         installments={installmentsByPO?.length ? transformInstallments(installmentsByPO[0]) : []}
          loadingInstallments={installmentLoading}
          onClose={handleClosePODetailsModal}
        />
      )}
    </div>
  );
}