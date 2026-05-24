"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      expand={false}
      richColors={false}
      closeButton
      offset={16}
      mobileOffset={{ top: "max(1rem, env(safe-area-inset-top))" }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "pixel-toast",
          title: "pixel-toast-title",
          description: "pixel-toast-description",
          closeButton: "pixel-toast-close",
          error: "pixel-toast-error",
          success: "pixel-toast-success",
          warning: "pixel-toast-warning",
        },
      }}
      {...props}
    />
  );
}
