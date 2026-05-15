import React, { useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useStore } from '@tanstack/react-form';
import { ErrorMessages } from './errorMessage';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useFieldContext } from '@/hooks/app.form-context';

interface MultiSelectProps {
  label: string;
  styles?: any;
  options: Array<string | number>;
  selected: Array<string | number>;
  onChange: (selected: Array<string | number>) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledOptions?: Array<string>;
  required?: boolean;
  onBlur?: () => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  styles = {},
  options = [],
  selected = [],
  onChange,
  onBlur, // <- here
  placeholder = 'Select options...',
  disabled,
  disabledOptions = [],
  required,
}) => {
  const field = useFieldContext<Array<string | number>>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>(null);

  const handleBlur = () => {
    // delay ensures popover clicks don't trigger blur immediately
    timeoutRef.current = setTimeout(() => {
      if (onBlur) onBlur();
    }, 100);
  };

  const handleFocus = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const toggleOption = (value: string | number) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={styles?.wrapper}
    >
      <label
        htmlFor={label}
        className={cn('text-sm font-medium text-gray-700', styles?.label)}
      >
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={
              styles?.button ||
              'w-full justify-between hover:bg-transparent font-normal cursor-pointer'
            }
          >
            <p className="text-left truncate">
              {selected.length
                ? Array.isArray(selected)
                  ? selected.join(', ')
                  : selected
                : placeholder}
            </p>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(' min-w-[17vw] p-0 z-[9999]', styles?.popover)}
        >
          <Command>
            {options.length > 0 ? (
              <>
                <CommandInput placeholder="Search..." />
                <CommandEmpty>
                  <div className="text-sm text-gray-500 opacity-50">
                    No results found.
                  </div>
                </CommandEmpty>
                <CommandList>
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      onSelect={() => toggleOption(option)}
                      className={cn('cursor-pointer', styles?.item)}
                      disabled={disabledOptions.includes(option.toString())}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-6 w-4 items-center justify-center rounded-sm border',
                          selected.includes(option)
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50',
                          styles?.checkIcon,
                        )}
                      >
                        {selected.includes(option) && (
                          <Check className={cn('h-6 w-4', styles?.check)} />
                        )}
                      </div>
                      {option}
                    </CommandItem>
                  ))}
                </CommandList>
              </>
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center">
                No options available
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {field.state.meta.isTouched && field.state.value?.length === 0 && (
        <ErrorMessages errors={errors} />
      )}
    </div>
  );
};
