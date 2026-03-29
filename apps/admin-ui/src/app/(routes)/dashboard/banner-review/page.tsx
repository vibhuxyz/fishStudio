"use client";

import React, { useState, useMemo } from "react";
import { Check, X, Loader2, Store, Mail, Calendar, Grid, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";
import { useAdminAccount } from "@/hooks/useAdminQueries";
import { useWorkerWS } from "@/context/worker-ws-context";


const CategoryBannerReviewPage = () => {
  useRequireAuth();
  const { data: admin } = useAdminAccount();
  const queryClient = useQueryClient();
  // Shared persistent WS connection — no new socket created per page.
  const { subscribe } = useWorkerWS();

  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, APPROVED, REJECTED
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin", "all-category-banners"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-category-banners", isProtected);
      return res.data.banners || [];
    },
  });

  // Subscribe to BANNER_SUBMITTED events via the shared connection.
  React.useEffect(() => {
    if (!admin?.id) return;
    return subscribe("BANNER_SUBMITTED", (payload) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-category-banners"] });
      toast.info(payload?.message || "New banner submitted for review!");
    });
  }, [admin?.id, subscribe, queryClient]);


  const reviewMutation = useMutation({
    mutationFn: async (data: { bannerId: string; action: "APPROVE" | "REJECT"; rejectionReason?: string }) => {
      await axiosInstance.post("/product/api/review-banner", data, isProtected);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "all-category-banners"] });
      toast.success(`Banner ${variables.action === "APPROVE" ? "approved" : "rejected"} successfully`);
      setShowModal(false);
      setSelectedBanner(null);
      setRejectionReason("");
    },
    onError: () => {
      toast.error("Failed to process banner review");
    },
  });

  const handleReview = (action: "APPROVE" | "REJECT") => {
    reviewMutation.mutate({
      bannerId: selectedBanner.id,
      action,
      rejectionReason: action === "REJECT" ? rejectionReason : undefined,
    });
  };

  const filteredBanners = useMemo(() => {
    if (filter === "ALL") return banners;
    return banners.filter((b: any) => b.status === filter);
  }, [banners, filter]);

  const bannersByCategory = useMemo(() => {
    return filteredBanners.reduce((acc: any, banner: any) => {
      let cat = banner.category;
      if (!cat && banner.bannerType === "announcement") cat = "Announcements";
      else cat = cat || "General";
      
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(banner);
      return acc;
    }, {});
  }, [filteredBanners]);

  const pendingCount = banners.filter((b: any) => b.status === "PENDING").length;

  return (
    <DashboardPageShell
      title="Category Banner & Review"
      breadcrumbTitle="Category Banners"
      description="View and manage all seller category banners and review new requests."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-gray-900 p-1 rounded-lg border border-gray-800">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                filter === f 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
              {f === "PENDING" && pendingCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {pendingCount > 0 && filter !== "PENDING" && (
          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20 animate-pulse">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">You have {pendingCount} pending requests to review!</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : Object.keys(bannersByCategory).length === 0 ? (
        <div className="text-center py-24 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
          <Info className="mx-auto text-gray-700 mb-4" size={48} />
          <p className="text-gray-500">No banners found matching the filter.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(bannersByCategory).map(([category, catBanners]: [string, any]) => (
            <div key={category} className="space-y-4">
               <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Grid size={20} className="text-blue-500" />
                    {category}
                  </h3>
                  <span className="text-sm text-gray-500">{catBanners.length} Banners</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {catBanners.map((banner: any) => (
                    <div 
                      key={banner.id}
                      className={`relative group bg-gray-900 rounded-xl overflow-hidden border transition-all flex flex-col ${
                        banner.status === 'PENDING' ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-gray-800'
                      }`}
                    >
                      <div className="relative aspect-video bg-gray-950 flex flex-col items-center justify-center p-4">
                        {banner.imageUrl ? (
                          <img 
                            src={banner.imageUrl} 
                            alt="Banner" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center space-y-1">
                            <AlertCircle size={32} className="mx-auto text-blue-500/50 mb-2" />
                            <p className="text-white text-xs font-bold line-clamp-1 italic italic-none">{banner.title}</p>
                            <p className="text-gray-400 text-[10px] line-clamp-1 italic italic-none">{banner.subtitle}</p>
                            {banner.price && <p className="text-emerald-400 text-[10px] font-bold italic italic-none">₹{banner.price}</p>}
                          </div>
                        )}
                        <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          banner.status === 'APPROVED' ? 'bg-green-500 text-black' : 
                          banner.status === 'REJECTED' ? 'bg-red-500 text-white' : 
                          'bg-amber-500 text-black animate-pulse'
                        }`}>
                          {banner.status}
                        </div>
                      </div>
                      <div className="p-4 flex-1 space-y-3 bg-gray-950/40">
                        <div className="flex items-center gap-2 text-white font-medium text-sm">
                          <Store size={14} className="text-blue-400" />
                          <span className="truncate">{banner.seller?.store?.name || banner.seller?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          <Calendar size={12} />
                          <span>{new Date(banner.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {banner.status === 'PENDING' ? (
                          <button
                            onClick={() => {
                              setSelectedBanner(banner);
                              setShowModal(true);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-semibold transition"
                          >
                            Review Request
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedBanner(banner);
                              setShowModal(true);
                            }}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs font-medium transition"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          ))}
        </div>
      )}

      {/* Review/Details Modal */}
      {showModal && selectedBanner && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950/50">
              <h3 className="text-lg font-semibold text-white">
                {selectedBanner.status === "PENDING" ? "Review Banner" : "Banner Details"}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Banner Preview</label>
                <div className="aspect-[21/9] bg-gray-950 rounded-lg overflow-hidden border border-gray-800 flex items-center justify-center p-8">
                   {selectedBanner.imageUrl ? (
                     <img 
                       src={selectedBanner.imageUrl} 
                       alt="Banner Preview" 
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="text-center space-y-2 max-w-md">
                        <p className="text-3xl font-black text-white italic italic-none">{selectedBanner.title}</p>
                        <p className="text-lg text-gray-400 font-medium italic italic-none">{selectedBanner.subtitle}</p>
                        {selectedBanner.price && (
                          <div className="mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full inline-block">
                             <span className="text-emerald-400 font-bold italic italic-none">Special Price: ₹{selectedBanner.price}</span>
                          </div>
                        )}
                     </div>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller Details</label>
                   <div className="flex items-center gap-2 text-white font-medium">
                      <Store size={16} className="text-blue-400" />
                      <span>{selectedBanner.seller?.store?.name || "No Store Name"}</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Mail size={14} />
                      <span>{selectedBanner.seller?.email}</span>
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Details</label>
                   <div className="flex items-center gap-2 text-white font-medium capitalize">
                      <Grid size={16} className="text-purple-400" />
                      <span>{selectedBanner.category || "General"}</span>
                   </div>
                   <div className="text-[10px] text-gray-500">
                      Status: <span className={
                        selectedBanner.status === 'APPROVED' ? 'text-green-500' :
                        selectedBanner.status === 'REJECTED' ? 'text-red-500' :
                        'text-amber-500'
                      }>{selectedBanner.status}</span>
                   </div>
                </div>
              </div>

              {selectedBanner.status === "PENDING" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rejection Reason (Optional)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this banner is being rejected..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white text-sm h-24 outline-none focus:border-red-500/50 transition resize-none"
                  />
                </div>
              )}

              {selectedBanner.status === "REJECTED" && selectedBanner.rejectionReason && (
                <div className="space-y-2 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                  <label className="text-xs font-semibold text-red-400 uppercase tracking-wider">Rejection Reason</label>
                  <p className="text-sm text-gray-300 mt-1">{selectedBanner.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-950/50 border-t border-gray-800">
              {selectedBanner.status === "PENDING" ? (
                <div className="flex gap-3">
                  <button
                    disabled={reviewMutation.isPending}
                    onClick={() => handleReview("REJECT")}
                    className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                  >
                    {reviewMutation.isPending && reviewMutation.variables?.action === "REJECT" ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <X size={18} />
                        Reject & Delete
                      </>
                    )}
                  </button>
                  <button
                    disabled={reviewMutation.isPending}
                    onClick={() => handleReview("APPROVE")}
                    className="flex-1 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2"
                  >
                    {reviewMutation.isPending && reviewMutation.variables?.action === "APPROVE" ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <Check size={18} />
                        Approve Banner
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition"
                >
                  Close View
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
};

export default CategoryBannerReviewPage;
