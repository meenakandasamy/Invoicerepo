import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import debounce from 'lodash.debounce';
import { CustomExpenseForm } from './customExpenseForm';
import type { Field } from '@/types/form';
import type { ExpenseDTOType } from '@/utils/Validators/schema/ExpeneseSchema';
import type { vendorDropdownType } from '@/types/requestor';
import { useResetFormStore } from '@/stores/resetFormStore';
import { useApproverCategory } from '@/hooks/data/useApproverCategory';
import { useVendorDropdown } from '@/hooks/data/useVendor';
import {
  VendorAdvanceQueries,
  VendorAdvanceServices,
} from '@/integrations/Services/vendorAdvanceService';

const VendorAdvanceForm = ({
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
    createdDate: new Date().toISOString(),
    lastUpdatedDate: new Date().toISOString(),
    vendorAdvanceId: 0,
    vendorAdvanceCode: '',
    vendorId: 0,
    vendorName: '',
    categoryId: 0,
    categoryName: '',
    totalAmountNoGst: 0,
    gstPercentage: null,
    gstAmount: null,
    totalAmountInGst: 0,
    tdsPercentage: null,
    tdsAmount: null,
    totalAmount: 0,
    amountApproved: 0,
    amountPaid: 0,
    dateOfPayment: '',
    approverStatusId: 0,
    approverStatusName: '',
    levelId: 0,
    costCentreIds: [],
    costHeaderIds: [],
    siteIds: [],
    createdBy: 0,
    lastUpdatedBy: null,
    description: '',
    costCentreNames: [],
    costHeaderNames: [],
    siteNames: [],
  };
  const [formFields, setFormFields] = useState<any>(defaultValues);
  const computeTotals = (form: any) => {
    const totalNoGst = Number(form.getFieldValue('totalAmountNoGst') || 0);
    const gst = Number(form.getFieldValue('gstPercentage') || 0);
    const tds = Number(form.getFieldValue('tdsPercentage') || 0);

    // Calculate GST & TDS
    const gstAmount = (totalNoGst * gst) / 100;
    const tdsAmount = (totalNoGst * tds) / 100;

    // Calculate final total (No GST + GST - TDS)
    const totalAmount = totalNoGst + gstAmount - tdsAmount;

    // Set form values
    form.setFieldValue('gstAmount', gstAmount.toFixed(2));
    form.setFieldValue('tdsAmount', tdsAmount.toFixed(2));
    form.setFieldValue('totalAmount', totalAmount.toFixed(2));

    // Additional fields you already had
    form.setFieldValue('totalAmountInGst', (totalNoGst + gstAmount).toFixed(2));
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

  const vendorAdvanceFieldNames = [
    'vendorName',
    'categoryName',
    'totalAmountNoGst',
    'gstPercentage',
    'gstAmount',
    'description',
    'totalAmountInGst',
    'poLoiFilePath',
    'signedConfirmationPath',
    'invoiceFilePath',
  ];

  const vendorAdvanceFields: Array<Field> = [
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
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
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
      },
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
      placeholder: 'Enter Description',
      required: true,
      disabled: !isValidVendor,
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
    {
      name: 'totalAmountNoGst',
      label: 'Total Amount (excl. GST)',
      type: 'number',
      placeholder: 'Enter Total Amount without GST',
      required: true,
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('totalAmountNoGst', value);
        computeTotals(form);
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
      placeholder: 'Enter GST %',
      required: true,
      disabled: !isValidVendor || !vendorHasGST,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('gstPercentage', value);
        computeTotals(form);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'gstAmount',
      label: 'GST Amount',
      type: 'number',
      placeholder: 'Calculated GST Amount',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'totalAmountInGst',
      label: 'Total Amount (incl. GST)',
      type: 'number',
      placeholder: 'Total Amount Including GST',
      disabled: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'poLoiFilePath',
      label: 'PO/LOI (PDF, JPG, PNG)',
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
      name: 'signedConfirmationPath',
      label: 'Signed Confirmation (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      required: true,
      disabled: !isValidVendor,
      onChange: (_name: string, value: any, form: any) => {
        form.setFieldValue('signedConfirmationPath', value[0].file.name);
        form.setFieldValue(
          'signedConfirmationFileType',
          value[0].file.type.split('/')[1],
        );
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-600',
      },
    },
    {
      name: 'invoiceFilePath',
      label: 'Invoice (PDF, JPG, PNG)',
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

  const createVendorAdvanceMutation = useMutation({
    mutationKey: [VendorAdvanceQueries.CREATE],
    mutationFn: async (data: any) => {
      setToBackend(true);
      return await VendorAdvanceServices.createVendorAdvance(data);
    },
    onSuccess: () => {
      toast.success('Vendor Advance added successfully!');
      setFormFields(defaultValues);
      setToBackend(false);
      window.location.reload();
    },
    onError: (error: any) => {
      console.error(error);
      setToBackend(false);
      toast.error(`Failed to add Vendor Advance: ${error.message || error}`);
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
    };

    // Here you can call your API to save the vendor data
    console.log('Form Data Submitted:', deepClean(formData));

    createVendorAdvanceMutation.mutate(deepClean(formData));
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
    categoryName: categoryDropdown.map((item) => item.categoryName),
  };
  return (
    <div className="h-full bg-[#DFF2EE]">
      <div className="p-4">
        <CustomExpenseForm
          initialValues={formFields}
          fields={vendorAdvanceFields
            .filter((f) => vendorAdvanceFieldNames.includes(f.name))
            .sort(
              (a, b) =>
                vendorAdvanceFieldNames.indexOf(a.name) -
                vendorAdvanceFieldNames.indexOf(b.name),
            )}
          options={options}
          submitFunction={(data: any) => submitFunction(data)}
          isValidForm={!isValidForm}
          toBackend={toBackend}
        />
      </div>
    </div>
  );
};

export default VendorAdvanceForm;
