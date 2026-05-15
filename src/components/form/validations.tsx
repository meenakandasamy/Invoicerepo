import type { Field } from '@/types/form'; // Assuming your Field type is defined here

export function validationSchema(field: Field) {
  // Ensure Field type includes `required?: boolean;`
  const validators: Record<string, any> = {};

  validators.onBlur = ({ value }: { value: any }) => {
    if (field.disabled) return null;
    // console.log(value, field.name, 'gstValue');
    // Determine if the field is empty based on its type
    let isEmpty = false;

    if (typeof value === 'string') {
      isEmpty = value.trim() === '';
    } else if (value === null || value === undefined) {
      isEmpty = true;
    } else if (Array.isArray(value)) {
      isEmpty = value.length === 0;
    } else if (typeof value === 'number') {
      isEmpty = isNaN(value) || value === 0;
    }

    if (field.required && isEmpty) {
      return `${field.label.replace(/\s*\([^)]*\)/g, '').trim() || field.name} is required`;
    }

    // Specific validation rules (these will apply regardless of `field.required` if the field is not empty)
    if (
      field.type === 'number' &&
      Number(value) <= 0 && // Use Number(value) for consistent comparison
      (field.name === 'povalueExcludeGst' || field.name === 'costing')
    ) {
      // This check will only run if the field is not empty (due to the `if (field.required && isEmpty)` above)
      // If you want `povalueExcludeGst` and `costing` to *always* be greater than 0 if present,
      // and also required, you can remove the `field.required` check for them above,
      // or ensure they are marked `required: true` in your field definitions.
      return `${field.label || field.name} must be greater than 0`;
    }

    if (field.name === 'emailId') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // Only validate if value is not empty
      if (
        !isEmpty &&
        typeof value === 'string' &&
        !emailRegex.test(value.trim())
      ) {
        return 'Please enter a valid email address';
      }
    }

    if (field.name === 'mobileNo') {
      const mobileRegex = /^\d{10}$/;
      // Only validate if value is not empty
      if (
        !isEmpty &&
        typeof value === 'string' &&
        !mobileRegex.test(value.trim())
      ) {
        return 'Mobile number must be exactly 10 digits';
      }
    }

    if (field.name === 'panNo') {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      // Only validate if value is not empty
      if (
        !isEmpty &&
        typeof value === 'string' &&
        !panRegex.test(value.trim())
      ) {
        return 'Please enter a valid PAN number';
      }
    }

    if (field.name === 'gstNo') {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[A-Z]{1}[0-9A-Z]{1}$/;
      // Only validate if value is not empty
      if (
        !isEmpty &&
        typeof value === 'string' &&
        !gstRegex.test(value.trim())
      ) {
        return 'Please enter a valid GST number';
      }
    }

    if (field.name === 'aadharNo') {
      const aadharRegex = /^\d{12}$/;
      // Only validate if value is not empty
      if (
        !isEmpty &&
        typeof value === 'string' &&
        !aadharRegex.test(value.trim())
      ) {
        return 'Aadhar number must be exactly 12 digits';
      }
    }
    //   if(field.name === 'accountNo') {
    //     const accountRegex = /^\d{10}$/;
    //     // Only validate if value is not empty
    //     if (
    //       !isEmpty &&
    //       typeof value === 'string' &&
    //       !accountRegex.test(value.trim())
    //     ) {
    //       return 'Account number must be exactly 10 digits';
    //     }
    //   }
    return null; // No error
  };
  return validators;
}
