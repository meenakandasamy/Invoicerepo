import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { CustomExpenseForm } from './customExpenseForm';
import type { Field } from '@/types/form';
import type { ExpenseDTOType } from '@/utils/Validators/schema/ExpeneseSchema';
import type { vendorDropdownType } from '@/types/requestor';
import { useResetFormStore } from '@/stores/resetFormStore';
import { useApproverCategory } from '@/hooks/data/useApproverCategory';
import {
  ExpenseQueries,
  ExpenseServices,
} from '@/integrations/Services/expenseService';
import { useVendorDropdown } from '@/hooks/data/useVendor';

const ExpenseForm = ({
  isValidForm,
}: {
  userId: string;
  hashingKey: string;
  isValidForm: boolean;
}) => {
  const ApproverCategoryQuery = useApproverCategory();
  const VendorQuery = useVendorDropdown();

  const categoryDropdown = useMemo(
    () => ApproverCategoryQuery.data ?? [],
    [ApproverCategoryQuery.data],
  );
  const vendorDropdown = useMemo(
    () => VendorQuery.data ?? [],
    [VendorQuery.data],
  );

  const defaultValues = {
    createdDate: '',
    lastUpdatedDate: '',

    expenseId: 0,
    expenseReqCode: '',

    vendorId: 0,
    vendorName: '',

    categoryId: 0,
    categoryName: '',

    remarks: '',

    totalAmmountNoGst: 0,
    gstPercentage: 0,
    totalValue: 0,
    advancePaid: 0,

    costCentreIds: [],
    costCentreNames: [],

    costHeaderIds: [],
    costHeaderNames: [],

    siteIds: [],
    siteNames: [],

    invoiceFilePath: null,
    poLoiFilePath: null,
    wcrFilePath: null,
    ticketReportFilePath: null,

    approverStatusId: 0,
    approverStatusName: null,

    createdBy: 0,
    lastUpdatedBy: null,

    invoiceNo: '',
    invoiceDate: '',

    tdsPercentage: null,
    tdsAmount: null,

    advanceId: null,
    advanceConsumed: null,

    amountApproved: 0,
    amountPayable: 0,

    invoice_fileType: null,
    po_loi_fileType: null,
    wcr_fileType: null,
    ticket_report_fileType: null,

    invoiceFileType: null,
    poLoiFileType: null,
    wcrFileType: null,
    ticketReportFileType: null,
    finalAmount: null,
    expenseSplits: null,
  };
  const [formFields, setFormFields] = useState<any>(defaultValues);
  const [categoryName, setCategoryName] = useState<string>('');

  const computeTotals = (form: any) => {
    const totalNoGst = Number(form.getFieldValue('totalAmmountNoGst') || 0);
    const gst = Number(form.getFieldValue('gstPercentage') || 0);
    const gstAmount = (totalNoGst * gst) / 100;

    form.setFieldValue('totalValue', (totalNoGst + gstAmount).toFixed(2));
  };

  const [isValidVendor, setIsValidVendor] = useState(false);
  const [vendorHasGST, setVendorHasGST] = useState(false);

  const validateVendorEmail = debounce(
    (
      value: string,
      vd: Array<vendorDropdownType>,
      setState: (v: boolean) => void,
    ) => {
      // Check vendor exists
      const vendorExists = vd.find(
        (v) => v.emailId === value || v.vendorName === value,
      );

      setState(!!vendorExists);
      if (!vendorExists) {
        toast.error('Vendor does not exist or not verified yet.');
      }

      if (vendorExists) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        setVendorHasGST(
          vendorExists.gstNo !== null && vendorExists.gstNo !== '',
        );
      }
    },
    1000, // 1s delay
  );
  const expenseFields: Array<Field> = [
    {
      name: 'vendorName',
      label: 'Vendor Email',
      type: 'text',
      placeholder: 'Enter Vendor Email',
      required: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('vendorName', value);
        validateVendorEmail(value, vendorDropdown, setIsValidVendor);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'categoryName',
      label: 'Category',
      type: 'select',
      placeholder: 'Select Category',
      required: true,
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('categoryName', value);
        form.setFieldValue(
          'categoryId',
          categoryDropdown.find((c) => c.categoryName === value)?.categoryId,
        );
        setCategoryName(value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'invoiceNo',
      label: 'Invoice No',
      type: 'text',
      placeholder: 'Enter Invoice Number',
      required: true,
      disabled: !isValidVendor,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'invoiceDate',
      label: 'Invoice Date',
      type: 'date',
      placeholder: 'Select Invoice Date',
      required: true,
      disabled: !isValidVendor,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },

    {
      name: 'totalAmmountNoGst',
      label: 'Total Amount (excl. GST)',
      type: 'number',
      placeholder: 'Enter total amount without GST',
      required: true,
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('totalAmmountNoGst', value);
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'gstPercentage',
      label: 'GST %',
      type: 'number',
      placeholder: 'Enter GST %',
      required: true,
      disabled: !isValidVendor || vendorHasGST,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('gstPercentage', value);
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'totalValue',
      label: 'Total Value',
      type: 'number',
      placeholder: 'Enter total value',
      required: true,
      disabled: true,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('totalValue', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'advancePaid',
      label: 'Advance Paid',
      type: 'number',
      placeholder: 'Enter advance paid',
      required: true,
      disabled: !isValidVendor,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('advancePaid', value);
        computeTotals(form);
      },
    },
    // {
    //     name: 'amountPayable',
    //     label: 'Amount Payable',
    //     type: 'number',
    //     placeholder: 'Enter total value',
    //     required: true,
    //     disabled: true,
    //     onChange: (_name: string, value: any, form: any) => {
    //         form.setFieldValue('amountPayable', value);
    //     },
    //     styles: {
    //         wrapper: 'flex flex-col gap-1',
    //         label: 'text-sm font-medium text-gray-500',
    //         input:
    //             'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
    //     },
    // },
    {
      name: 'remarks',
      label: 'Description',
      type: 'text',
      placeholder: 'Remarks',
      required: true,
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('remarks', value);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'invoiceFilePath',
      label: 'Invoice File (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('invoiceFilePath', value[0].file.name);
        form.setFieldValue('invoiceFileType', value[0].file.type.split('/')[1]);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    {
      name: 'poLoiFilePath',
      label: 'PO/LOI File (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('poLoiFilePath', value[0].file.name);
        form.setFieldValue('poLoiFileType', value[0].file.type.split('/')[1]);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    {
      name: 'wcrFilePath',
      label: 'Work Completion / Signed Report (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('wcrFilePath', value[0].file.name);
        form.setFieldValue('wcrFileType', value[0].file.type.split('/')[1]);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    {
      name: 'ticketReportFilePath',
      label: 'Ticket Closure Report (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: categoryName.toLowerCase().includes('service'),
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('ticketReportFilePath', value[0].file.name);
        form.setFieldValue(
          'ticketReportFileType',
          value[0].file.type.split('/')[1],
        );
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
  ];

  const [toBackend, setToBackend] = useState<boolean>(false);
  const { reset } = useResetFormStore();
  useEffect(() => {
    if (reset) {
      setFormFields(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  // POST Mutation
  const createExpenseMutation = useMutation({
    mutationKey: [ExpenseQueries.CREATE_EXPENSE],
    mutationFn: async (data: any) => {
      setToBackend(true);
      return await ExpenseServices.createExpense(data);
    },
    onSuccess: () => {
      toast.success('Expense added successfully!');
      setFormFields(defaultValues);
      setToBackend(false);
      window.location.reload();
    },
    onError: (error: any) => {
      console.error(error);
      setToBackend(false);
      toast.error(`Failed to add expense`);
    },
  });
  function submitFunction(data: any) {
    const vendor = vendorDropdown.find((v) => v.emailId === data.vendorName);
    if (!vendor) {
      toast.error('Vendor not found or unverified');
      return;
    }
    const formData: ExpenseDTOType = {
      ...data,
      vendorId: vendor.vendorId,
      createdBy: 1,
      lastUpdatedBy: 1,
      levelId: 1,
      invoiceDate: format(data.invoiceDate, "yyyy-MM-dd'T'HH:mm:ss"),
    };

    // Here you can call your API to save the vendor data
    console.log('Form Data Submitted:', deepClean(formData));

    createExpenseMutation.mutate(deepClean(formData));
  }

  function deepClean(obj: any): any {
    if (Array.isArray(obj)) {
      const cleanedArray = obj
        .map((item) => deepClean(item))
        .filter(
          (item) =>
            item !== null &&
            item !== undefined &&
            item !== '' &&
            item !== 0 &&
            !(Array.isArray(item) && item.length === 0) &&
            !(typeof item === 'object' && Object.keys(item).length === 0),
        );
      return cleanedArray;
    }

    if (typeof obj === 'object' && obj !== null) {
      const cleanedObj = Object.fromEntries(
        Object.entries(obj)
          .map(([key, value]) => [key, deepClean(value)])
          .filter(
            ([_, value]) =>
              value !== null &&
              value !== undefined &&
              value !== '' &&
              value !== 0 &&
              !(Array.isArray(value) && value.length === 0) &&
              !(typeof value === 'object' && Object.keys(value).length === 0),
          ),
      );
      return cleanedObj;
    }

    return obj;
  }

  const options = {
    categoryName: categoryDropdown
      .filter(
        (item: any) =>
          item.categoryName?.toLowerCase().includes('product') ||
          item.categoryName?.toLowerCase().includes('service'),
      )
      .map((item: any) => item.categoryName),
  };
  return (
    <div className="h-full bg-[#DFF2EE]">
      <div className="p-4">
        <CustomExpenseForm
          initialValues={formFields}
          fields={expenseFields}
          options={options}
          submitFunction={(data: any) => submitFunction(data)}
          isValidForm={!isValidForm}
          toBackend={toBackend}
        />
      </div>
    </div>
  );
};

export default ExpenseForm;
