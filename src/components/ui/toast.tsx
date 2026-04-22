"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast, Toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const icons = {
  default: <Info className="h-5 w-5 text-blue-500" />,
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  destructive: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg bg-white min-w-[300px] max-w-[420px]",
        toast.variant === "destructive" && "border-red-200 bg-red-50",
        toast.variant === "success" && "border-green-200 bg-green-50",
        toast.variant === "warning" && "border-yellow-200 bg-yellow-50"
      )}
    >
      {icons[toast.variant || "default"]}
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-gray-500 mt-1">{toast.description}</p>
        )}
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, toast: _toast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => {}} />
      ))}
    </div>
  );
}

export { useToast };
