import { useEffect, useState } from 'react';
import { CheckboxField } from '../form/Checkbox';
import { validationSchema } from './validations';
import type { Field } from '@/types/form';
import { useAppForm } from '@/hooks/app.form';

interface CustomFormProps {
  initialValues: Record<string, any>;
  submitFunction: (value: any) => void;
  onClose: () => void;
  onChange?: (name: string, value: any, updatedData: any, form: any) => void;
  fields: Array<Field>;
  options: Record<string, Array<string | number>>;
  styles?: Record<string, string>;
  label?: string;
  checked?: boolean;
  valuedata?: string;
}
type PermissionType = {
  name: string;
  label: string;
};
export function CustomRole({
  initialValues,
  submitFunction,
  onClose,
  onChange: handleExternalChange,
  fields,
  options,
  checked,
  valuedata,
  styles,
  label,
}: CustomFormProps) {
  console.log(fields);

  const form = useAppForm({
    defaultValues: initialValues,
    onSubmit: () => {
      console.log('Submitted formData:', formData);
      submitFunction(formData);
      // toast.success('Form submitted successfully!');
    },
  });

  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  console.log(formData);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);
  const handleChange = (name: string, value: any) => {
    console.log(name, value);
    console.log(formData);

    const updatedData = { ...formData };

    if (name === 'Select All') {
      const changedKeys = Object.keys(value);
      fields.forEach((field) => {
        if (field.type === 'checkbox' && field.name !== 'Select All') {
          const current = updatedData[field.name] || {};
          changedKeys.forEach((key) => {
            current[key] = value[key];
          });

          updatedData[field.name] = current;
        }
      });

      updatedData[name] = {
        ...updatedData[name],
        ...value,
      };
    } else {
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        updatedData[name] = value;
      } else {
        updatedData[name] = {
          ...updatedData[name],
          ...value,
        };
      }
    }

    setFormData(updatedData);
    handleExternalChange?.(name, value, updatedData, form);
  };

  return (
    <div
      className={
        styles?.container ||
        'flex items-center justify-center min-h-screen p-4 bg-gray-50'
      }
    >
      <div
        className={
          styles?.form ||
          'w-full max-w-2xl p-5 rounded-xl backdrop-blur-md shadow-xl bg-white'
        }
      >
        <div className="flex justify-center mb-4">
          <label
            htmlFor={label}
            className={styles?.label || 'text-2xl font-bold text-gray-800'}
          >
            {label}
          </label>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 w-full">
              {fields.map((fieldItem: Field) => (
                <div key={fieldItem.name}>
                  <form.AppField
                    name={fieldItem.name}
                    validators={validationSchema({
                      ...fieldItem,
                    })}
                  >
                    {(fieldProps) => {
                      if (
                        fieldItem.type === 'text' ||
                        fieldItem.type === 'number'
                      ) {
                        return (
                          <fieldProps.TextField
                            type={fieldItem.type}
                            label={fieldItem.label}
                            placeholder={fieldItem.placeholder}
                            styles={fieldItem.styles}
                            onChange={(name, value) => {
                              fieldItem.onChange?.(name, value);
                              form.setFieldValue(name, value);
                              handleChange(name, value);
                            }}
                          />
                        );
                      } else if (fieldItem.type === 'select') {
                        return (
                          <fieldProps.SelectField
                            label={fieldItem.label}
                            values={options[fieldItem.name]}
                            placeholder={fieldItem.placeholder}
                            onChange={(name, value) => {
                              fieldItem.onChange?.(name, value, form);
                              form.setFieldValue(name, value);
                            }}
                            disabled={fieldItem.disabled}
                          />
                        );
                      }
                      return null;
                    }}
                  </form.AppField>
                </div>
              ))}
            </div>
          </div>
          <div className="font-bold">Screen and Permission</div>
          <div className="flex justify-center items-center">
            <div
              className="max-h-[45vh] overflow-y-auto overflow-x-hidden w-[55vw] p-8 rounded-xl backdrop-blur-md shadow-xl bg-white"
              style={{
                scrollbarWidth: 'auto',
                msOverflowStyle: 'auto',
              }}
            >
              {fields.map((fieldItem) => (
                <div key={fieldItem.name}>
                  <form.AppField name={fieldItem.name}>
                    {(fieldProps) => {
                      if (
                        fieldItem.type === 'checkbox' &&
                        Array.isArray(fieldItem.values)
                      ) {
                        return (
                          <div className="flex mb-2">
                            <div className="text-gray-700 font-medium w-[18vw] flex items-center">
                              {fieldItem.label}
                            </div>
                            <div className="flex flex-wrap flex-1">
                              {fieldItem.values.map(
                                (checkboxOption: PermissionType) => {
                                  const checkboxName = `${fieldItem.name}.${checkboxOption.name}`;
                                  return (
                                    <div
                                      key={checkboxName}
                                      className="flex-1 min-w-[30%]"
                                    >
                                      <CheckboxField
                                        label={checkboxOption.label}
                                        styles={fieldItem.styles}
                                        disabled={fieldItem.disabled}
                                        checked={
                                          formData?.[fieldItem.name]?.[
                                            checkboxOption.name
                                          ] ?? false
                                        }
                                        onChange={(name, value) => {
                                          const updatedGroup = {
                                            ...formData[fieldItem.name],
                                            [checkboxOption.name]: value,
                                          };
                                          handleChange(
                                            fieldItem.name,
                                            updatedGroup,
                                          );
                                          fieldItem.onChange?.(name, value);
                                        }}
                                      />
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  </form.AppField>
                </div>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-end gap-3 px-4">
              <form.AppForm>
                <form.buttonField
                  label="Cancel"
                  className={
                    styles?.cancelButton ||
                    'w-full sm:w-auto border border-red-500 text-red-500 py-2 px-4 rounded cursor-pointer hover:bg-red-500 hover:text-white transition-colors'
                  }
                  buttonType="reset"
                  onClick={() => {
                    form.reset();
                    onClose();
                  }}
                />
              </form.AppForm>
              <form.AppForm>
                <form.buttonField
                  label="Submit"
                  className={
                    styles?.submitButton ||
                    'w-full sm:w-auto px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50'
                  }
                  buttonType="submit"
                />
              </form.AppForm>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
