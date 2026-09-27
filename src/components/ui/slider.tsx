import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center h-8", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-white/[0.13]">
      <SliderPrimitive.Range className="absolute h-full bg-accent transition-accent" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-5 w-5 rounded-full border-[3px] border-ink bg-accent shadow-[0_4px_12px_-2px_rgba(0,0,0,0.7)] transition-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-powder"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

export { Slider };
