import * as React from 'react';
import { useStore } from '@tanstack/react-form';
import { useFieldContext } from '../../hooks/app.form-context';
import { ErrorMessages } from './errorMessage';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';

export function TimePicker({
  label,
  styles,
  onChange,
  disabled,
  required,
  hidden,
}: {
  label: string;
  styles?: any;
  disabled?: boolean;
  required?: boolean;
  hidden?: boolean;
  onChange?: (name: string, value: any) => void;
}) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const [time, setTime] = React.useState<Dayjs | null>(
    field.state.value ? dayjs(field.state.value, 'HH:mm') : null
  );

  const handleChange = (newValue: Dayjs | null) => {
    setTime(newValue);

    const formattedValue = newValue
      ? newValue.format('HH:mm')
      : '';

    field.handleChange(formattedValue);
    onChange?.(field.name, formattedValue);
    field.handleBlur();
  };

  if (hidden) {
    return null;
  }

  return (
    <div className={styles?.wrapper ?? 'flex flex-col gap-1'}>
      <label
        htmlFor={field.name}
        className={
          styles?.label ??
          'text-sm font-medium text-gray-700 dark:text-gray-100'
        }
      >
        {label}
        {required && <span className="text-red-400"> *</span>}
      </label>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiTimePicker
  value={time}
  onChange={handleChange}
  disabled={disabled}
  ampm={false}
  minutesStep={5}
  format="HH:mm"
  sx={{
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#EDE9FE', // violet-100
      borderRadius: '8px',

      '& fieldset': {
        borderColor: '#7C3AED',
      },

      '&:hover fieldset': {
        borderColor: '#7C3AED',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#7C3AED',
      },
    },

    '& .MuiSvgIcon-root': {
      color: '#7C3AED',
    },
  }}
  slotProps={{
    textField: {
      fullWidth: true,
      size: 'small',
    },
    popper: {
      sx: {
        '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
          backgroundColor: '#EDE9FE !important',
          color: '#7C3AED !important',
        },

        '& .MuiMultiSectionDigitalClockSection-item:hover': {
          backgroundColor: '#F5F3FF',
        },

        '& .MuiButton-root': {
          color: '#7C3AED',
        },

        '& .MuiClock-pin': {
          backgroundColor: '#7C3AED',
        },

        '& .MuiClockPointer-root': {
          backgroundColor: '#7C3AED',
        },

        '& .MuiClockPointer-thumb': {
          borderColor: '#7C3AED',
        },
      },
    },
  }}
/>
      </LocalizationProvider>

      {field.state.meta.isTouched && (
        <ErrorMessages errors={errors} />
      )}
    </div>
  );
}