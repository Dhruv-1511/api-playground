import React from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDown } from "lucide-react";

const Select = React.forwardRef(({ className, options, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={twMerge(
          "flex h-9 w-full rounded-sm border border-input bg-transparent pl-3 pr-8 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        <ChevronDown size={14} />
      </div>
    </div>
  );
});

Select.displayName = "Select";

export { Select };
