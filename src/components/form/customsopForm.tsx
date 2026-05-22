import { useEffect } from 'react';
import clsx from 'clsx';
import { validationSchema } from './validations';
import type { Field } from '@/types/form';
import { useAppForm } from '@/hooks/app.form';
import { useFormPageStore } from '@/stores/formPageStore';

interface CustomFormProps {
  initialValues: Record<string, any>;
  submitFunction: (value: any) => void;
  onClose: () => void;
  onChange?: (name: string, value: any, form?: any, editingField?: any) => void;
  fields: Array<Field>;
  options: Record<string, Array<string | number>>;
  styles?: Record<string, string>;
  label: string;
  disableLabel?: boolean;
  buttonLabel?: string;
  validators?: Record<string, any>;
  toBackend?: boolean;
  hidden?: boolean;
  disabledOptions?: Array<string>;
  extraContent?: React.ReactNode;
  hide?: {
    label?: boolean;
    button?: boolean;
    container?: boolean;
    form?: boolean;
    cancelButton?: boolean;
    submitButton?: boolean;
  };
  edit?: boolean;
  disableIndex?: Array<any>;
}

export function CustomsopForm({
  initialValues,
  submitFunction,
  onClose,
  fields,
  options,
  styles,
  label,
  disableLabel,
  buttonLabel,
  toBackend,
  disabledOptions,
  extraContent,
  hide = {
    label: false,
    button: false,
    container: false,
    form: false,
    cancelButton: false,
    submitButton: false,
  },
  edit,
  disableIndex,
}: CustomFormProps) {
  const { setPageField, setEntirePage } = useFormPageStore.getState();

  const form = useAppForm({
    defaultValues: initialValues,
    onSubmit: ({ value }) => {
      setEntirePage(label, value);
      submitFunction(value);
    },
  });

  useEffect(() => {
    setEntirePage(label, initialValues);
  }, [label]);

  const disabledStyle = {
    wrapper: 'flex flex-col gap-1',
    label: 'text-sm font-medium text-gray-500',
    input:
      'w-full h-9 px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-400 select-none cursor-not-allowed',
  };
  const hideenStyle = {
    wrapper: '',
    label: '',
    input: '',
  };
  return (
    <div
      className={
        styles?.container ||
        'flex items-center justify-center min-h-screen p-1 bg-gray-50 '
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className={
          styles?.form ||
          'w-full max-w-2xl rounded-xl backdrop-blur-md shadow-xl bg-white flex flex-col'
        }
        style={{ maxHeight: '90vh' }}
      >
        {/* Sticky Header */}
     {/* Sticky Header */}
{!disableLabel && (
  <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 dark:bg-background">
    <div className="flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25V11.25a2.25 2.25 0 00-.659-1.591l-6-6A2.25 2.25 0 0011.25 3H6.75A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h10.5a2.25 2.25 0 002.25-2.25v-4.5z"
            />
          </svg>
        </div>

        {/* Title + Subtitle */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {label}
          </h2>
          {/* <p className="text-sm text-gray-500">
            Create a new Standard Operating Procedure
          </p> */}
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
)}
        {/* Scrollable Form Fields */}
        <div className="overflow-y-auto overflow-x-hidden dark:bg-background flex-1 p-4 md:p-6">
          <div
            className={
              styles?.grid ||
              'grid grid-cols-1 sm:grid-cols-4 gap-4  md:gap-6 w-full'
            }
          >
            {fields.map((fieldItem: Field) => {
              if (fieldItem.hidden) return null;
              fieldItem =
                buttonLabel === 'View'
                  ? {
                      ...fieldItem,
                      disabled: true,
                    }
                  : fieldItem;
              return (
                <div key={fieldItem.name} className="mt-2">
                  <form.AppField
                    name={fieldItem.name}
                    validators={validationSchema(fieldItem)}
                  >
                    {(fieldProps) =>
                      fieldItem.type === 'text' ? (
                        <fieldProps.TextField
                          label={fieldItem.label}
                          placeholder={fieldItem.placeholder}
                          hidden={fieldItem.hidden}
                          styles={
                            fieldItem.disabled
                              ? disabledStyle
                              : fieldItem.hidden
                                ? hideenStyle
                                : fieldItem.styles
                          }
                          required={fieldItem.required}
                          onChange={(name, value) => {
                            if (name === 'mobileNo') {
                              const cleaned = value
                                .replace(/[^0-9]/g, '')
                                .slice(0, 10);
                              fieldItem.onChange?.(name, cleaned, form);
                              form.setFieldValue(name, cleaned);
                            } else if (name === 'poc') {
                              const cleaned = value.replace(/[^a-zA-Z ]/g, '');
                              fieldItem.onChange?.(name, cleaned, form);
                              form.setFieldValue(name, cleaned);
                            } else if (name === 'panNo') {
                              const cleaned = value
                                .replace(/[^a-zA-Z0-9]/g, '')
                                .slice(0, 10)
                                .toUpperCase();
                              fieldItem.onChange?.(name, cleaned, form);
                              form.setFieldValue(name, cleaned);
                            } else if (name === 'aadharNo') {
                              const cleaned = value
                                .replace(/[^0-9]/g, '')
                                .slice(0, 12);
                              fieldItem.onChange?.(name, cleaned, form);
                              form.setFieldValue(name, cleaned);
                            } else if (name === 'accountNo') {
                              const cleaned = value
                                .replace(/[^a-zA-Z0-9]/g, '')
                                .toUpperCase()
                                .slice(0, 34);
                              fieldItem.onChange?.(name, cleaned, form);
                              form.setFieldValue(name, cleaned);
                            } else if (name === 'employeeId') {
                              const cleaned = value.replace(/[^0-9]/g, '');
                              fieldItem.onChange?.(name, cleaned, form);
                              setPageField(label, name, value);
                              form.setFieldValue(name, cleaned);
                            } 
                         else {
                              fieldItem.onChange?.(name, value, form);
                              setPageField(label, name, value);
                              form.setFieldValue(name, value);
                            }
                          }}
                          disabled={fieldItem.disabled}
                        />
                      ) : fieldItem.type === 'number' ? (
                        <fieldProps.TextField
                          label={fieldItem.label}
                          placeholder={fieldItem.placeholder}
                          required={fieldItem.required}
                          type="number"
                          styles={
                            fieldItem.disabled
                              ? disabledStyle
                              : fieldItem.hidden
                                ? hideenStyle
                                : fieldItem.styles
                          }
                          disabled={fieldItem.disabled}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key.toLowerCase() === 'e') {
                              e.preventDefault();
                            }
                          }}
                          hidden={fieldItem.hidden}
                          onChange={(name, value) => {
                            const sanitized = Math.max(0, Number(value) || 0);
                            setPageField(label, `${sanitized}`, value);
                            fieldItem.onChange?.(name, sanitized, form);
                            form.setFieldValue(name, sanitized);
                          }}
                        />
                      ) : fieldItem.type === 'select' ? (
                        <fieldProps.SelectField
                          label={fieldItem.label}
                          values={options[fieldItem.name] ?? []}
                          required={fieldItem.required}
                          placeholder={
                            fieldItem.placeholder || 'Select options'
                          }
                          styles={
                            fieldItem.disabled
                              ? disabledStyle
                              : fieldItem.styles
                          }
                          onChange={(name, value) => {
                            fieldItem.onChange?.(name, value, form);
                            setPageField(label, name, value);
                            form.setFieldValue(name, value);
                          }}
                          disabled={fieldItem.disabled}
                          hidden={fieldItem.hidden}
                          disabledOptions={disabledOptions}
                        />
                      )  : null
                    }
                  </form.AppField>
                </div>
              );
            })}
          </div>
      {extraContent && (
            <div className="w-full  mt-5 border-b border-gray-300">
              {extraContent}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white z-10 pt-4 pb-2 border-t dark:bg-background border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end px-4">
            {buttonLabel !== 'View' && !hide.submitButton && (
              <form.AppForm>
                <form.buttonField
                  toBackend={toBackend}
                  label={buttonLabel || 'Submit'}
                  className={clsx(
                    styles?.submitButton,
                    'w-full sm:w-auto bg-blue-700 text-white rounded-md hover:bg-blue-500',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    'transition-colors disabled:opacity-50 cursor-pointer',
                    {
                      'pointer-events-none opacity-50': toBackend,
                    },
                  )}
                  buttonType="submit"
                />
              </form.AppForm>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
