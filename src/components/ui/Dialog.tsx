import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
} | null>(null);

const Dialog = ({ children, open: controlledOpen, onOpenChange: setControlledOpen }: any) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = ({ children, asChild }: any) => {
  const context = React.useContext(DialogContext);
  if (!context) return children;

  const handleClick = (e: React.MouseEvent) => {
    if (children.props.onClick) children.props.onClick(e);
    context.onOpenChange(true);
  };

  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick });
  }

  return <button onClick={handleClick}>{children}</button>;
};

const DialogContent = ({ children, className }: any) => {
  const context = React.useContext(DialogContext);
  if (!context || !context.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => context.onOpenChange(false)}
      />
      <div className={cn("relative z-50 w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all", className)}>
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ children, className }: any) => {
  return (
    <div className={cn("mb-4 flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  );
};

const DialogTitle = ({ children, className }: any) => {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
};

const DialogDescription = ({ children, className }: any) => {
  return (
    <p className={cn("text-sm text-slate-500", className)}>
      {children}
    </p>
  );
};

const DialogFooter = ({ children, className }: any) => {
  return (
    <div className={cn("mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
      {children}
    </div>
  );
};

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
