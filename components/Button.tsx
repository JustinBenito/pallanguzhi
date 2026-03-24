import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  roundedCorner?: "tl" | "tr" | "bl" | "br" | "all" | "none";
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  roundedCorner = "all",
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "skeuomorph-btn font-[family-name:var(--font-inter)] font-semibold transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover-lift relative overflow-hidden";

  const variantStyles = {
    primary: "bg-gradient-to-br from-clay-400 to-clay-500 text-sandstone-50 hover:from-clay-500 hover:to-clay-600 shadow-md hover:shadow-lg",
    secondary: "bg-gradient-to-br from-sandstone-300 to-sandstone-400 text-clay-800 hover:from-sandstone-400 hover:to-sandstone-500 shadow-sm hover:shadow-md",
    ghost: "bg-transparent border-2 border-clay-300 text-clay-700 hover:bg-sandstone-100 hover:border-clay-400",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const roundedStyles = {
    tl: "rounded-tl-xl rounded-br-sm rounded-bl-sm rounded-tr-sm",
    tr: "rounded-tr-xl rounded-bl-sm rounded-br-sm rounded-tl-sm",
    bl: "rounded-bl-xl rounded-tr-sm rounded-tl-sm rounded-br-sm",
    br: "rounded-br-xl rounded-tl-sm rounded-tr-sm rounded-bl-sm",
    all: "rounded-lg",
    none: "rounded-sm",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        roundedStyles[roundedCorner],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </button>
  );
};
