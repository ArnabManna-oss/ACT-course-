import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const Select = ({ children, value, onValueChange, defaultValue }: any) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const val = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (value === undefined) setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className="relative">
      <select
        value={val}
        onChange={handleChange}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        )}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  );
};

const SelectGroup = ({ children }: any) => <optgroup>{children}</optgroup>;
const SelectValue = ({ placeholder }: any) => null; // Not needed for standard select
const SelectTrigger = ({ children }: any) => null; // Not needed for standard select
const SelectContent = ({ children }: any) => children;
const SelectItem = ({ children, value }: any) => (
  <option value={value}>{children}</option>
);
const SelectLabel = ({ children }: any) => <option disabled>{children}</option>;
const SelectSeparator = () => <hr />;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
