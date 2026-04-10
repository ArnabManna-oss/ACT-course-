import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = ({ children, className, defaultValue, value, onValueChange }: any) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab,
            onTabChange: handleTabChange,
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, className, activeTab, onTabChange }: any) => {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab,
            onTabChange,
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsTrigger = ({ children, className, value, activeTab, onTabChange }: any) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => onTabChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-white text-slate-950 shadow-sm" : "hover:bg-slate-50 hover:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, className, value, activeTab }: any) => {
  if (activeTab !== value) return null;
  return (
    <div className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500", className)}>
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
