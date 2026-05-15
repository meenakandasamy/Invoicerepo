import * as React from 'react';
import { cn } from '@/lib/utils';
import { useResetFormStore } from '@/stores/resetFormStore';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = 'text', placeholder, onChange, value, ...props },
    ref,
  ) => {
    const [fileLabel, setFileLabel] = React.useState<string>('');
    const [showPassword, setShowPassword] = React.useState(false);

    const { reset } = useResetFormStore();

    const isFile = type === 'file';
    const isPassword = type === 'password';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isFile && e.target.files) {
        const names = Array.from(e.target.files)
          .map((f) => f.name)
          .join(', ');
        setFileLabel(names);
      }

      onChange?.(e);
    };

    // ---------------- FILE INPUT ----------------
    if (isFile) {
      const isDisabled = props.disabled;

      return (
        <div className="relative w-full">
          <label
            htmlFor={isDisabled ? undefined : props.id}
            onClick={(e) => isDisabled && e.preventDefault()}
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm transition-colors',
              isDisabled
                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                : 'bg-transparent text-muted-foreground cursor-pointer hover:bg-accent',
              className,
            )}
          >
            <span
              className={cn(
                'truncate',
                isDisabled ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {(!reset && fileLabel) ||
                value ||
                placeholder ||
                'Upload file(s)...'}
            </span>

            <span
              className={cn(
                'text-xs font-medium',
                isDisabled ? 'text-muted-foreground' : 'text-primary',
              )}
            >
              Browse
            </span>
          </label>

          <input
            id={props.id}
            name={props.name}
            ref={ref}
            type="file"
            onChange={handleChange}
            className="hidden"
            disabled={isDisabled}
            {...props}
          />
        </div>
      );
    }

    // ---------------- PASSWORD INPUT ----------------
    if (isPassword) {
      return (
        <div className="relative w-full">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-10 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
              className,
            )}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      );
    }

    // ---------------- NORMAL INPUT ----------------
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          props.id !== 'search' &&
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';
export { Input };
