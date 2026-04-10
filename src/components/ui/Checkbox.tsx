import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-slate-200 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-indigo-600 checked:border-indigo-600 appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
      <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5" />
    </div>
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
