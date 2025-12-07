import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "../../lib/utils";

const Check: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

interface SelectContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValue: string;
  selectedLabel: ReactNode;
  setSelected: (value: string, label: ReactNode) => void;
}

const SelectContext = createContext<SelectContextProps | undefined>(undefined);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("useSelect must be used within a Select component");
  }
  return context;
};

interface SelectProps {
  children: ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
}

export const Select: React.FC<SelectProps> = ({ children, onValueChange, value }) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const [selectedLabel, setSelectedLabel] = useState<ReactNode>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
      let newLabel: ReactNode = null;
      // Find the label from children for the initial/controlled value
      React.Children.forEach(children, child => {
        if (React.isValidElement(child) && child.type === SelectContent) {
          // FIX: Property 'children' does not exist on type 'unknown'. Cast props to access children.
          React.Children.forEach((child.props as { children?: React.ReactNode }).children, item => {
            if (React.isValidElement(item) && item.type === SelectItem) {
              const itemProps = item.props as { value: string; children: React.ReactNode };
              // FIX: Property 'value' does not exist on type 'unknown'. Access through cast props.
              if (itemProps.value === value) {
                // FIX: Property 'children' does not exist on type 'unknown'. Access through cast props.
                newLabel = itemProps.children;
              }
            }
          });
        }
      });
      setSelectedLabel(newLabel || null);
    }
  }, [value, children]);

  const setSelected = (val: string, label: ReactNode) => {
    setSelectedValue(val);
    setSelectedLabel(label);
    if (onValueChange) {
      onValueChange(val);
    }
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, selectedLabel, setSelected }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

// Fix: Updated SelectTrigger to accept all button attributes, allowing props like 'id' to be passed.
export const SelectTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
  const { open, setOpen } = useSelect();
  return (
    <button
      type="button"
      {...props}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
    const { selectedLabel } = useSelect();
    const displayValue = selectedLabel;
    
    return <span className={!displayValue ? 'text-muted-foreground' : ''}>{displayValue || placeholder}</span>;
}

export const SelectContent: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const { open, setOpen } = useSelect();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  );
};

export const SelectItem: React.FC<{ children: ReactNode; value: string; className?: string }> = ({ children, value, className }) => {
  const { setSelected, selectedValue } = useSelect();
  const isSelected = selectedValue === value;
  
  return (
    <div
      onClick={() => setSelected(value, children)}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent focus:bg-accent focus:text-accent-foreground",
        className
      )}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
};
