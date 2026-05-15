import React, { useState } from 'react';
import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '../../hooks/app.form-context';
import { ErrorMessages } from './errorMessage';
import { Input } from '@/components/ui/input';
import { base64FromFiles } from '@/utils/common/base64Converter';

export  function MultiFiledocument({
  fieldName,
  label,
  styles,
  placeholder,
  type = 'file',
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

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

  const [localError, setLocalError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  if (hidden) return null;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);

    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileArray = Array.from(selectedFiles);

    // File size validation
    const oversized = fileArray.find((file) => file.size > MAX_FILE_SIZE);

    if (oversized) {
      setLocalError(`File "${oversized.name}" exceeds the 3 MB size limit.`);
      return;
    }

    // Convert to base64
    const filesWithBase64 = await base64FromFiles(fileArray);

    onChange(fieldName, filesWithBase64);

    setShowInput(false); // hide input after upload
  };

  return (
    <div className={styles?.wrapper ?? 'space-y-4 w-full max-w-sm'}>
      {/* Label */}
      <label
        htmlFor={fieldName}
        className={styles?.label ?? 'text-sm font-medium text-gray-600'}
      >
        {label}{' '}
        {required && !disabled && <span className="text-red-400">*</span>}
      </label>

      {/* File Input */}
      {(!value || value.length === 0 || showInput) && (
        <Input
          id={fieldName}
          name={fieldName}
          type={type}
          accept={
            acceptTypes ??
            '.pdf,application/pdf,.xlsx,.csv,.jpeg,.png,.jpg'
          }
          onBlur={field.handleBlur}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        />
      )}

      {/* Uploaded Files List */}
      {value && Array.isArray(value) && value.length > 0 && (
        <div className="space-y-2">
          {value.map((file: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between border rounded-md px-3 py-2"
            >
              <span className="text-sm truncate max-w-[180px]">
                {file.name || `File ${index + 1}`}
              </span>

              <div className="flex gap-3">
                {/* Download */}
                <button
                  type="button"
                  className="text-blue-500 text-xs"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = file.base64;
                    link.download = file.name || 'document';
                    link.click();
                  }}
                >
                  Download
                </button>

                {/* Remove */}
                <button
                  type="button"
                  className="text-red-500 text-xs"
                  onClick={() => {
                    const updatedFiles = value.filter(
                      (_: any, i: number) => i !== index
                    );
                    onChange(fieldName, updatedFiles);
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Document Button */}
      {value && value.length > 0 && !showInput && (
        <button
          type="button"
          className="text-sm text-indigo-600 underline"
          onClick={() => setShowInput(true)}
        >
          Change Document
        </button>
      )}

      {/* Local Error */}
      {localError && <p className="text-sm text-red-500">{localError}</p>}

      {/* Form Validation Errors */}
      {field.state.meta.isTouched && !field.state.value && (
        <ErrorMessages errors={errors} />
      )}
    </div>
  );
}