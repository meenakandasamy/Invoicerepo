import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
interface MultiItemsFieldProps {
  label: string;
  value: Array<any>;
  itemFields: Array<{
    default?: string;
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    referValue?: string;
    disabled?: boolean;
    onChange?: (name: string, value: any, form?: any, index?: number) => void;
  }>;
  onChange: (name: string, value: any, form?: any, index?: number) => void;
  disabled?: boolean;
  ButtonDisabled?: boolean;
  styles?: any;
  options: Record<string, Array<any>>;
  form: any;
  fieldName: string;
  fieldProps: any;
  edit?: boolean;
  listOfTabs?: Array<string>;
  defaultTab?: string;
  handleTabFn?: (tab: string, form?: any) => void;
  disableIndex?: Array<any>;
}

export const MultiItemsField: React.FC<MultiItemsFieldProps> = ({
  label,
  value = [],
  itemFields,
  onChange,
  disabled,
  ButtonDisabled,
  styles,
  options,
  form,
  fieldName,
  fieldProps,
  edit = false,
  listOfTabs,
  defaultTab,
  handleTabFn,
  disableIndex = [],
}) => {
  const addItem = () => {
    const lastLevel = value.length
      ? Number(value[value.length - 1].levelId) || 0
      : 0;

    const nextLevelId = lastLevel + 1;

    const newItem: any = {};
    itemFields.forEach((f) => {
      newItem[f.name] = f.referValue
        ? form.getFieldValue(f.referValue)
        : f.name === 'levelId'
          ? nextLevelId.toString()
          : (f.default ?? '');
    });

    onChange(fieldName, [...value, newItem]);
  };

  const removeItem = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    const removedItem = value[index];

    if (label == 'Approver Details' && removedItem.approverLevelId) {
      onChange(fieldName, value, '', removedItem);
    } else {
      onChange(fieldName, updated, '', removedItem);
    }
  };

  const sanitizeCurrency = (val: string) => {
    if (!val) return '';
    const cleaned = val.replace(/[^0-9.]/g, '');
    const [int, ...dec] = cleaned.split('.');
    return dec.length ? `${int}.${dec.join('')}` : int;
  };

  const updateField = (
    index: number,
    field: string,
    val: any,
    type?: string,
  ) => {
const updated = value.map((item) => ({ ...item }));
    const finalValue =
      type === 'currency' && typeof val === 'string'
        ? sanitizeCurrency(val)
        : val;

    updated[index][field] = finalValue;

    onChange(fieldName, updated, form, index);
  };

  const { TextField, SelectField, MultiSelect, DatePicker, Checkbox } =
    fieldProps;

  const [selectedTab, setSelectedTab] = React.useState<string>(
    defaultTab || '',
  );

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-md border-gray-300 overflow-x-auto">
      <div className="flex justify-between items-center">
        <label className={styles?.label}>{label}</label>

        {listOfTabs && listOfTabs.length > 0 && (
          <Tabs defaultValue={defaultTab ? defaultTab : listOfTabs[0]}>
            <TabsList className="flex gap-2">
              {listOfTabs.map((tab) => (
                <TabsTrigger
                  value={tab}
                  key={tab}
                  onClick={() => {
                    handleTabFn?.(tab, form);
                    setSelectedTab(tab);
                  }}
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">S.No</th>
            {itemFields.map((f) => (
              <th key={f.name} className="p-2 border">
                {f.label}
              </th>
            ))}
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {value.map((item, index) => (
            <tr key={index} className="border">
              <td className="p-2 border text-center font-medium">
                {index + 1}
              </td>

              {itemFields.map((f) => {
                const fieldValue = item[f.name] ?? '';
                if (f.type === 'checkbox') {
                  return (
                    <td key={f.name} className="p-2 border text-center">
                      <Checkbox
                        checked={!!fieldValue}
                        disabled={disabled || f.disabled}
                        onCheckedChange={(checked: any) => {
                          const value = checked === true;
                          updateField(index, f.name, value);
                          f.onChange?.(f.name, value, form, index);
                        }}
                      />
                    </td>
                  );
                }

                if (f.type === 'text') {
                  return (
                    <td key={f.name} className="p-2 border">
                      <TextField
                        label=""
                        placeholder={f.placeholder}
                        value={fieldValue}
                        styles={styles}
                        disabled={disabled || f.disabled}
                        onChange={(_n: string, v: any) =>
                          updateField(index, f.name, v)
                        }
                      />
                    </td>
                  );
                }

                if (f.type === 'number') {
                  return (
                    <td key={f.name} className="p-2 border">
                      <TextField
                        type="number"
                        label=""
                        value={fieldValue}
                        min={1}
                        step={1}
                        styles={styles}
                        disabled={disabled || f.disabled}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === '-' || e.key.toLowerCase() === 'e') {
                            e.preventDefault();
                          }
                        }}
                        onChange={(_n: string, v: any) => {
                          const sanitized = Math.max(1, Number(v) || 1); // ✅ enforce ≥ 1
                          updateField(index, f.name, sanitized);
                        }}
                      />
                    </td>
                  );
                }

                if (f.type === 'select') {
                  return (
                    <td key={f.name} className="p-2 border">
                      <SelectField
                        label=""
                        values={options[f.name] ?? []}
                        selected={fieldValue}
                        placeholder={f.placeholder}
                        styles={styles}
                        disabled={disabled || f.disabled}
                        onChange={(_n: string, v: any) => {
                          updateField(index, f.name, v);
                          f.onChange?.(f.name, v, form, index);
                        }}
                      />
                    </td>
                  );
                }

                if (f.type === 'multiSelect') {
                  return (
                    <td key={f.name} className="p-2 border">
                      <MultiSelect
                        label=""
                        options={options[f.name] ?? []}
                        selected={fieldValue}
                        styles={styles}
                        disabled={disabled || f.disabled}
                        onChange={(_n: string, v: any) =>
                          updateField(index, f.name, v)
                        }
                      />
                    </td>
                  );
                }

                if (f.type === 'date') {
                  return (
                    <td key={f.name} className="p-2 border">
                      <DatePicker
                        label=""
                        required={false}
                        styles={styles}
                        disabled={disabled || f.disabled}
                        value={fieldValue}
                        onChange={(_n: string, v: any) =>
                          updateField(index, f.name, v)
                        }
                      />
                    </td>
                  );
                }

                if (f.type === 'currency') {
                  return (
                    <td key={f.name} className="p-2 border">
                      <TextField
                        label=""
                        placeholder={f.placeholder}
                        value={fieldValue}
                        styles={styles}
                        disabled={disabled || f.disabled}
                        onChange={(_n: string, v: any) =>
                          updateField(index, f.name, v, f.type)
                        }
                      />
                    </td>
                  );
                }

                return <td key={f.name} />;
              })}

              <td className="p-2 border text-center">
                {disabled ||
                value.length - 1 !== index ||
                (label !== 'Approver Details' && ButtonDisabled) ||
                selectedTab == '0th Approver' ? null : (
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeItem(index)}
                  >
                    <DeleteIcon />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {disabled ||
      ButtonDisabled ||
      (edit && label == 'Approver Details') ||
      selectedTab == '0th Approver' ? null : (
        <button
          type="button"
          onClick={addItem}
          disabled={label == 'Approver Details' && value.length > 4}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed mt-2"
        >
          <AddCircleOutlineIcon fontSize="small" className="cursor-pointer" />
          Add Line Item
        </button>
      )}
    </div>
  );
};
