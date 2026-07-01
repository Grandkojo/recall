import { forwardRef, useId, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/** Sharp-cornered labelled input. Password fields get a show/hide eye toggle. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, className = '', type, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const isPassword = type === 'password';
    const [reveal, setReveal] = useState(false);
    const resolvedType = isPassword ? (reveal ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={error ? true : undefined}
            className={[
              'h-12 w-full border bg-canvas px-4 text-[15px] font-medium text-ink outline-none transition-colors',
              'placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20',
              isPassword ? 'pr-12' : '',
              error ? 'border-error' : 'border-line-strong',
              className,
            ].join(' ')}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? 'Hide password' : 'Show password'}
              aria-pressed={reveal}
              tabIndex={-1}
              className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-muted transition-colors hover:text-ink"
            >
              <HugeiconsIcon
                icon={reveal ? ViewOffSlashIcon : ViewIcon}
                size={20}
                color="currentColor"
                strokeWidth={1.6}
              />
            </button>
          )}
        </div>

        {error && <span className="text-[13px] font-medium text-error">{error}</span>}
      </div>
    );
  }
);
TextField.displayName = 'TextField';
