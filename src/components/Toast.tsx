import * as ToastPrimitive from "@radix-ui/react-toast";
import { ReactNode, forwardRef, useImperativeHandle, useState } from "react";
import { IconClose } from "./icon";
interface ToastParams {
  altText?: string;
  title?: string;
  content?: string;
  action?: ReactNode;
}

export type ToastHandler = {
  toast: (toast: ToastParams) => void;
};

interface ToastProps {}

export const Toast = forwardRef<ToastHandler, ToastProps>(
  (props, forwardedRef) => {
    const [toastList, setToastList] = useState([]);
    useImperativeHandle(forwardedRef, () => ({
      toast(toastConfig) {
        setToastList((prev) => [...prev, toastConfig]);
      },
    }));

    return (
      <ToastPrimitive.Provider swipeDirection="right" duration={3000}>
        {toastList.map(({ title, content, altText, action }, i) => {
          return (
            <ToastPrimitive.Root
              key={i}
              className="relative flex w-56 flex-col gap-y-1 rounded bg-white p-4 text-sm text-slate-600 shadow"
            >
              {title && (
                <ToastPrimitive.Title className="font-medium text-rose-400">
                  {title}
                </ToastPrimitive.Title>
              )}
              <ToastPrimitive.Description className="text-xs">
                {content}
              </ToastPrimitive.Description>
              {action && (
                <ToastPrimitive.Action asChild altText={altText}>
                  {action}
                </ToastPrimitive.Action>
              )}
              <ToastPrimitive.Close
                aria-label="Close"
                className="absolute right-0 top-0 block"
              >
                <div className="mr-4 mt-4 p-2 hover:bg-slate-200">
                <IconClose className="h-4 w-4" />   
                </div>
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed right-0 top-0 flex flex-col gap-y-4" />
      </ToastPrimitive.Provider>
    );
  }
);
