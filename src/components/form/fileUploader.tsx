import React, { useState } from 'react';
import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../../hooks/app.form-context';
import { ErrorMessages } from './errorMessage';
import { Input } from '@/components/ui/input';
import { base64FromFiles } from '@/utils/common/base64Converter';

export default function MultiPdfUploader({
  fieldName,
  label,
  styles,
  placeholder,
  type,
  onChange,
  disabled,
  required,
  acceptTypes,
  value,
  hidden,
}: {
  fieldName: string;
  label: string;
  styles?: any;
  type?: string;
  placeholder?: string;
  onChange: (name: string, value: any, form?: any) => void;
  disabled?: boolean;
  required?: boolean;
  acceptTypes?: string;
  value: any;
  hidden?: boolean;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

  const [localError, setLocalError] = useState<string | null>(null);

  if (hidden) return null;

 const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  setLocalError(null);

  const selectedFiles = e.target.files;
  if (!selectedFiles || selectedFiles.length === 0) return;

  const fileArray = Array.from(selectedFiles);

  // 1. Validation
  const oversized = fileArray.find((file) => file.size > MAX_FILE_SIZE);
  if (oversized) {
    setLocalError(`File "${oversized.name}" exceeds the 3 MB size limit.`);
    return;
  }

  // 2. Conversion to Base64
  // base64FromFiles usually returns an array of objects: [{ name: '...', base64: '...' }]
  const filesWithBase64 = await base64FromFiles(fileArray);
  
  if (filesWithBase64 && filesWithBase64.length > 0) {
    // Send the raw base64 data to the form state
    // If your backend expects just the string:
    onChange(fieldName, filesWithBase64); 
  }
};
  return (
    <div className={styles?.wrapper ?? 'space-y-4 w-full max-w-sm'}>
      <label
        htmlFor={fieldName}
        className={styles?.label ?? 'text-sm font-medium text-gray-600'}
      >
        {label}{' '}
        {required && !disabled && <span className="text-red-400">*</span>}
      </label>

      <Input
        id={fieldName}
        name={fieldName}
        type={type}
        accept={
          acceptTypes ?? '.pdf,application/pdf,.xlsx,.csv,.jpeg,.png,.jpg'
        }
        // multiple
        onBlur={field.handleBlur}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      />
     {value && value.length > 0 && (
  <div className="mt-2 p-2 bg-purple-50/50 border border-purple-100 rounded-md flex items-center justify-between">
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="bg-purple-600 text-white p-1 rounded text-[10px] font-bold uppercase">
        {/* Extracts extension from the name if available */}
        {value[0]?.name?.split('.').pop() || 'DOC'}
      </div>
      <span className="text-sm text-gray-700 truncate font-medium">
        {/* Displays the human-readable name, NOT the base64 string */}
        {value[0]?.name || 'Uploaded File'}
      </span>
    </div>

    {!disabled && (
      <button
        type="button"
        className="text-red-400 hover:text-red-600 text-xs font-semibold"
        onClick={() => onChange(fieldName, [])}
      >
        Remove
      </button>
    )}
  </div>
)}
      {/* Local file size validation error */}
      {localError && <p className="text-sm text-red-500">{localError}</p>}

      {/* Form validation errors */}
      {field.state.meta.isTouched && !field.state.value && (
        <ErrorMessages errors={errors} />
      )}
    </div>
  );
}
