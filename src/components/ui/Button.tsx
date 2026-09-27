import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ctl text-sm font-medium transition-transform active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-[#1A0710] font-semibold hover:brightness-110 transition-accent",
        ghost:
          "border border-hairline bg-silk/[0.035] text-silk-dim hover:text-silk hover:border-silk/25",
        outline:
          "border border-white/10 text-silk-dim hover:text-silk hover:border-white/25 bg-transparent",
        link: "text-silk-faint underline underline-offset-4 decoration-white/10 hover:text-silk",
        destructive: "border border-stop/30 text-stop/80 hover:bg-stop/10 hover:border-stop/60",
      },
      size: {
        default: "h-auto px-4 py-3.5",
        sm: "h-auto px-3 py-2 text-xs",
        icon: "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
