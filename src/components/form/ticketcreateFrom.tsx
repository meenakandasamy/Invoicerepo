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
    onReset: () => void;
  onChange?: (name: string, value: any, form?: any, editingField?: any) => void;
  fields: Array<Field>;
  options: Record<string, Array<string | number>>;
  styles?: Record<string, string>;
  label: string;
  disableLabel?: boolean;
  buttonLabel?: string;
  optionalbuttonLabel?:string,
  validators?: Record<string, any>;
  toBackend?: boolean;
  hidden?: boolean;
  customdata?:string
  isCustom?:boolean
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
  onClose,onReset,
  fields,
  options,
  styles,
  label,
  disableLabel,
  buttonLabel,customdata,isCustom,
  optionalbuttonLabel,
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
          'w-full max-w-1xl rounded-xl backdrop-blur-md shadow-xl bg-white flex flex-col'
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
{isCustom?(<div className="
  px-10
  py-10
">{customdata}</div>):(
        <div className="
  flex-1
  overflow-y-auto

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
              'grid grid-cols-1 sm:grid-cols-1 gap-4  md:gap-6 w-full'
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
        </div>)}

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white z-10 pt-4 pb-2 border-t dark:bg-background border-gray-200">
          <div className="flex flex-col sm:flex-row justify-end gap-3 px-4">
            {!hide.cancelButton && (
              <form.AppForm>
                <form.buttonField
                  label={optionalbuttonLabel||"Cancel"}
                  className={clsx(
                    styles?.cancelButton||
                    'w-full sm:w-auto border border-red-500 text-red-500 rounded cursor-pointer',
                    'hover:bg-red-500 hover:text-white transition-colors',
                    {
                      'pointer-events-none opacity-50': toBackend,
                    },
                  )}
                  buttonType="reset"
                  onClick={() => {
                    form.reset();
                    onReset();
                  }}
                />
              </form.AppForm>
            )}
            {!isCustom && !hide.submitButton && (
              <form.AppForm>
                <form.buttonField
                  toBackend={toBackend}
                  label={buttonLabel || 'Submit'}
                  className={clsx(
                    styles?.submitButton,
                    'w-full sm:w-auto bg-blue-700 text-white rounded-md hover:bg-blue-500',
                    'focus:outline-none focus:ring-2 focus:bg-violet-600 focus:ring-offset-2',
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
