import { useFormContext } from '@/hooks/app.form-context';

export function buttonField({
  label,
  className,
  buttonType,
  onClick,
  toBackend = false,
}: {
  label: string;
  className: string;
  buttonType?: 'submit' | 'button' | 'reset';
  onClick?: () => void;
  toBackend?: boolean;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button
          type={buttonType ?? 'submit'}
          disabled={isSubmitting || toBackend}
          className={className}
          onClick={onClick}
        >
          {`${label} ${isSubmitting || toBackend ? '...' : ''}`}
        </button>
      )}
    </form.Subscribe>
  );
}
