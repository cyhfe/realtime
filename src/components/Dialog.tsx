import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ReactNode } from "react";

interface TriggerProps {
  children: ReactNode;
}

function DialogTrigger({ children }: TriggerProps) {
  return <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>;
}

interface DialogContentProps {
  children: ReactNode;
}

function DialogContent({ children }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed bottom-0 left-0 right-0 top-0 flex items-start justify-center bg-slate-100/50">
        <DialogPrimitive.Content asChild>{children}</DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

interface DialogProps {
  children: ReactNode;
  open: boolean;
  onChange: (open: boolean) => void;
}

function Dialog({ children, open, onChange }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export { Dialog, DialogContent, DialogTrigger };
