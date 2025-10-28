
import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);


interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div 
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
        onClick={e => e.stopPropagation()}
      >
        {children}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
};

export const DialogContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn(className)}>{children}</div>
);

export const DialogHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>
);

export const DialogTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>
);

export const DialogDescription: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
);
