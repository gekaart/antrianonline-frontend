"use client";

import { useState, useEffect } from "react";

export type ToastVariant = "default" | "success" | "destructive" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function dispatch(toast: Toast[]) {
  toasts = toast;
  listeners.forEach((l) => l(toasts));
}

export function toast(opts: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { id, variant: "default", ...opts };
  dispatch([...toasts, newToast]);
  setTimeout(() => {
    dispatch(toasts.filter((t) => t.id !== id));
  }, 4000);
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    const listener = (t: Toast[]) => setCurrentToasts([...t]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return { toasts: currentToasts, toast };
}
