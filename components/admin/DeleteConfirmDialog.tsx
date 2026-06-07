"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  productName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function DeleteConfirmDialog({ productName, onConfirm, onClose }: DeleteConfirmDialogProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Delete product</h2>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          Are you sure you want to delete <span className="font-semibold">{productName}</span>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
          <button
            onClick={() => startTransition(() => onConfirm())}
            disabled={pending}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
