"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Mail, MapPin, Phone, Store, TicketPercent } from "lucide-react";

import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import { useAdminSellerDetail } from "@/hooks/useAdminQueries";

const SellerDetailPage = () => {
  const params = useParams<{ id: string }>();
  const sellerId = typeof params?.id === "string" ? params.id : "";
  const { data: seller, isLoading } = useAdminSellerDetail(sellerId);

  return (
    <DashboardPageShell
      title="Seller Details"
      breadcrumbTitle="Seller Details"
      description="Inspect the seller profile, store data, products, coupons, and reviews in one place."
      action={
        <Link
          href="/dashboard/sellers"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
        >
          <ArrowLeft size={16} />
          Back To Sellers
        </Link>
      }
    >
      {isLoading ? (
        <div className="rounded-xl bg-gray-900 p-5 text-gray-400">
          Loading seller details...
        </div>
      ) : !seller ? (
        <div className="rounded-xl bg-gray-900 p-5 text-gray-400">
          Seller not found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-xl bg-gray-900 p-5">
              <h3 className="mb-4 text-xl font-semibold text-white">{seller.name}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail size={16} />
                  <span>{seller.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone size={16} />
                  <span>{seller.phone_number || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Store size={16} />
                  <span>{seller.store?.name || "No store created"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={16} />
                  <span>
                    {seller.store?.city || seller.store?.address || "No address"}
                  </span>
                </div>
              </div>

              {seller.store?.bio && (
                <div className="mt-4 rounded-lg border border-gray-800 bg-slate-950/50 p-4 text-sm text-slate-300">
                  {seller.store.bio}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Products", value: seller.totalProducts ?? 0 },
                { label: "Coupons", value: seller.totalCoupons ?? 0 },
                { label: "Banners", value: seller.totalBanners ?? 0 },
                { label: "Reviews", value: seller.totalReviews ?? 0 },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-900 p-5">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gray-900 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Store Products</h3>
            {seller.store?.products?.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {seller.store.products.map((product) => (
                  <div
                    key={product.id}
                    className="overflow-hidden rounded-xl border border-gray-800 bg-slate-950/50"
                  >
                    <div className="relative h-44 w-full bg-slate-900">
                      <Image
                        src={product.images?.[0]?.url || "/file.svg"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <h4 className="font-semibold text-white">{product.title}</h4>
                      <p className="text-sm text-slate-400">
                        {product.category} / {product.subCategory}
                      </p>
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>Stock: {product.stock}</span>
                        <span>Status: {product.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>Sale: Rs {product.sale_price}</span>
                        <span>Regular: Rs {product.regular_price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">This seller has no store products yet.</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-xl bg-gray-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Seller Coupons</h3>
              {seller.coupons?.length ? (
                <div className="space-y-3">
                  {seller.coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between rounded-lg border border-gray-800 bg-slate-950/50 p-3"
                    >
                      <div>
                        <p className="font-medium text-white">{coupon.public_name}</p>
                        <p className="text-sm text-slate-400">{coupon.discountCode}</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <TicketPercent size={16} />
                        <span>
                          {coupon.discountValue}
                          {coupon.discountType === "percentage" ? "%" : " Rs"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No seller coupons available.</p>
              )}
            </div>

            <div className="rounded-xl bg-gray-900 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Store Reviews</h3>
              {seller.store?.storeReviews?.length ? (
                <div className="space-y-3">
                  {seller.store.storeReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-gray-800 bg-slate-950/50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-white">
                          {review.user?.name || "Anonymous user"}
                        </p>
                        <p className="text-sm text-amber-300">
                          Rating: {review.rating}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {review.reviews || "No written review"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No store reviews yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
};

export default SellerDetailPage;
