import * as ToastPrimitive from "@radix-ui/react-toast";
import { ReactNode } from "react";

interface ToastProps {
  title: string;
  content: string;
  children: ReactNode;
}

export const Toast = ({ title, content, children, ...props }: ToastProps) => {
  return (
    <ToastPrimitive.Root {...props}>
      {title && <ToastPrimitive.Title>{title}</ToastPrimitive.Title>}
      <ToastPrimitive.Description>{content}</ToastPrimitive.Description>
      {children && (
        <ToastPrimitive.Action asChild altText={"action"}>
          {children}
        </ToastPrimitive.Action>
      )}
      <ToastPrimitive.Close aria-label="Close">
        <span aria-hidden>×</span>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};
