import type { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base classes with transition, ring focus, and font styles
  const baseClasses = "inline-flex items-center justify-center font-heading font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

  // Variant classes
  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/35 hover:-translate-y-0.5",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 hover:-translate-y-0.5",
    outline: "bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900/50 hover:-translate-y-0.5",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
    danger: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 hover:shadow-red-500/35 hover:-translate-y-0.5",
    glass: "glass-light text-slate-800 border border-white/50 shadow-sm hover:bg-white/80 hover:-translate-y-0.5 dark:glass-dark dark:text-slate-100 dark:border-white/10 dark:hover:bg-slate-900/50",
  };

  // Size classes
  const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-2.5",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 size={18} className="animate-spin" />}
      {!isLoading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
}