
import { Modal } from '@mui/material';
import { Loader, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import type { JSX } from 'react/jsx-runtime';
import type { ConfirmationModalProps } from '@/types/common';
import clsx from 'clsx';
import { validationSchema } from '@/components/form/validations';
import { ProductsViewer } from '@/components/form/productsViewer';
import type { Field } from '@/types/form';
import { useAppForm } from '@/hooks/app.form';
import { useFormPageStore } from '@/stores/formPageStore';
import { Switch } from '@/components/ui/switch';

export const LogScreen = ({
  open,
  onClose,
  pageName,
  tabsValue,
  onTabChange,
  tabList,
  headcells,
  row,
  footerActions, // <-- NEW
  loading,
}: any) => {
  const activeTab = tabList.find((tab: any) => tab.value === tabsValue);
console.log(headcells,row);

  const Component = activeTab?.component;
  const activeClassName = activeTab?.className || '';

  const [animating, setAnimating] = useState(false);
  const [displayText, setDisplayText] = useState(
    `${pageName} ${activeTab?.label}`,
  );
  useEffect(() => {
    setAnimating(true);
    const t = setTimeout(() => {
      setDisplayText(`${pageName} ${activeTab?.label}`);
      setAnimating(false);
    }, 150); // duration of fade-out

    return () => clearTimeout(t);
  }, [pageName, activeTab]);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative bg-card dark:bg-black rounded-lg border w-full h-full mx-auto  flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card dark:bg-black px-6 py-4 border-b flex justify-between">
          <h2
            className={`
              text-2xl font-bold
              transition-opacity duration-150 ease-in-out
              ${animating ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {displayText}
          </h2>
          {/* 
          <button className="cursor-pointer" onClick={onClose}>
            <X />
          </button> */}
        </div>

        {/* Body */}
        <div className="overflow-auto p-6 flex-1">
          {/* Tabs */}
          <div className="flex justify-end mb-1">
            {pageName !== 'Finalized' && (
              <Tabs value={tabsValue} defaultValue={tabsValue}>
                <TabsList className="flex gap-3">
                  {tabList.map((tab: any) => (
                    <TabsTrigger
                      className="cursor-pointer"
                      key={tab.value}
                      value={tab.value}
                      onClick={() => onTabChange(tab.value)}
                    >
                      {tab?.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Dynamic Content */}
          <div>
            <div
            //   className={`break-words ${loading ? 'animate-pulse h-[58vh] flex items-center justify-center' : activeClassName}`}
            >
              {loading ? (
                <Loader />
              ) : (
                Component && <Component row={row} headcells={headcells} />
              )}
            </div>
          </div>
        </div>

        {/* Footer — renders only if custom actions passed */}
        {footerActions && (
          <div className="border-t px-6 py-4 flex justify-end gap-3 bg-card dark:bg-black">
            {footerActions}
          </div>
        )}
      </div>
    </Modal>
  );
};

export function ConfirmationModalScreen({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = 'Confirm',
  confirmButtonColor = 'red',
  cancelButtonText = 'Cancel',
  cancelButtonColor,
  disableCancelButton = false,
  disableConfirmButton = false,
}: ConfirmationModalProps): JSX.Element {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="confirmation-modal-title"
      aria-describedby="confirmation-modal-description"
    >
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto text-center">
          <h2 id="confirmation-modal-title" className="text-xl font-bold mb-4">
            {title}
          </h2>
          {typeof description === 'string' ? (
            <p id="confirmation-modal-description" className="mb-6">
              {description}
            </p>
          ) : (
            description
          )}
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              disabled={disableCancelButton}
              className={`px-4 cursor-pointer py-2 bg-${cancelButtonColor ? cancelButtonColor : 'white'}-300 text-black rounded-md border border-black transition-colors 
    ${cancelButtonColor ? `hover:bg-${cancelButtonColor}-500 hover:border-${cancelButtonColor}-700` : 'hover:bg-gray-200 hover:border-gray-700'}`}
            >
              {cancelButtonText}
            </button>
            <button
              onClick={onConfirm}
              disabled={disableConfirmButton}
              className={`px-4 cursor-pointer py-2 bg-${confirmButtonColor}-500 text-white rounded-md hover:bg-${confirmButtonColor}-700 transition-colors`}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

interface CustomFormScreenProps {
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
  isTableView: boolean;
}

export function CustomScreenForm({
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
  isTableView,
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
}: CustomFormScreenProps) {
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
    //   className={
    //     styles?.container ||
    //     'flex items-center justify-center min-h-screen p-4 bg-gray-50 '
    //   }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        // className={
        //   styles?.form ||
        //   'w-full max-w-2xl rounded-xl backdrop-blur-md shadow-xl bg-white flex flex-col'
        // }
        // style={{ maxHeight: '90vh' }}
      >
        {/* Sticky Header */}
        {!disableLabel && (
          <div className="flex justify-center mb-2 sticky top-0 bg-white z-10 px-5 pt-5 pb-4 border-b dark:bg-background dark:text-[()--bg-secondary-foreground] border-gray-200 ">
            <label
              htmlFor={label}
              className={
                styles?.label ||
                'text-2xl font-bold text-gray-800 dark:bg-background dark:text-white'
              }
            >
              {label}
            </label>
          </div>
        )}
        {/* Scrollable Form Fields */}
        <div>
          {/* Extra Summary Preview / Bill / Custom Component */}
          {extraContent && (
            <div className="w-full p-4 border-b border-gray-300">
              {extraContent}
            </div>
          )}
        </div>
        {isTableView ? (
          <div className="overflow-x-auto">
            <table className="w-full border rounded-md text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {fields
                    .filter((f) => !f.hidden)
                    .map((fieldItem: Field) => (
                      <th key={fieldItem.name} className="p-3 border text-left">
                        {fieldItem.label}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  {fields.map((fieldItem: Field) => {
                    if (fieldItem.hidden) return null;

                    fieldItem =
                      buttonLabel === 'View'
                        ? { ...fieldItem, disabled: true }
                        : fieldItem;

                    return (
                      <td key={fieldItem.name} className="p-3 border">
                        <td className="p-3">
                          <form.AppField
                            name={fieldItem.name}
                            validators={validationSchema(fieldItem)}
                          >
                            {(fieldProps) =>
                              fieldItem.type === 'text' ? (
                                <fieldProps.TextField
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
                                      const cleaned = value.replace(
                                        /[^a-zA-Z ]/g,
                                        '',
                                      );
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
                                      const cleaned = value.replace(
                                        /[^0-9]/g,
                                        '',
                                      );
                                      fieldItem.onChange?.(name, cleaned, form);
                                      setPageField(label, name, value);
                                      form.setFieldValue(name, cleaned);
                                    } else if (
                                      name === 'amountPaid' ||
                                      name === 'amountApproved' ||
                                      name === 'advanceConsumed' ||
                                      name === 'totalAmmountNogst' ||
                                      name === 'totalAmountNoGst' ||
                                      name === 'advancePaid' ||
                                      name === 'rentAmount' ||
                                      name === 'totalAmountNogst' ||
                                      name === 'securityDepositAmount' ||
                                      name === 'totalAmount' ||
                                      name === 'totalAmmountNoGst' ||
                                      name === 'totalSalaryAmount'
                                    ) {
                                      // allow digits and dot
                                      let cleaned = value.replace(
                                        /[^0-9.]/g,
                                        '',
                                      );

                                      // allow only ONE dot
                                      const parts = cleaned.split('.');
                                      if (parts.length > 2) {
                                        cleaned =
                                          parts[0] +
                                          '.' +
                                          parts.slice(1).join('');
                                      }

                                      fieldItem.onChange?.(name, cleaned, form);
                                      setPageField(label, name, cleaned);
                                      form.setFieldValue(name, cleaned);
                                    } else {
                                      fieldItem.onChange?.(name, value, form);
                                      setPageField(label, name, value);
                                      form.setFieldValue(name, value);
                                    }
                                  }}
                                  disabled={fieldItem.disabled}
                                />
                              ) : fieldItem.type === 'number' ? (
                                <fieldProps.TextField
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
                                    if (
                                      e.key === '-' ||
                                      e.key.toLowerCase() === 'e'
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  hidden={fieldItem.hidden}
                                  onChange={(name, value) => {
                                    const sanitized = Math.max(
                                      0,
                                      Number(value) || 0,
                                    );
                                    setPageField(label, `${sanitized}`, value);
                                    fieldItem.onChange?.(name, sanitized, form);
                                    form.setFieldValue(name, sanitized);
                                  }}
                                />
                              ) : fieldItem.type === 'select' ? (
                                <fieldProps.SelectField
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
                              ) : fieldItem.type === 'date' ? (
                                <fieldProps.DatePicker
                                  required={fieldItem.required}
                                  futureDate={fieldItem.futureDate}
                                  styles={
                                    fieldItem.disabled
                                      ? disabledStyle
                                      : fieldItem.styles
                                  }
                                  onChange={(_name: string, date: Date) => {
                                    fieldItem.onChange?.(
                                      fieldItem.name,
                                      date,
                                      form,
                                    );
                                    setPageField(label, fieldItem.name, date);
                                    form.setFieldValue(fieldItem.name, date);
                                  }}
                                  hidden={fieldItem.hidden}
                                  disabled={fieldItem.disabled}
                                />
                              ) : fieldItem.type === 'productMultiSelect' ? (
                                <div>
                                  <fieldProps.MultiSelect
                                    required={fieldItem.required}
                                    options={options[fieldItem.name] ?? []}
                                    styles={
                                      fieldItem.disabled
                                        ? disabledStyle
                                        : fieldItem.styles
                                    }
                                    selected={form
                                      .getFieldValue(fieldItem.name)
                                      .flat()}
                                    onChange={(value) => {
                                      setPageField(
                                        label,
                                        fieldItem.name,
                                        value,
                                      );
                                      fieldItem.onChange?.(
                                        fieldItem.name,
                                        value,
                                        form,
                                      );
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
                                  options={options[fieldItem.name] ?? []}
                                  required={fieldItem.required}
                                  styles={
                                    fieldItem.disabled
                                      ? disabledStyle
                                      : fieldItem.styles
                                  }
                                  selected={form.getFieldValue(fieldItem.name)}
                                  onChange={(value) => {
                                    setPageField(label, fieldItem.name, value);
                                    fieldItem.onChange?.(
                                      fieldItem.name,
                                      value,
                                      form,
                                    );
                                    fieldProps.setValue(value);
                                  }}
                                  placeholder={
                                    fieldItem.placeholder || 'Select options'
                                  }
                                  disabled={fieldItem.disabled}
                                />
                              ) : fieldItem.type === 'toggle' ? (
                                <div className="flex justify-center">
                                  <fieldProps.Switch
                                    checked={
                                      !!form.getFieldValue(fieldItem.name)
                                    }
                                    disabled={fieldItem.disabled}
                                    onCheckedChange={(value) => {
                                      form.setFieldValue(fieldItem.name, value);
                                      fieldItem.onChange?.(
                                        fieldItem.name,
                                        value,
                                        form,
                                      );
                                    }}
                                  />
                                </div>
                              ) : fieldItem.type === 'multiitems' ? (
                                <fieldProps.MultiItemsField
                                  label={fieldItem.label}
                                  itemFields={fieldItem.itemFields ?? []}
                                  value={form.state.values[fieldItem.name]}
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
                                    formRef?: any,
                                    editingField?: any,
                                    removedItem?: any,
                                  ) => {
                                    form.setFieldValue(name, value);
                                    setPageField(label, name, [...value]);
                                    fieldItem.onChange?.(
                                      name,
                                      value,
                                      form||formRef,
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
                              ) : fieldItem.type === 'checkbox' ? (
                                <div className="mt-6 flex gap-2 items-center">
                                  <label className="text-sm font-medium text-gray-700">
                                    {fieldItem.label}
                                  </label>

                                  <fieldProps.Checkbox
                                    required={fieldItem.required}
                                    styles={
                                      fieldItem.disabled
                                        ? disabledStyle
                                        : fieldItem.styles
                                    }
                                    checked={
                                      !!form.getFieldValue(fieldItem.name)
                                    }
                                    disabled={fieldItem.disabled}
                                    onCheckedChange={(
                                      checked: boolean | 'indeterminate',
                                    ) => {
                                      const value = checked === true;

                                      form.setFieldValue(fieldItem.name, value);
                                      setPageField(
                                        label,
                                        fieldItem.name,
                                        value,
                                      );

                                      fieldItem.onChange?.(
                                        fieldItem.name,
                                        value,
                                        form,
                                      );
                                    }}
                                  />
                                </div>
                              ) : fieldItem.type === 'file' ? (
                                <fieldProps.MultiPdfUploader
                                  fieldName={fieldItem.name}
                                  styles={fieldItem.styles}
                                  required={fieldItem.required}
                                  value={form.getFieldValue(fieldItem.name)}
                                  type={fieldItem.type}
                                  onChange={(name, value) => {
                                    setPageField(label, name, value);
                                    fieldItem.onChange?.(name, value, form);
                                    form.setFieldValue(name, value[0].base64);
                                  }}
                                  placeholder={
                                    fieldItem.placeholder || 'Choose File'
                                  }
                                  disabled={fieldItem.disabled}
                                  acceptTypes={fieldItem.acceptTypes}
                                  hidden={fieldItem.hidden}
                                />
                              ) : fieldItem.type === 'activityMap' ? (
                                <fieldProps.RoleInitializer
                                  fieldItem={fieldItem}
                                  activities={options['activities'] ?? []}
                                  onClick={(
                                    activityName: string,
                                    header: string,
                                  ) => {
                                    fieldItem.onChange?.(activityName, header);
                                    const path = `${fieldItem.name}.${activityName}.${header.toLowerCase()}`;
                                    const fieldValue = form.getFieldValue(path);
                                    form.setFieldValue(
                                      path,
                                      fieldValue === 1 ? 0 : 1,
                                    );
                                    if (activityName == 'All') {
                                      fieldItem.activityArr?.map(
                                        (activity: string) => {
                                          const innerPath = `${fieldItem.name}.${activity}.${header.toLowerCase()}`;
                                          form.setFieldValue(
                                            innerPath,
                                            fieldValue === 1 ? 0 : 1,
                                          );
                                        },
                                      );
                                    }
                                  }}
                                />
                              ) : null
                            }
                          </form.AppField>
                        </td>
                      </td>
                    );
                  })}
                </tr>
                {fields
                  .filter((f) => f.type === 'multiItems')
                  .map((fieldItem) => (
                    <div key={fieldItem.name} className="w-full mt-6">
                      <form.AppField name={fieldItem.name}>
                        {(fieldProps) => (
                          <fieldProps.MultiItemsField
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
              </tbody>
            </table>
          </div>
        ) : null}

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

interface CustomScreenProps {
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

export function CustomScreen({
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
}: CustomScreenProps) {
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
        {!disableLabel && (
          <div className="flex justify-center mb-2 sticky top-0 bg-white z-10 px-5 pt-5 pb-4 border-b dark:bg-background dark:text-[()--bg-secondary-foreground] border-gray-200 ">
            <label
              htmlFor={label}
              className={
                styles?.label ||
                'text-2xl font-bold text-gray-800 dark:bg-background dark:text-white'
              }
            >
              {label}
            </label>
          </div>
        )}
        {/* Scrollable Form Fields */}
        <div className="overflow-y-auto overflow-x-hidden dark:bg-background flex-1 p-4 md:p-6">
          {/* Extra Summary Preview / Bill / Custom Component */}
          {extraContent && (
            <div className="w-full p-4 border-b border-gray-300">
              {extraContent}
            </div>
          )}

          <div
            className={
              styles?.grid ||
              'grid grid-cols-1 sm:grid-cols-gap-4  md:gap-6 w-full'
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
                            } else if (
                              name === 'amountPaid' ||
                              name === 'amountApproved' ||
                              name === 'advanceConsumed' ||
                              name === 'totalAmmountNogst' ||
                              name === 'totalAmountNoGst' ||
                              name === 'advancePaid' ||
                              name === 'rentAmount' ||
                              name === 'totalAmountNogst' ||
                              name === 'securityDepositAmount' ||
                              name === 'totalAmount' ||
                              name === 'totalAmmountNoGst' ||
                              name === 'totalSalaryAmount'
                            ) {
                              // allow digits and dot
                              let cleaned = value.replace(/[^0-9.]/g, '');

                              // allow only ONE dot
                              const parts = cleaned.split('.');
                              if (parts.length > 2) {
                                cleaned =
                                  parts[0] + '.' + parts.slice(1).join('');
                              }

                              fieldItem.onChange?.(name, cleaned, form);
                              setPageField(label, name, cleaned);
                              form.setFieldValue(name, cleaned);
                            } else {
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
                      ) : fieldItem.type === 'date' ? (
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
                          selected={form.getFieldValue(fieldItem.name)}
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
                      ) : fieldItem.type === 'checkbox' ? (
                        <div className="mt-6 flex gap-2 items-center">
                          <label className="text-sm font-medium text-gray-700">
                            {fieldItem.label}
                          </label>

                          <fieldProps.Checkbox
                            required={fieldItem.required}
                            styles={
                              fieldItem.disabled
                                ? disabledStyle
                                : fieldItem.styles
                            }
                            checked={!!form.getFieldValue(fieldItem.name)}
                            disabled={fieldItem.disabled}
                            onCheckedChange={(
                              checked: boolean | 'indeterminate',
                            ) => {
                              const value = checked === true;

                              form.setFieldValue(fieldItem.name, value);
                              setPageField(label, fieldItem.name, value);

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
