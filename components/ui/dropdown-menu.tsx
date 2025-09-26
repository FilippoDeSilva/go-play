import * as React from "react";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";

// Root
export const DropdownMenu = DropdownPrimitive.Root;

// Trigger
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;

// Portal (optional but good for overflow issues)
export const DropdownMenuPortal = DropdownPrimitive.Portal;

// Content with styling + animation
export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(function DropdownMenuContent(
  { className = "", sideOffset = 8, align = "end", ...props },
  ref
) {
  return (
    <DropdownMenuPortal>
      <DropdownPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={
          "z-50 min-w-[10rem] overflow-hidden rounded-md border border-gray-200/40 dark:border-gray-700/40 bg-white dark:bg-slate-800 p-1 text-slate-700 dark:text-slate-200 shadow-lg ring-1 ring-black/5 dark:ring-white/5 " +
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " +
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 " +
          className
        }
        {...props}
      />
    </DropdownMenuPortal>
  );
});

// Item
export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(function DropdownMenuItem({ className = "", ...props }, ref) {
  return (
    <DropdownPrimitive.Item
      ref={ref}
      className={
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-sm outline-none " +
        "transition-colors focus:bg-gray-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-slate-100 " +
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50 " +
        className
      }
      {...props}
    />
  );
});

export default DropdownMenu;
