import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ReactNode } from "react";
import { IconClose } from "./icon";

interface TriggerProps {
  children: ReactNode;
}

function DialogTrigger({ children }: TriggerProps) {
  return <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>;
}

interface DialogContentProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

function DialogContent({ children, description, title }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed bottom-0 left-0 right-0 top-0 flex items-start justify-center bg-slate-100/50">
        <DialogPrimitive.Content asChild>
          <div className="min-w-300 relative top-40 flex flex-col gap-y-4 rounded bg-white p-6 text-base text-slate-600 shadow">
            {title && (
              <DialogPrimitive.Title className="text-sm font-medium">
                {title}
              </DialogPrimitive.Title>
            )}
            {description && (
              <DialogPrimitive.Description className="text-xs text-slate-400">
                {description}
              </DialogPrimitive.Description>
            )}
            {children}
            <DialogPrimitive.Close className="absolute right-0 top-0 block">
              <div className="mr-4 mt-4 p-2 hover:bg-slate-200">
                <IconClose className="h-4 w-4" />
              </div>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
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
