"use client";

import React, { useState } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon, AlertCircle, Megaphone, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";
import useSeller from "@/hooks/useSeller";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";


type BannerTab = "category" | "announcement";

const BannersPage = () => {
  const { seller } = useSeller();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<BannerTab>("category");

  // WebSocket: refresh banner list when an admin approves/rejects
  React.useEffect(() => {
    // Seller connections use ?sellerId= to receive specific admin action updates
    const sellerId = seller?.id || (seller?.role === "staff" ? seller.sellerId : null);
    if (!sellerId) return;

    const wsBase = (process.env.NEXT_PUBLIC_WORKER_WS_URL || "ws://localhost:6006").replace(/\?.*$/, "");
    const wsUrl = `${wsBase}?sellerId=${sellerId}`;

    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let destroyed = false;

    const connect = () => {
      if (destroyed) return;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "BANNER_REVIEWED") {
            queryClient.invalidateQueries({ queryKey: ["seller-banners"] });
            toast.info(`Banner status updated: ${data.payload?.status}`);
          }
        } catch {}
      };

      ws.onclose = () => {
        if (!destroyed) reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      destroyed = true;
      clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [seller, queryClient]);


  // Category banner state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadedIndices, setUploadedIndices] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newBannerImages, setNewBannerImages] = useState<any[]>([null]);

  // Announcement banner state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementSubtitle, setAnnouncementSubtitle] = useState("");
  const [announcementPrice, setAnnouncementPrice] = useState("");
  const [announcementImages, setAnnouncementImages] = useState<any[]>([null]);
  const [isUploadingAnnouncement, setIsUploadingAnnouncement] = useState(false);

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
    mutationFn: async (data: {
      image?: string;
      category?: string;
      bannerType?: string;
      title?: string;
      subtitle?: string;
      price?: string;
    }) => {
      const payload: Record<string, any> = {
        bannerType: data.bannerType || "category",
      };
      if (data.image) payload.images = [data.image];
      if (data.category) payload.category = data.category;
      if (data.title) payload.title = data.title;
      if (data.subtitle) payload.subtitle = data.subtitle;
      if (data.price) payload.price = data.price;
      await axiosInstance.post("/product/api/upload-banner", payload, isProtected);
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

  const handleCategoryUpload = async () => {
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
          bannerType: "category",
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

  const handleAnnouncementUpload = async () => {
    if (!announcementTitle.trim()) {
      toast.error("Please enter a title for the announcement");
      return;
    }

    setIsUploadingAnnouncement(true);
    try {
      const imageFile = announcementImages[0];
      await uploadMutation.mutateAsync({
        image: imageFile?.base64 || undefined,
        bannerType: "announcement",
        title: announcementTitle.trim(),
        subtitle: announcementSubtitle.trim() || undefined,
        price: announcementPrice.trim() || undefined,
      });
      toast.success("Announcement banner uploaded and sent for review");
      setAnnouncementTitle("");
      setAnnouncementSubtitle("");
      setAnnouncementPrice("");
      setAnnouncementImages([null]);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploadingAnnouncement(false);
    }
  };

  const confirmDelete = (id: string) => {
    setBannerToDelete(id);
    setDeleteModalOpen(true);
  };

  const categoryBanners = banners.filter((b: any) => b.bannerType !== "announcement");
  const announcementBanners = banners.filter((b: any) => b.bannerType === "announcement");

  const bannersByCategory = categoryBanners.reduce((acc: any, banner: any) => {
    const cat = banner.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(banner);
    return acc;
  }, {});

  return (
    <div className="min-h-screen w-full p-8">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Banners</h2>
          <p className="text-sm text-slate-400">
            Manage your category and announcement banners.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <BreadCrumbs title="Banners" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("category")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition rounded-t-lg ${
            activeTab === "category"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <LayoutTemplate size={16} />
          Category Banners
        </button>
        <button
          onClick={() => setActiveTab("announcement")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition rounded-t-lg ${
            activeTab === "announcement"
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <Megaphone size={16} />
          Announcement Bar
        </button>
      </div>

      {/* ── Category Banners Tab ── */}
      {activeTab === "category" && (
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
                  Banner Image <span className="text-gray-600">(1920 × 450px)</span>
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
                onClick={handleCategoryUpload}
                disabled={isUploading || !selectedCategory || !newBannerImages.some(img => img !== null)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Uploading to {selectedCategory}...</span>
                  </>
                ) : (
                  <>{selectedCategory ? `Upload ${selectedCategory} Banner` : "Upload for Review"}</>
                )}
              </button>

              <p className="text-xs text-gray-500 flex items-start gap-1">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                Banners require admin approval before they become active on the category page.
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
                <p className="text-gray-500">No category banners found. Start by uploading one.</p>
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
                      <BannerCard
                        key={banner.id}
                        banner={banner}
                        onDelete={confirmDelete}
                        isDeleting={deleteMutation.isPending && deleteMutation.variables === banner.id}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Announcement Bar Tab ── */}
      {activeTab === "announcement" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1 space-y-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800 h-fit">
            <div className="flex items-center gap-2 mb-2">
              <Megaphone className="text-yellow-400" size={20} />
              <h3 className="text-lg font-medium text-white">New Announcement</h3>
            </div>

            {/* Live Preview */}
            <div className="rounded-lg overflow-hidden border border-gray-700">
              <p className="text-[10px] text-gray-500 px-3 pt-2 pb-1">Preview</p>
              <div className="bg-black flex items-center gap-2 px-3 py-2 min-h-[40px]">
                {announcementImages[0]?.base64 && (
                  <img
                    src={announcementImages[0].base64}
                    alt="preview"
                    className="h-7 w-7 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  {announcementTitle ? (
                    <span className="text-yellow-400 font-bold text-xs uppercase tracking-wide">
                      {announcementTitle}
                    </span>
                  ) : (
                    <span className="text-gray-600 text-xs italic">Your title here…</span>
                  )}
                  {announcementSubtitle && (
                    <span className="text-gray-300 text-[10px] ml-1.5">{announcementSubtitle}</span>
                  )}
                  {announcementPrice && (
                    <span className="text-white font-bold text-xs ml-1.5">₹{announcementPrice}</span>
                  )}
                </div>
                <span className="text-gray-500 text-xs">→</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="MEATY, JUICY MOMOS"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={announcementSubtitle}
                  onChange={(e) => setAnnouncementSubtitle(e.target.value)}
                  placeholder="all flavours under"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="text"
                    value={announcementPrice}
                    onChange={(e) => setAnnouncementPrice(e.target.value.replace(/[^0-9+]/g, ""))}
                    placeholder="169"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Product Image <span className="text-gray-600">(optional)</span>
                </label>
                <ImagePlaceHolder
                  index={0}
                  size="120 x 120"
                  small={true}
                  images={announcementImages}
                  setImages={setAnnouncementImages}
                  isUploading={false}
                  uploadStatus="idle"
                  setValue={() => {}}
                />
              </div>

              <button
                onClick={handleAnnouncementUpload}
                disabled={isUploadingAnnouncement || uploadMutation.isPending || !announcementTitle.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-700 text-black disabled:text-gray-400 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {isUploadingAnnouncement || uploadMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Megaphone size={18} />
                    Submit for Review
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 flex items-start gap-1">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                Announcement bars appear at the very top of the storefront. Requires admin approval.
                Visible only to users in your delivery area.
              </p>
            </div>
          </div>

          {/* Announcement Banners List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-gray-800 pb-2">
              Your Announcements
            </h3>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : announcementBanners.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-dashed border-gray-800">
                <Megaphone className="mx-auto text-gray-700 mb-4" size={48} />
                <p className="text-gray-500">No announcement banners yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcementBanners.map((banner: any) => (
                  <AnnouncementBannerCard
                    key={banner.id}
                    banner={banner}
                    onDelete={confirmDelete}
                    isDeleting={deleteMutation.isPending && deleteMutation.variables === banner.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

// ── Sub-components ────────────────────────────────────────────────────────────

function BannerCard({
  banner,
  onDelete,
  isDeleting,
}: {
  banner: any;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="relative group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/30 transition-all shadow-lg">
      <div className="relative h-32 overflow-hidden">
        {isDeleting && (
          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-red-500" size={24} />
            <span className="text-white text-[10px] font-medium">Deleting...</span>
          </div>
        )}
        <img
          src={banner.imageUrl}
          alt={banner.category}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {!isDeleting && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onDelete(banner.id)}
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
          <StatusBadge status={banner.status} />
          {banner.status === "APPROVED" && (
            <span className={`w-2 h-2 rounded-full ${banner.isActive ? "bg-green-500" : "bg-gray-500"}`} />
          )}
        </div>
      </div>
    </div>
  );
}

function AnnouncementBannerCard({
  banner,
  onDelete,
  isDeleting,
}: {
  banner: any;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <div className="relative group bg-gray-900 rounded-xl border border-gray-800 hover:border-yellow-500/30 transition-all shadow-lg overflow-hidden">
      {/* Preview strip */}
      <div className="bg-black flex items-center gap-3 px-4 py-3">
        {banner.imageUrl && (
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="h-8 w-8 object-cover rounded flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0 flex items-baseline gap-2 flex-wrap">
          <span className="text-yellow-400 font-bold text-sm uppercase tracking-wide">
            {banner.title}
          </span>
          {banner.subtitle && (
            <span className="text-gray-300 text-xs">{banner.subtitle}</span>
          )}
          {banner.price && (
            <span className="text-white font-bold text-sm">₹{banner.price}</span>
          )}
        </div>
        <span className="text-gray-500 text-sm flex-shrink-0">→</span>
      </div>

      <div className="p-3 flex justify-between items-center bg-gray-950/80">
        <span className="text-[10px] text-gray-500">
          {new Date(banner.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge status={banner.status} />
          {banner.status === "APPROVED" && (
            <span className={`w-2 h-2 rounded-full ${banner.isActive ? "bg-green-500" : "bg-gray-500"}`} />
          )}
          <button
            onClick={() => onDelete(banner.id)}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 transition p-1 rounded"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status || "PENDING";
  const classes =
    s === "APPROVED"
      ? "bg-green-500/20 text-green-400"
      : s === "REJECTED"
        ? "bg-red-500/20 text-red-400"
        : "bg-amber-500/20 text-amber-400";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${classes}`}>
      {s}
    </span>
  );
}

export default BannersPage;
