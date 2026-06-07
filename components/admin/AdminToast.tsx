"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminToastProps {
  toast: { msg: string; type: "ok" | "err" } | null;
}

export function AdminToast({ toast }: AdminToastProps) {
  if (!toast) return null;
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-slide-up",
        toast.type === "ok" ? "bg-green-700 text-white" : "bg-red-600 text-white"
      )}
    >
      {toast.type === "ok"
        ? <CheckCircle2 className="w-4 h-4 shrink-0" />
        : <AlertCircle  className="w-4 h-4 shrink-0" />
      }
      {toast.msg}
    </div>
  );
}
