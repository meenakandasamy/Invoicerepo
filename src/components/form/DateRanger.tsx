import * as React from 'react';
import { useStore } from '@tanstack/react-form';

import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useFieldContext } from '../../hooks/app.form-context';
import { ErrorMessages } from './errorMessage';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DatePicker({
  label,
  styles,
  onChange,
  disabled,
  futureDate,
  required,
  hidden,
}: {
  label: string;
  styles?: any;
  disabled?: boolean;
  required?: boolean;
  futureDate?: boolean;
  hidden?:boolean
  onChange?: (name: string, value: any) => void;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (field.state.value) {
      const d = new Date(field.state.value);
      return isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
  });
  const handleChange = (rawDate: Date | undefined) => {
    console.log(rawDate);
    field.handleChange(rawDate?.toDateString() as string);
    onChange?.(field.name, rawDate);
    setDate(rawDate);
    field.handleBlur();
  };
  if (hidden) {
    return null;
  }
  return (
    <div className={styles?.wrapper ?? 'flex flex-col gap-1'}>
      <label
        htmlFor={label}
        className={styles?.label ?? 'text-sm font-medium text-gray-700 dark:text-gray-100'}
      >
        {label} {required && <span className="text-red-400"> *</span>}
      </label>
      <Popover>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon />
            {date ? format(new Date(date), 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
          <Calendar
            mode="single"
            selected={date || new Date(field.state.value)}
            onSelect={handleChange}
            required={true}
            disabled={(day: Date) => {
              if (!futureDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return day > today;
              }
              return !!disabled;
            }}
          />
        </PopoverContent>
      </Popover>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
