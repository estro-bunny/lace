import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "lace-card rounded-card border p-4",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export { Card };
