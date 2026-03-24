import React from "react";
import { X, ShoppingCart, CheckCircle2, XCircle, Users, IndianRupee, ExternalLink } from "lucide-react";
import Image from "next/image";
import { DetailedProductRow } from "@/hooks/useAdminQueries";

interface ProductDetailModalProps {
  product: DetailedProductRow;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-900/50">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Product Insights</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Analytics Deep Dive</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Left: Images */}
            <div className="space-y-4">
               <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-800 bg-black group">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <ShoppingCart size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/10 uppercase">
                       Product Image
                     </span>
                  </div>
               </div>
               {/* Small thumbnails placeholder if we had more images in the row */}
               <div className="flex gap-2">
                 {[1, 2, 3].map((_, i) => (
                   <div key={i} className="h-16 w-16 rounded-lg border border-gray-800 bg-gray-900/50 opacity-40 cursor-not-allowed" />
                 ))}
               </div>
            </div>

            {/* Top Right: Details */}
            <div className="flex flex-col">
              <div className="mb-6">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1 block">Product Identifiers</span>
                <h3 className="text-3xl font-black text-white mb-2 leading-tight">{product.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-400 text-[10px] font-bold border border-gray-700">ID: {product.id.slice(-8).toUpperCase()}</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-900/20 text-blue-400 text-[10px] font-bold border border-blue-900/30">PREMIUM</span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Performance Summary</p>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    This product has generated <span className="text-white font-bold">₹{product.revenue.toLocaleString()}</span> in gross revenue from <span className="text-white font-bold">{product.deliveredQty}</span> successful deliveries. Most orders originate from the primary service zones.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-900/30 border border-gray-800 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Avg Order Value</p>
                    <p className="text-lg font-black text-white">₹{Math.round(product.avgPrice).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gray-900/30 border border-gray-800 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Quanta Sale</p>
                    <p className="text-lg font-black text-white">{product.quantaSale}</p>
                  </div>
                </div>
              </div>

              <button className="mt-8 w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/20 group">
                Open in Catalog <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Bottom Left: Order Details (Mock History) */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/20 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-800 bg-gray-900/40">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingCart size={14} className="text-blue-500" /> Recent Order Sequence
                </h4>
              </div>
              <div className="divide-y divide-gray-800 max-h-[240px] overflow-y-auto">
                {product.orderIds?.length > 0 ? (
                  product.orderIds.slice(0, 5).map((oid, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-800/20 transition cursor-default">
                      <div>
                        <p className="text-xs font-bold text-gray-200">Order #{oid.slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-500">24 Mar 2024 • 04:20 PM</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-emerald-900/20 text-emerald-500 text-[10px] font-bold border border-emerald-900/30">COMPLETED</span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-600 text-xs italic">No order history available</div>
                )}
              </div>
            </div>
            {/* Bottom Right: Full Stats Panels */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-lime-500/30 transition shadow-sm">
                  <div className="h-12 w-12 rounded-2xl bg-lime-900/20 border border-lime-900/30 flex items-center justify-center text-lime-400 mb-4 group-hover:scale-110 transition shadow-lg shadow-lime-950/20">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Total Comp Order</p>
                  <p className="text-3xl font-black text-white">{product.deliveredQty}</p>
               </div>
               
               <div className="bg-red-950/10 border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-red-500/30 transition shadow-sm">
                  <div className="h-12 w-12 rounded-2xl bg-red-900/20 border border-red-900/30 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition shadow-lg shadow-red-950/20">
                    <XCircle size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Cancelled</p>
                  <p className="text-3xl font-black text-white">{product.cancelledQty}</p>
               </div>

               <div className="bg-blue-950/10 border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-blue-400/30 transition shadow-sm">
                  <div className="h-12 w-12 rounded-2xl bg-blue-900/20 border border-blue-900/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition shadow-lg shadow-blue-950/20">
                    <Users size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Repeating Time</p>
                  <p className="text-3xl font-black text-white">{product.repeatCustomers}</p>
               </div>

               <div className="bg-amber-950/10 border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-amber-400/30 transition shadow-sm">
                  <div className="h-12 w-12 rounded-2xl bg-amber-900/20 border border-amber-900/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition shadow-lg shadow-amber-950/20">
                    <IndianRupee size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Avg Price</p>
                  <p className="text-3xl font-black text-white">₹{Math.round(product.avgPrice)}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
