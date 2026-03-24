import React from "react";
import { X, ShoppingCart, CheckCircle2, XCircle, Users, IndianRupee, ExternalLink } from "lucide-react";

// Local types to avoid prop-drilling from hooks
export type ProductRow = { id: string; title: string; orders: number; revenue: number; image?: string };
export type DetailedProductRow = ProductRow & {
  deliveredQty: number;
  cancelledQty: number;
  pendingQty: number;
  refundedQty: number;
  refundedAmount: number;
  couponSpend: number;
  quantaSale: number;
  repeatCustomers: number;
  avgPrice: number;
  orderIds: string[];
  pincodeBreakdown: Record<string, number>;
};

interface ProductDetailModalProps {
  product: DetailedProductRow;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 border border-blue-900/50">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Product Insights</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Deep analytics for seller shop</p>
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
               <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-800 bg-black group shadow-inner">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-800">
                      <ShoppingCart size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/10 uppercase tracking-tighter shadow-sm">
                       Catalog Image
                     </span>
                  </div>
               </div>
               {/* Small thumbnails placeholder */}
               <div className="flex gap-2.5">
                 {[1, 2, 3].map((_, i) => (
                   <div key={i} className="h-16 w-16 rounded-xl border border-gray-800 bg-gray-900/40 opacity-30 cursor-not-allowed group-hover:opacity-50 transition-opacity" />
                 ))}
               </div>
            </div>

            {/* Top Right: Details */}
            <div className="flex flex-col">
              <div className="mb-6">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Performance Insight</span>
                <h3 className="text-3xl font-black text-white mb-2 leading-tight tracking-tight">{product.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded bg-gray-800/80 text-gray-400 text-[10px] font-black tracking-widest border border-gray-700 shadow-sm">UID: {product.id.slice(-8).toUpperCase()}</span>
                  <span className="px-2.5 py-1 rounded bg-lime-900/20 text-lime-400 text-[10px] font-black tracking-widest border border-lime-900/30">TOP-PERFORMER</span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-gray-900/30 rounded-2xl p-5 border border-gray-800/80 backdrop-blur-sm">
                  <p className="text-[10px] font-black text-gray-600 mb-2 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-blue-500" /> Executive Summary
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">
                    Successfully delivered <span className="text-white font-black">{product.deliveredQty} units</span> with 
                    a gross contribution of <span className="text-blue-400 font-black">₹{product.revenue.toLocaleString()}</span>. 
                    Your repeat customer index for this item is <span className="text-lime-400 font-black">{product.repeatCustomers}</span>.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/20 border border-gray-800 rounded-2xl hover:border-gray-700 transition group shadow-sm">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">AOV Unit</p>
                    <p className="text-xl font-black text-white">₹{Math.round(product.avgPrice).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-900/20 border border-gray-800 rounded-2xl hover:border-gray-700 transition group shadow-sm">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Total Sales</p>
                    <p className="text-xl font-black text-white">{product.quantaSale}</p>
                  </div>
                </div>
              </div>

              <button className="mt-8 w-full h-14 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition shadow-xl shadow-blue-900/20 group transform active:scale-[0.98]">
                View Catalog <ExternalLink size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Bottom Left: Order Details (History) */}
            <div className="rounded-3xl border border-gray-800 bg-gray-900/10 overflow-hidden flex flex-col shadow-inner">
              <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-2 uppercase tracking-widest">
                  <ShoppingCart size={14} className="text-blue-500" /> Recent Sequence
                </h4>
                <span className="text-[9px] font-bold text-gray-500 bg-black/40 px-2 py-0.5 rounded border border-gray-800">LAST 5 ORDERS</span>
              </div>
              <div className="divide-y divide-gray-800/80 max-h-[260px] overflow-y-auto custom-scrollbar">
                {product.orderIds?.length > 0 ? (
                  product.orderIds.slice(0, 5).map((oid, i) => (
                    <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-800/40 transition cursor-default group/row">
                      <div>
                        <p className="text-xs font-black text-gray-300 group-hover/row:text-white transition-colors">ORD-{oid.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Automated Dispatch Sequence</p>
                      </div>
                      <div className="text-right">
                         <span className="px-2 py-1 rounded bg-lime-900/20 text-lime-400 text-[10px] font-black border border-lime-900/30 uppercase tracking-tighter">Delivered</span>
                         <p className="text-[10px] text-gray-600 mt-1 font-bold">₹{Math.round(product.avgPrice).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-gray-700 text-xs font-bold uppercase tracking-widest opacity-20 flex flex-col items-center gap-3">
                    <ShoppingCart size={32} />
                    No sequence history
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Right: Full Stats Panels */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center group hover:border-lime-500/30 transition shadow-sm">
                  <div className="h-12 w-12 rounded-2xl bg-lime-900/20 border border-lime-900/30 flex items-center justify-center text-lime-400 mb-4 group-hover:scale-110 transition shadow-lg shadow-lime-950/20">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Comp Order</p>
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
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Repeating</p>
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
