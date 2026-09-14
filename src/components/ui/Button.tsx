import type { ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "outline" | "ghost" | "secondary" | "glass";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-chaos-pink to-chaos-purple text-white shadow-lg shadow-chaos-pink/20 hover:shadow-chaos-pink/40",
  outline:
    "border border-chaos-pink/30 bg-surface-variant/20 backdrop-blur-md text-chaos-pink hover:bg-surface-variant/40 hover:border-chaos-pink/50",
  ghost: "text-on-surface-variant hover:text-chaos-pink",
  secondary:
    "bg-chaos-blue text-on-secondary shadow-lg shadow-chaos-blue/20",
  glass:
    "bg-surface-bright/50 backdrop-blur-md hover:bg-surface-bright/70",
};

const sizeStyles: Record<string, string> = {
  sm: "px-6 py-2 text-sm",
  md: "px-8 py-3",
  lg: "px-10 py-5 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  size = "md",
  href,
  onClick,
  disabled,
}: ButtonProps) {
  const classes = `inline-block text-center rounded-lg font-bold transition-all duration-200 active:scale-95 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
