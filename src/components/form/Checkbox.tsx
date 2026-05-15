import { useStore } from '@tanstack/react-form';
import { ErrorMessages } from './errorMessage';
import { useFieldContext } from '@/hooks/app.form-context';
import { Checkbox, FormControl, FormControlLabel, FormHelperText } from '@mui/material';

interface CheckboxFieldProps {
  label: string | number;
  styles?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
  checked?: boolean;
  disabled?: boolean;
  isSelectAll?: boolean; // New prop to identify the "Select All" checkbox
  onChange?: (name: string, value: boolean) => void;
  onSelectAllChange?: (checked: boolean) => void; // New callback for Select All
}

export function CheckboxField({
  label,
  styles = {},
  disabled = false,
  checked,
  isSelectAll = false,
  onChange,
  onSelectAllChange,
}: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;

    if (isSelectAll) {
      onSelectAllChange?.(newValue);
    } else {
      field.handleChange(newValue);
      onChange?.(field.name, newValue);
    }
  };

  return (
    <FormControl
      className={styles.wrapper}
      error={!!errors?.length}
      disabled={disabled}
      component="fieldset"
      variant="standard"
    >
      <FormControlLabel
        control={
          <Checkbox
            id={field.name}
            checked={checked ?? false}
            onChange={handleChange}
            className={styles.input}
            indeterminate={isSelectAll && checked === undefined}
            disabled={disabled}
          />
        }
        label={label}
        className={styles.label}
      />
      {errors && errors.length > 0 && (
        <FormHelperText>
          <ErrorMessages errors={errors} />
        </FormHelperText>
      )}
    </FormControl>
  );
}
