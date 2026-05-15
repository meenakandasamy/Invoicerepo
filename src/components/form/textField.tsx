import { useStore } from '@tanstack/react-form';
import { ErrorMessages } from './errorMessage';
import { useFieldContext } from '@/hooks/app.form-context';

interface TextFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  styles?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
  value?: string | number;
  disabled?: boolean;
  hidden?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (name: string, value: any) => void;
}

export function TextField({
  label,
  placeholder,
  type = 'text',
  styles = {},
  value,
  required = false,
  disabled = false,
  onKeyDown,
  onChange,
  hidden
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Allow only numbers and at most one decimal point
    if (type === "number") {
      // Remove invalid characters
      newValue = newValue.replace(/[^0-9.]/g, "");

      // Prevent more than one decimal
      const parts = newValue.split(".");
      if (parts.length > 2) {
        parts.pop();
        newValue = parts.join(".");
      }
    }

    field.handleChange(newValue);
    onChange?.(field.name, newValue);
  };

  const preventNumberScrolling = (e: React.WheelEvent<HTMLInputElement>) => {
    if (type === "number") e.currentTarget.blur();
  };

  const preventArrowChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "number" && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
    }
    onKeyDown?.(e);
  };

  if (hidden) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
      <label
        htmlFor={field.name}
        className={styles.label}
      >
        {label}
        {required && !disabled && <span className="text-red-400"> *</span>}
      </label>

      <input
        id={field.name}
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        value={value ?? field.state.value ?? ""}
        placeholder={placeholder}
        type="text"
        disabled={disabled}
        onWheel={preventNumberScrolling}
        onKeyDown={preventArrowChange}
        onBlur={field.handleBlur}
        onChange={handleChange}
        onPaste={(e) => {
          if (type === "number") {
            const text = e.clipboardData.getData("text");
            if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault();
          }
        }}
        className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${styles.input || 'w-full px-3 py-2 border border-gray-300 rounded'
          }`}
      />

      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  );
}
