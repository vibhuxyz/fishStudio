"use client";

import React, { useState } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";

const BannersPage = () => {
  useRequireAuth("product");
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadedIndices, setUploadedIndices] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newBannerImages, setNewBannerImages] = useState<any[]>([null]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

  // Fetch categories
  const { data: configData } = useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
  });

  const categories = configData?.categories || [];

  // Fetch seller banners
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["seller-banners"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-seller-banners", isProtected);
      return res.data.banners || [];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { image: string; category: string }) => {
      await axiosInstance.post("/product/api/upload-banner", {
        images: [data.image],
        category: data.category
      }, isProtected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-banners"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload banner");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (bannerId: string) => {
      await axiosInstance.delete(`/product/api/delete-banner/${bannerId}`, isProtected);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-banners"] });
      toast.success("Banner deleted successfully");
      setDeleteModalOpen(false);
      setBannerToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete banner");
    },
  });

  const handleUpload = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    const validIndices = newBannerImages
      .map((img, idx) => (img !== null && img.base64 ? idx : -1))
      .filter((idx) => idx !== -1);

    if (validIndices.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsUploading(true);
    setUploadedIndices([]);
    try {
      for (const idx of validIndices) {
        setUploadingIndex(idx);
        await uploadMutation.mutateAsync({
          image: newBannerImages[idx].base64,
          category: selectedCategory,
        });
        setUploadedIndices((prev) => [...prev, idx]);
      }
      toast.success("All banners uploaded successfully and sent for review");
      setNewBannerImages([null]);
      setSelectedCategory("");
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
      setUploadedIndices([]);
    }
  };

  const confirmDelete = (id: string) => {
    setBannerToDelete(id);
    setDeleteModalOpen(true);
  };

  const bannersByCategory = banners.reduce((acc: any, banner: any) => {
    const cat = banner.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(banner);
    return acc;
  }, {});

  return (
    <div className="min-h-screen w-full p-8">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Category Banners</h2>
          <p className="text-sm text-slate-400">
            Upload custom banners for specific categories. Max 3 per category.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <BreadCrumbs title="Category Banners" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1 space-y-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800 h-fit">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="text-blue-400" size={20} />
            <h3 className="text-lg font-medium text-white">Add New Banner</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white outline-none focus:border-blue-500 transition"
              >
                <option value="">Choose a category...</option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Banner Image
              </label>
              {newBannerImages.map((_, index) => {
                let status: "idle" | "waiting" | "uploading" | "success" = "idle";
                if (isUploading) {
                  if (uploadingIndex === index) status = "uploading";
                  else if (uploadedIndices.includes(index)) status = "success";
                  else if (newBannerImages[index] && newBannerImages[index].base64) status = "waiting";
                }

                return (
                  <ImagePlaceHolder
                    key={index}
                    index={index}
                    size="1920 x 450"
                    small={true}
                    images={newBannerImages}
                    setImages={setNewBannerImages}
                    isUploading={status === "uploading"}
                    uploadStatus={status}
                    setValue={() => {}} 
                  />
                );
              })}
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedCategory || !newBannerImages.some(img => img !== null)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Uploading to {selectedCategory}...</span>
                </>
              ) : (
                <>
                  {selectedCategory ? `Upload ${selectedCategory} Banner` : "Upload for Review"}
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 flex items-start gap-1">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              Note: Banners require admin approval before they become active on the category page.
            </p>
          </div>
        </div>

        {/* Banners List */}
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : Object.keys(bannersByCategory).length === 0 ? (
            <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
              <ImageIcon className="mx-auto text-gray-700 mb-4" size={48} />
              <p className="text-gray-500">No banners found. Start by uploading one for a category.</p>
            </div>
          ) : (
            Object.entries(bannersByCategory).map(([category, catBanners]: [string, any]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h3 className="text-xl font-medium text-white">{category}</h3>
                  <span className="text-sm text-gray-500">{catBanners.length}/3 Banners</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catBanners.map((banner: any) => (
                    <div 
                      key={banner.id}
                      className="relative group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/30 transition-all shadow-lg"
                    >
                      <div className="relative h-32 overflow-hidden">
                        {deleteMutation.isPending && deleteMutation.variables === banner.id && (
                          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-red-500" size={24} />
                            <span className="text-white text-[10px] font-medium">Deleting...</span>
                          </div>
                        )}
                        <img 
                          src={banner.imageUrl} 
                          alt={category} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {!deleteMutation.isPending && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => confirmDelete(banner.id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg transition transform hover:scale-110"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex justify-between items-center bg-gray-950/80">
                        <span className="text-[10px] text-gray-500">
                          {new Date(banner.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            banner.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 
                            banner.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {banner.status || 'PENDING'}
                          </span>
                          {banner.status === 'APPROVED' && (
                            <span className={`w-2 h-2 rounded-full ${banner.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {deleteModalOpen && (
        <DeleteConfirmationModal 
          product={{ title: "this banner" }}
          isLoading={deleteMutation.isPending}
          onClose={() => {
            setDeleteModalOpen(false);
            setBannerToDelete(null);
          }}
          onConfirm={() => bannerToDelete && deleteMutation.mutate(bannerToDelete)}
        />
      )}
    </div>
  );
};

export default BannersPage;
