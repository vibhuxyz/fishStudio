import React from "react";
import { X } from "lucide-react";

export default function ViewCodeModal({
  code,
  onClose,
}: {
  code: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="mb-2 text-xl font-bold text-white">Seller Access Code</h2>
        <p className="mb-6 text-sm text-gray-400">
          Share this 6-digit code with the seller.
        </p>

        <div className="mb-6 rounded-lg bg-gray-800 py-4 text-3xl font-mono tracking-widest text-green-400 font-bold border border-green-500/20">
          {code}
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-lg bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
