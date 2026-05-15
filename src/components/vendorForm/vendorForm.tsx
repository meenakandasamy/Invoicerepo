import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CustomVendorForm } from './customVendorForm';
import type { Field } from '@/types/form';
import { useMutationFn } from '@/utils/common/queryUtils';
import {
  VendorQuery,
  VendorServices,
} from '@/integrations/Services/vendorServices';
import { useResetFormStore } from '@/stores/resetFormStore';

const VendorForm = ({
  userId,
  hashingKey,
  isValidForm,
}: {
  userId: string;
  hashingKey: string;
  isValidForm: boolean;
}) => {
  const formCredentials = {
    userId: userId,
    hashingKey: hashingKey,
    encryptionKey: hashingKey,
  };
  const [isGstDisabled, setIsGstDisabled] = useState(true);
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
    gstStatus: '',
    createdBy: '',
    msmeRegistration: '',
    accountNoFilpath: '',
    panNoFilepath: '',
    msmeRegistrationFilepath: '',
    gstNoFilepath: '',
  };
  const [formFields, setFormFields] = useState<any>(defaultValues);
  const baseFields: Array<Field> = [
    {
      name: 'vendorType',
      label: 'Vendor Type',
      type: 'multiSelect',
      placeholder: 'Vendor Type',
      required: true,
      onChange: (name: string, value: any) => {
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value,
        }));
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        button:
          'w-[300px] justify-between hover:bg-transparent font-normal cursor-pointer',
        input:
          'w-[300px] h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'companyName',
      label: 'Company Name',
      type: 'text',
      placeholder: 'Company Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'poc',
      label: 'PoC',
      type: 'text',
      placeholder: 'PoC',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'mobileNo',
      label: 'Mobile Number',
      type: 'text',
      placeholder: '9789564564',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'emailId',
      label: 'Email Id',
      type: 'text',
      placeholder: 'Email',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'panNo',
      label: 'PAN',
      type: 'text',
      placeholder: 'PAN',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'gstStatus',
      label: 'GST Status',
      type: 'select',
      placeholder: 'GST Status',
      required: true,
      onChange: (name: string, value: any, form: any) => {
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value,
          ...(value !== 'Registered' && { gstNo: '', gstNoFilepath: '' }),
        }));
        if (value !== 'Registered') {
          form.setFieldValue('gstNo', '');
          form.setFieldValue('gstNoFilepath', '');
        }
        setIsGstDisabled(value == 'Registered' ? false : true);
      },
      styles: {
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'gstNo',
      label: 'GST No',
      type: 'text',
      placeholder: 'GST No',
      disabled: isGstDisabled,
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      placeholder: 'Bank Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'bankBranch',
      label: 'Bank Branch',
      type: 'text',
      placeholder: 'Bank Branch',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'accountNo',
      label: 'Account No',
      type: 'text',
      placeholder: 'Account No',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'bankIfscCode',
      label: 'Bank IFSC',
      type: 'text',
      placeholder: 'Bank IFSC',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },

    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Description',
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },

    {
      name: 'accountNoFilpath',
      label: 'Cancelled Cheque (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      required: true,
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1 w-[300px]',
        label: 'text-sm font-medium text-gray-600',
      },
      onChange: (name: string, value: any) => {
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value[0].file.name,
        }));
      },
    },
    {
      name: 'panNoFilepath',
      label: 'PAN Card (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1 w-[300px]',
        label: 'text-sm font-medium text-gray-600',
      },
      required: true,
      onChange: (name: string, value: any) => {
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value[0].file.name,
        }));
      },
    },
    {
      name: 'msmeRegistrationFilepath',
      label: 'MSME Registration (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1 w-[300px]',
        label: 'text-sm font-medium text-gray-600',
      },
      required: true,
      onChange: (name: string, value: any) => {
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value[0].file.name,
        }));
      },
    },
    {
      name: 'gstNoFilepath',
      label: 'GST Certificate (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      disabled: isGstDisabled,
      styles: {
        wrapper: 'flex flex-col gap-1 w-[300px]',
        label: 'text-sm font-medium text-gray-600',
      },
      required: true,
      onChange: (name: string, value: any) => {
        setFormFields((prev: any) => ({
          ...prev,
          [name]: value[0].file.name,
        }));
      },
    },
  ];
  const propertyOwnerFields = [
    {
      name: 'aadharNo',
      label: 'Aadhar No',
      type: 'text',
      placeholder: 'Aadhar No',
      required: true,
      styles: {
        input:
          'w-[300px] border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1',
      },
    },
    {
      name: 'aadharNoFilepath',
      label: 'Aadhar Card (PDF, JPG, PNG)',
      type: 'file',
      placeholder: 'Choose File',
      required: true,
      acceptTypes: '.pdf,.jpg,.jpeg,.png',
      styles: {
        wrapper: 'flex flex-col gap-1 w-[300px]',
        label: 'text-sm font-medium text-gray-600',
      },
    },
  ];
  const [fields, setFields] = useState(baseFields);
  useEffect(() => {
    let updatedFields = [...baseFields];

    // const productOptions = ['Product', 'Service', 'Product & Service'];
    const vendorType = formFields.vendorType || [];

    const isPropertyOwnerSelected = vendorType.includes('Property Owner');
    // const hasBusinessOptionsSelected = vendorType.some((v: string) =>
    //   productOptions.includes(v),
    // );

    // // --- Vendor Type option disabling logic in useEffect ---
    // if (isPropertyOwnerSelected && hasBusinessOptionsSelected) {
    //   // If mixed, only keep Property Owner
    //   setFormFields((prev: any) => ({
    //     ...prev,
    //     vendorType: ['Property Owner'],
    //   }));
    //   setDisabledOptions(productOptions);
    // } else if (isPropertyOwnerSelected) {
    //   setDisabledOptions(productOptions);
    // } else if (hasBusinessOptionsSelected) {
    //   setDisabledOptions(['Property Owner']);
    // } else {
    //   setDisabledOptions([]);
    // }

    // --- GST disabled dynamic update ---
    updatedFields = updatedFields.map((field) => {
      if (['gstNo', 'gstNoFilepath'].includes(field.name)) {
        return { ...field, disabled: isGstDisabled };
      }
      console.log(field.name, 'vendor');

      if (field.name === 'vendorName' || field.name === 'companyName') {
        return {
          ...field,
          label: isPropertyOwnerSelected ? 'Owner Name' : 'Company Name',
          placeholder: isPropertyOwnerSelected ? 'Owner Name' : 'Company Name',
        };
      }

      return field;
    });

    if (isPropertyOwnerSelected) {
      // Remove GST related fields
      updatedFields = updatedFields.filter(
        (f) => !['poc', 'gstStatus', 'gstNo', 'gstNoFilepath'].includes(f.name),
      );

      // Insert and move Aadhar-related fields
      const bankIndex = updatedFields.findIndex((f) => f.name === 'bankName');

      updatedFields.splice(bankIndex, 0, propertyOwnerFields[0]); // Aadhar No in middle
      updatedFields.push(propertyOwnerFields[1]); // File upload at the end

      // Reset GST fields
      setFormFields((prev: any) => ({
        ...prev,
        isGST: null,
        gstNo: null,
        gstNoFilepath: null,
      }));
    }

    setFields(updatedFields);
  }, [formFields.vendorType, isGstDisabled]);

  const [toBackend, setToBackend] = useState<boolean>(false);
  const { reset } = useResetFormStore();
  useEffect(() => {
    if (reset) {
      setFormFields(defaultValues);
    }
  }, [reset]);

  // POST Mutation
  const postMutation = useMutationFn(
    VendorServices.SaveVendorForm,
    VendorQuery.GET_ALL_VENDORS,
  );

  function submitFunction(data: any) {
    setToBackend(true);
    const { companyName, ...rest } = data;
    const formData = {
      ...rest,
      ...formCredentials,
      gstStatus: data.gstStatus === 'Registered' ? 1 : 0,
      createdBy: formCredentials.userId,
      lastUpdatedBy: formCredentials.userId,
      vendorName: data.companyName,
    };

    // Here you can call your API to save the vendor data
    console.log('Form Data Submitted:', formData);

    postMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Vendor added successfully!');
        setFormFields(defaultValues); // Reset form fields
        setToBackend(false);
        window.location.reload();
      },
      onError: (error) => {
        toast.error('Error saving vendor form. Please try again.');
        console.error('Error saving vendor form:', error);
        setToBackend(false);
      },
    });
  }

  const options = {
    gstStatus: ['Registered', 'Unregistered'],
    vendorType: ['Product', 'Service', 'Property Owner'],
  };

  return (
    <div className="h-full bg-[#DFF2EE]">
      <div className="p-4">
        <CustomVendorForm
          initialValues={formFields}
          fields={fields}
          options={options}
          submitFunction={(data: any) => submitFunction(data)}
          isValidForm={!isValidForm}
          toBackend={toBackend}
        />
      </div>
    </div>
  );
};

export default VendorForm;
