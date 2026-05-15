import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@tanstack/react-form';
import { Search } from 'lucide-react';
import { useFieldContext } from '../../hooks/app.form-context';
import { Input } from '../ui/input';
import { ErrorMessages } from './errorMessage';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SelectField({
  label,
  values,
  styles,
  disabled,
  required,
  selected,
  hidden,
  placeholder,
  onChange,
  disabledOptions = [],
}: {
  label: string;
  values: Array<string | number>;
  styles?: any;
  disabled?: boolean;
  required?: boolean;
  selected?: string;
  hidden?: boolean;
  placeholder?: string;
  onChange?: (name: string, value: any) => void;
  disabledOptions?: Array<string>;
}) {
  const [search, setSearch] = useState('');
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const filteredValues = useMemo(() => {
    const seen = new Set<string>();
    return values
      .filter((val) => {
        if (label === 'GST %' && val === 0) return true; // keep 0
        return !!val;
      })
      .map((val) => val.toString()) // normalize to string
      .filter((strVal) => strVal.toLowerCase().includes(search.toLowerCase()))
      .filter((strVal) => {
        if (seen.has(strVal)) return false;
        seen.add(strVal);
        return true;
      });
  }, [search, values]);

  const handleChange = (value: string) => {
    field.handleChange(value); // Update TanStack Form
    field.handleBlur();
    onChange?.(field.name, value); // Optional custom handler
  };
  if (hidden) {
    return null;
  }
  // useEffect(() => {
  //   if (field.state.meta.isTouched && !field.state.meta.isValid) {
  //     // force validation or show error toast
  //   }
  // }, [field.state.meta]);

  return (
    <div className={styles?.wrapper ?? 'flex flex-col gap-1 w-[300px]'}>
      <label
        htmlFor={label}
        className={
          styles?.label ??
          'text-sm font-medium text-gray-700 dark:text-gray-300'
        }
      >
        {label}{' '}
        {required && !disabled && <span className="text-red-400"> *</span>}
      </label>
      <Select
        onValueChange={handleChange}
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        defaultValue={field.state.value?.toString() || ''}
        value={
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          selected ?? field.state.value?.toString()

        }
      >
        <SelectTrigger
          disabled={disabled}
          value={
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            selected ?? field.state.value?.toString()
          }
          className={`w-full h-9 px-3 py-2 rounded-md border border-gray-300 text-sm 
             text-gray-900 dark:text-gray-100
             dark:bg-background cursor-pointer ${disabled && "cursor-not-allowed bg-gray-300 "}`}
        >
          <SelectValue
            placeholder={placeholder || `Select ${label}`}
            className="text-gray-900 dark:text-primary-foreground"
          />
        </SelectTrigger>

        <SelectContent
          className="z-50 p-1 rounded-md shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 dark:text-[var(--primary-foreground)]"
          style={{ zIndex: 9999 }}
        >
          {/* Search Input with Icon */}
          <div className="relative px-2 py-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              id="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${disabled && 'cursor-not-allowed bg-gray-300'}w-full pl-9 pr-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0 cursor-pointer`}
            />
          </div>

          {/* Scrollable Options List */}
          <div className="max-h-48 overflow-y-auto pr-1">
            {filteredValues.length > 0 ? (
              filteredValues.map((value) => (
                <SelectItem
                  key={value}
                  value={value.toString()}
                  disabled={disabledOptions.includes(value.toString())}
                  className="text-sm text-gray-900 dark:text-gray-100 px-2 py-1.5 hover:bg-blue-100 dark:hover:[color:var(--primary-foreground)] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {value}
                </SelectItem>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-400 dark:text-gray-500 text-sm">
                No matching options
              </div>
            )}
          </div>
        </SelectContent>
      </Select>

      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
