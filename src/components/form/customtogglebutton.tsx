import clsx from "clsx";

interface ToggleButtonFieldProps {
  label: string;
  name: string;
  value: string;
  options: any;
  form: any;
  setPageField: (page: string, name: string, value: any) => void;
  pageLabel: string;
  onChange?: (name: string, value: any, form: any) => void;
  disabled?: boolean;
  required?:boolean
}

export function Customtogglebutton({
  label,
  name,
  value,
  options,
  form,
  setPageField,
  pageLabel,
  required,
  onChange,
  disabled,
}: ToggleButtonFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-500">
        {label}
        {required && !disabled && <span className="text-red-400"> *</span>}
      </label>

      <div className="flex border border-gray-300 rounded-md overflow-hidden w-full">
        {options.map((option: any) => {
          const selected = value === option;

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => {
                form.setFieldValue(name, option);
                setPageField(pageLabel, name, option);
                onChange?.(name, option, form);
              }}
              className={clsx(
                'px-4 py-2 text-sm font-medium transition-all w-full',
                selected
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}