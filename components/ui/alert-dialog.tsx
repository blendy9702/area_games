"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type AlertDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(
  null
);

function useAlertDialog() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error("AlertDialog components must be used within AlertDialog");
  }
  return context;
}

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, setOpen } = useAlertDialog();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            className={`alert-dialog-content pixel-card relative z-10 w-full max-w-md border-2 border-gray-600 bg-gray-950 p-5 sm:p-6 shadow-[0_0_32px_rgba(0,0,0,0.45)] ${className}`}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function AlertDialogHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 text-left ${className}`}>{children}</div>
  );
}

export function AlertDialogTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-base sm:text-lg text-indigo-200 font-bold ${className}`}>
      {children}
    </h2>
  );
}

export function AlertDialogDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-gray-400 leading-relaxed whitespace-pre-line ${className}`}>
      {children}
    </p>
  );
}

export function AlertDialogFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDialogCancel({
  children,
  className = "",
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { setOpen } = useAlertDialog();

  return (
    <button
      type="button"
      disabled={disabled}
      className={`pixel-btn w-full sm:w-auto px-4 py-2 text-sm border-2 border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={() => {
        if (disabled) return;
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({
  children,
  className = "",
  onClick,
  disabled = false,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "primary" | "danger";
}) {
  const { setOpen } = useAlertDialog();

  return (
    <button
      type="button"
      disabled={disabled}
      className={`pixel-btn w-full sm:w-auto px-4 py-2 text-sm disabled:opacity-50 ${
        variant === "danger" ? "pixel-btn-danger" : "pixel-btn-primary"
      } ${className}`}
      onClick={async () => {
        await onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
