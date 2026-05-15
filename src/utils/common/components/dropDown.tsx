import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useRef, useEffect } from 'react';

type DropdownSelectProps = {
  value: string | undefined;
  onChange: (val: string | number | undefined) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  showClearButton?: boolean;
  handleClear?: () => void;
  disabledOptions?: Array<string>;
  styles?: {
    wrapper?: string;
    trigger?: string;
    content?: string;
    searchInput?: string;
    option?: string;
    noOptions?: string;
    clearButton?: string;
  };
};

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  isLoading = false,
  disabled = false,
  showClearButton = false,
  handleClear,
  disabledOptions = [],
  styles = {},
}: DropdownSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open && inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
    return () => clearTimeout(timer);
  }, [open]);

  
  const handleClearClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (handleClear ?? (() => onChange(undefined)))();
  };

  // const filteredValues = useMemo(() => {
  //   return options.filter(({ label }) =>
  //     String(label).toLowerCase().includes((search ?? '').toLowerCase())
  //   );
  // }, [search, options]);
  const filteredValues = useMemo(() => {
  const seen = new Set<string>();
  return options
    .filter(({ label }) =>
      String(label).toLowerCase().includes((search ?? '').toLowerCase())
    )
    .filter(({ value }) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}, [search, options]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setOpen(true);
  };

 return (
  <div className={styles.wrapper ?? 'relative w-[250px]'}>
    <Select
      value={value}
      onValueChange={(val) => {
        onChange(val);
        setSearch('');
      }}
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setSearch('');
      }}
      disabled={disabled || isLoading}
    >
      {/* Relative container for trigger + clear button */}
      <div className="relative w-full">
        <SelectTrigger
          className={`w-full h-9 pl-3 ${showClearButton && value ? 'pr-8' : 'pr-3'} py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 cursor-pointer ${styles.trigger ?? ''}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClearClick}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-blue-500 z-20 ${styles.clearButton ?? ''}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <SelectContent
        className={`z-50 p-1 rounded-md shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900 ${styles.content ?? ''}`}
        style={{ zIndex: 9999 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative px-2 py-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            type="text"
            id="search"
            ref={inputRef}
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            onClick={handleInputClick}
            onKeyDown={handleInputKeyDown}
            className={`w-full pl-9 pr-3 py-1.5 text-sm border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0 cursor-pointer ${styles.searchInput ?? ''}`}
          />
        </div>

        {/* Options */}
        <div
          className="max-h-48 overflow-y-auto pr-1 min-w-[300px]"
          onClick={(e) => e.stopPropagation()}
        >
          {filteredValues.length > 0 ? (
            filteredValues.map(({ label, value }) => (
              <SelectItem
                key={value}
                value={value}
                disabled={disabledOptions.includes(value)}
                className={`text-sm text-gray-900 dark:text-gray-100 px-2 py-1.5 hover:bg-blue-100 dark:hover:[color:var(--primary-foreground)] disabled:opacity-50 disabled:pointer-events-none ${styles.option ?? ''}`}
              >
               <span className="block w-full truncate">{label}</span>
              </SelectItem>
            ))
          ) : (
            <div
              className={`px-4 py-2 text-gray-400 dark:text-gray-500 text-sm ${styles.noOptions ?? ''}`}
            >
              No matching options
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  </div>
);
}
