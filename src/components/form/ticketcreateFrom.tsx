import { useEffect } from 'react';
import clsx from 'clsx';
import { validationSchema } from './validations';
import { ProductsViewer } from './productsViewer';
import type { Field } from '@/types/form';
import { useAppForm } from '@/hooks/app.form';
import { useFormPageStore } from '@/stores/formPageStore';
import { Switch } from '@/components/ui/switch';

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

export function TicketcreateForm({
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

  // console.log(
  //   fields.filter((f) => f.type === 'multiItems').map((f) => f),
  //   'testDisable',
  // );
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
        'flex items-center justify-center min-h-screen p-4 bg-gray-50 '
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
  <div className="border-b border-gray-200 bg-white px-8 py-6">
    <div className="flex items-start justify-between">
      
      <div className="flex items-center gap-4">
        
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Add New Ticket
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below to create a new ticket
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
        <div className="
  flex-1
  overflow-y-auto
  bg-gray-50
  px-8
  py-8
">
          {/* Extra Summary Preview / Bill / Custom Component */}
          {extraContent && (
            <div className="w-full p-4 border-b border-gray-300">
              {extraContent}
            </div>
          )}

          <div
            className={
              styles?.grid ||
              'grid grid-cols-1 sm:grid-cols-2 gap-4  md:gap-6 w-full'
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
                      ) :fieldItem.type === "customtoggleButton" ? (
  <fieldProps.Customtogglebutton
    label={fieldItem.label}
    name={fieldItem.name}
    value={form.getFieldValue(fieldItem.name)}
      options={options[fieldItem.name] ?? []}
    form={form}
    setPageField={setPageField}
    pageLabel={label}
       required={fieldItem.required}
    onChange={fieldItem.onChange}
    disabled={fieldItem.disabled}
  />
)  : fieldItem.type === 'date' ? (
                        <fieldProps.DatePicker
                          label={fieldItem.label}
                          required={fieldItem.required}
                          futureDate={fieldItem.futureDate}
                          styles={
                            fieldItem.disabled
                              ? disabledStyle
                              : fieldItem.styles
                          }
                          onChange={(_name: string, date: Date) => {
                            fieldItem.onChange?.(fieldItem.name, date, form);
                            setPageField(label, fieldItem.name, date);
                            form.setFieldValue(fieldItem.name, date);
                          }}
                          hidden={fieldItem.hidden}
                          disabled={fieldItem.disabled}
                        />
                      ) : fieldItem.type === 'productMultiSelect' ? (
                        <div className="grid grid-cols-2 w-[210%] gap-18 p-4 border border-dashed border-gray-400 rounded-md">
                          <fieldProps.MultiSelect
                            label={fieldItem.label}
                            required={fieldItem.required}
                            options={options[fieldItem.name] ?? []}
                            styles={
                              fieldItem.disabled
                                ? disabledStyle
                                : fieldItem.styles
                            }
                            selected={form.getFieldValue(fieldItem.name).flat()}
                            onChange={(value) => {
                              setPageField(label, fieldItem.name, value);
                              fieldItem.onChange?.(fieldItem.name, value, form);
                            }}
                            placeholder={
                              fieldItem.placeholder || 'Select options'
                            }
                            disabled={fieldItem.disabled}
                            disabledOptions={disabledOptions}
                          />
                          {fieldItem.name === 'purchaseList' && (
                            <ProductsViewer
                              products={fieldItem.viewer}
                              disabled={fieldItem.disabled}
                            />
                          )}
                        </div>
                      ) : fieldItem.type === 'multiSelect' ? (
                        <fieldProps.MultiSelect
                          label={fieldItem.label}
                          options={options[fieldItem.name] ?? []}
                          required={fieldItem.required}
                          styles={
                            fieldItem.disabled
                              ? disabledStyle
                              : fieldItem.styles
                          }
                          selected={form.getFieldValue(fieldItem.name) || []}
                          onChange={(value) => {
                            setPageField(label, fieldItem.name, value);
                            fieldItem.onChange?.(fieldItem.name, value, form);
                            fieldProps.setValue(value);
                          }}
                          placeholder={
                            fieldItem.placeholder || 'Select options'
                          }
                          disabled={fieldItem.disabled}
                        />
                      ) : fieldItem.type === 'toggle' ? (
                        <div className="mt-6 flex items-center justify-between w-full ">
                          <label className=" text-sm font-medium text-gray-700">
                            {fieldItem.label}
                          </label>

                          <fieldProps.Switch
                            checked={!!form.getFieldValue(fieldItem.name)}
                            disabled={fieldItem.disabled}
                            onCheckedChange={(value) => {
                              form.setFieldValue(fieldItem.name, value);
                              fieldItem.onChange?.(fieldItem.name, value, form);
                            }}
                          />
                        </div>
                      ) : fieldItem.type === 'file' ? (
                        <fieldProps.MultiPdfUploader
                          fieldName={fieldItem.name}
                          label={fieldItem.label}
                          styles={fieldItem.styles}
                          required={fieldItem.required}
                          value={
                            form.getFieldValue(fieldItem.name)
                              ? [form.getFieldValue(fieldItem.name)]
                              : []
                          }
                          type={fieldItem.type}
                          onChange={(name, filesWithBase64) => {
                            const fileData = filesWithBase64[0]; // { name: "...", base64: "..." }

                            if (fileData) {
                              // Set the Base64 to the primary path field for the backend
                              form.setFieldValue(name, fileData.base64);

                              // Set the readable name to the filename field (accfilename, etc.)
                              if (fieldItem.fileNameKey) {
                                form.setFieldValue(
                                  fieldItem.fileNameKey,
                                  fileData.name,
                                );
                              }
                            } else {
                              form.setFieldValue(name, null);
                              if (fieldItem.fileNameKey)
                                form.setFieldValue(fieldItem.fileNameKey, null);
                            }
                          }}
                          placeholder={fieldItem.placeholder || 'Choose File'}
                          disabled={fieldItem.disabled}
                          acceptTypes={fieldItem.acceptTypes}
                          hidden={fieldItem.hidden}
                        />
                      ) : fieldItem.type === 'multifile' ? (
                        <fieldProps.MultiFiledocument
                          fieldName={fieldItem.name}
                          label={fieldItem.label}
                          styles={fieldItem.styles}
                          required={fieldItem.required}
                          value={form.getFieldValue(fieldItem.name)}
                          type={fieldItem.type}
                          onChange={(name, value) => {
                            setPageField(label, name, value);
                            fieldItem.onChange?.(name, value, form);
                            form.setFieldValue(name, value[0].base64);
                          }}
                          placeholder={fieldItem.placeholder || 'Choose File'}
                          disabled={fieldItem.disabled}
                          acceptTypes={fieldItem.acceptTypes}
                          hidden={fieldItem.hidden}
                        />
                      ) : fieldItem.type === 'activityMap' ? (
                        <fieldProps.RoleInitializer
                          fieldItem={fieldItem}
                          activities={options['activities'] ?? []}
                          onClick={(activityName: string, header: string) => {
                            fieldItem.onChange?.(activityName, header);
                            const path = `${fieldItem.name}.${activityName}.${header.toLowerCase()}`;
                            const fieldValue = form.getFieldValue(path);
                            form.setFieldValue(path, fieldValue === 1 ? 0 : 1);
                            if (activityName == 'All') {
                              fieldItem.activityArr?.map((activity: string) => {
                                const innerPath = `${fieldItem.name}.${activity}.${header.toLowerCase()}`;
                                form.setFieldValue(
                                  innerPath,
                                  fieldValue === 1 ? 0 : 1,
                                );
                              });
                            }
                          }}
                        />
                      ) : null
                    }
                  </form.AppField>
                </div>
              );
            })}
          </div>
          {fields
            .filter((f) => f.type === 'multiItems')
            .map((fieldItem) => (
              <div key={fieldItem.name} className="w-full mt-6">
                <form.AppField name={fieldItem.name}>
                  {(fieldProps) => (
                    <fieldProps.MultiItemsField
                      label={fieldItem.label}
                      itemFields={fieldItem.itemFields ?? []}
                      // required={fieldItem.required}
                      value={form.getFieldValue(fieldItem.name)}
                      form={form}
                      fieldName={fieldItem.name}
                      options={options}
                      disabled={fieldItem.disabled}
                      ButtonDisabled={fieldItem.ButtonDisabled}
                      styles={fieldItem.styles}
                      fieldProps={fieldProps}
                      onChange={(
                        name: string,
                        value: any,
                        editingField?: any,
                        removedItem?: any,
                      ) => {
                        form.setFieldValue(name, value);
                        setPageField(label, name, value);
                        fieldItem.onChange?.(
                          name,
                          value,
                          form,
                          editingField,
                          removedItem,
                        );
                      }}
                      edit={edit}
                      listOfTabs={fieldItem.listOfTabs}
                      defaultTab={fieldItem.defaultTab}
                      handleTabFn={fieldItem.handleTabFn}
                      disableIndex={disableIndex}
                    />
                  )}
                </form.AppField>
              </div>
            ))}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white z-10 pt-4 pb-2 border-t dark:bg-background border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end gap-3 px-4">
            {!hide.cancelButton && (
              <form.AppForm>
                <form.buttonField
                  label="Cancel"
                  className={clsx(
                    styles?.cancelButton,
                    'w-full sm:w-auto border border-red-500 text-red-500 rounded cursor-pointer',
                    'hover:bg-red-500 hover:text-white transition-colors',
                    {
                      'pointer-events-none opacity-50': toBackend,
                    },
                  )}
                  buttonType="reset"
                  onClick={() => {
                    form.reset();
                    onClose();
                  }}
                />
              </form.AppForm>
            )}
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
