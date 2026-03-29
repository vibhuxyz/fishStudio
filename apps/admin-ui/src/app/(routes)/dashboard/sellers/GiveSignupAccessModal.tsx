import React, { useState } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { Button } from "@repo/ui";

export default function GiveSignupAccessModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");

  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (targetEmail: string) => {
      const response = await axiosInstance.post("/auth/api/admin/generate-seller-code", { email: targetEmail });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Code generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "sellerCodes"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to generate code");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    generateMutation.mutate(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="mb-2 text-xl font-bold text-white">Generate Seller Access Code</h2>
        <p className="mb-6 text-sm text-gray-400">
          Enter the email address of the seller you want to invite. A 6-digit code valid for 24 hours will be generated.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Seller Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="seller@example.com"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <Button
              type="button"
              onClick={onClose}
              variant="indigo"
              glow={false}
              fullWidth={false}
              className="!bg-gray-700 hover:!bg-gray-600 !py-2 !px-4 !rounded-lg !w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={generateMutation.isPending || !email}
              isLoading={generateMutation.isPending}
              loaderLabel="Generating..."
              variant="emerald"
              fullWidth={false}
              className="!py-2 !px-4 !rounded-lg !w-auto"
            >
              Generate Code
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
