"use client";

import React, { useState } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import { useAdminBanners, adminQueryKeys } from "@/hooks/useAdminQueries";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";

const BannersPage = () => {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useAdminBanners();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [newBannerImages, setNewBannerImages] = useState<any[]>([null]);

  const deleteMutation = useMutation({
    mutationFn: async (bannerId: string) => {
      await axiosInstance.delete(`/product/api/delete-banner/${bannerId}`, isProtected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.banners });
      toast.success("Banner deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete banner");
    }
  });

  const handleUpload = async () => {
    const imagesToUpload = newBannerImages
      .map((img, idx) => ({ ...img, originalIndex: idx }))
      .filter(img => img !== null && img.base64);

    if (imagesToUpload.length === 0) {
      toast.error("Please select at least one image to upload");
      return;
    }

    try {
      setIsUploading(true);
      for (const imgData of imagesToUpload) {
        setUploadingIndex(imgData.originalIndex);
        await axiosInstance.post(
          "/product/api/upload-banner",
          {
            images: [imgData.base64],
          },
          isProtected
        );
      }
      
      toast.success("Banners uploaded successfully");
      setNewBannerImages([null]);
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.banners });
    } catch (error) {
       toast.error("Upload process encountered an error");
       console.error(error);
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
    }
  };

  return (
    <DashboardPageShell
      title="Banner Management"
      breadcrumbTitle="Banners"
      description="Manage promotional banners displayed on the home page."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1 space-y-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="text-blue-400" size={20} />
            <h3 className="text-lg font-medium text-white">Add New Banners</h3>
          </div>
          
          <div className="space-y-4">
            {newBannerImages.map((_, index) => (
              <ImagePlaceHolder
                key={index}
                index={index}
                size="1920 x 450"
                small={true}
                images={newBannerImages}
                setImages={setNewBannerImages}
                setValue={() => {}} // dummy for now
                isUploading={uploadingIndex === index}
              />
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || !newBannerImages.some(img => img !== null)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Upload Banners"
            )}
          </button>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="text-purple-400" size={20} />
            <h3 className="text-lg font-medium text-white">Active Banners</h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
              <p className="text-gray-500">No banners found. Start by uploading one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {banners.map((banner: any) => (
                <div 
                  key={banner.id}
                  className="relative group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/30 transition-all"
                >
                  <img 
                    src={banner.imageUrl} 
                    alt="banner" 
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => deleteMutation.mutate(banner.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="p-3 flex justify-between items-center text-xs text-gray-400">
                    <span>Uploaded on {new Date(banner.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
};

export default BannersPage;
