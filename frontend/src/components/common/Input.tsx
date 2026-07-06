import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName = "",
      className = "",
      id,
      type = "text",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full text-left ${containerClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-heading font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none select-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            className={`w-full rounded-xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 bg-white/70 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 select-all
              ${leftIcon ? "pl-11" : ""}
              ${rightIcon ? "pr-11" : ""}
              ${
                error
                  ? "border-red-400 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:ring-blue-500/30"
              }
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-red-500 mt-0.5" id={`${id}-error`}>
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
