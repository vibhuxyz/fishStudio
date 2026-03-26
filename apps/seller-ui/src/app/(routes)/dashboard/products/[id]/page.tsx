"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import BreadCrumbs from "@/shared/components/breadcrumbs";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { frontendEnv } from "@/config/env";

import {
  SizePricingRow,
  DiscountCode,
  SellerOwnedProduct,
  SellerProductFormValues,
} from "@repo/zod-schema";

const parseWeightToGrams = (size: string) => {
  const match = size.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/);
  if (!match) return 0;

  const amount = Number(match[1]);
  return match[2] === "kg" ? Math.round(amount * 1000) : Math.round(amount);
};

const buildSizePricingRows = (
  sizes: string[],
  sizePricing?: SizePricingRow[] | null,
): SizePricingRow[] =>
  sizes.map((size) => {
    const existing = sizePricing?.find((entry) => entry.size === size);

    return {
      size,
      weightGrams: existing?.weightGrams ?? parseWeightToGrams(size),
      regularPrice: Number(existing?.regularPrice ?? 0),
      salePrice: Number(existing?.salePrice ?? 0),
    };
  });


const fetchOwnedProduct = async (productId: string): Promise<SellerOwnedProduct> => {
  const res = await axiosInstance.get(
    `/product/api/get-owned-product/${productId}`,
    isProtected,
  );

  return res.data.product;
};

const fetchDiscountCodes = async (): Promise<DiscountCode[]> => {
  const res = await axiosInstance.get("/product/api/get-discount-codes", isProtected);
  return Array.isArray(res.data.discount_codes) ? res.data.discount_codes : [];
};

const updateProduct = async ({
  productId,
  ...payload
}: SellerProductFormValues) => {
  await axiosInstance.put(`/product/api/update-product/${productId}`, payload, isProtected);
};

const SellerProductDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productId = typeof params?.id === "string" ? params.id : "";

  const { data: product, isLoading } = useQuery({
    queryKey: ["seller", "product", productId],
    queryFn: () => fetchOwnedProduct(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: discountCodes = [] } = useQuery({
    queryKey: ["seller", "discounts"],
    queryFn: fetchDiscountCodes,
    staleTime: 1000 * 60 * 5,
  });

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<SellerProductFormValues>({
      defaultValues: {
        productId: "",
        title: "",
        slug: "",
        short_description: "",
        tags: "",
        stock: 0,
        cash_on_delivery: "yes",
        status: "Active",
        discountCodes: [],
        sizePricing: [],
        regular_price: 0,
        sale_price: 0,
      },
    });

  useEffect(() => {
    if (!product) return;

    reset({
      productId: product.id,
      title: product.title ?? "",
      slug: product.slug ?? "",
      short_description: product.short_description ?? "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      stock: Number(product.stock ?? 0),
      cash_on_delivery: product.cashOnDelivery === "no" ? "no" : "yes",
      status: product.status === "NonActive" ? "NonActive" : "Active",
      discountCodes: Array.isArray(product.discount_codes)
        ? product.discount_codes
        : [],
      sizePricing: buildSizePricingRows(product.sizes || [], product.sizePricing),
      regular_price: Number(product.regular_price ?? 0),
      sale_price: Number(product.sale_price ?? 0),
    });
  }, [product, reset]);

  const selectedDiscountCodes = watch("discountCodes") ?? [];
  const selectedSizePricing = watch("sizePricing") ?? [];

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      queryClient.invalidateQueries({ queryKey: ["seller", "product", productId] });
      toast.success("Shop product updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update product.");
    },
  });

  const onSubmit = (values: SellerProductFormValues) => {
    if (values.sizePricing.length > 0) {
      const hasInvalidPricing = values.sizePricing.some(
        (entry) => entry.weightGrams <= 0 || entry.salePrice <= 0,
      );
      if (hasInvalidPricing) {
        toast.error("Add a valid weight and sale price for each size.");
        return;
      }
    } else if (!values.sale_price || values.sale_price <= 0) {
      toast.error("Add a valid sale price.");
      return;
    }

    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-300">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen p-8 text-white">
        <button
          type="button"
          onClick={() => router.push("/dashboard/all-products")}
          className="mb-6 inline-flex items-center gap-2 text-slate-300 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to shop products
        </button>
        <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-slate-300">
          We could not find that shop product.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-8 text-white">
      <button
        type="button"
        onClick={() => router.push("/dashboard/all-products")}
        className="mb-4 inline-flex items-center gap-2 text-slate-300 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Back to shop products
      </button>

      <div className="mb-2">
        <h1 className="text-2xl font-semibold">Edit Shop Product</h1>
        <p className="text-sm text-slate-400">
          Adjust seller-specific pricing, stock, coupons, and shop copy for this
          catalog product.
        </p>
      </div>

      <BreadCrumbs title="Edit Product" />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">{product.title}</h2>
                <p className="text-sm text-slate-400">
                  {product.category} / {product.subCategory}
                </p>
              </div>
              <Link
                href={`${frontendEnv.userUiUrl}/product/${product.slug}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:text-white"
              >
                Preview
                <ExternalLink size={16} />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className="relative h-48 overflow-hidden rounded-xl bg-slate-900"
                >
                  <Image
                    src={image.url || "/placeholder.png"}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Catalog Source
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  {product.catalogProduct?.title || "Admin catalog product"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Category
                </p>
                <p className="mt-2 text-sm text-slate-200">{product.category}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Subcategory
                </p>
                <p className="mt-2 text-sm text-slate-200">{product.subCategory}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-sm font-semibold text-white">Customer weight pricing</p>
              <p className="mt-1 text-xs text-slate-400">
                Set a base weight and seller price for each size. The user product
                page will recalculate price from these values when shoppers add
                50gm more or less.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6"
        >
          <input type="hidden" {...register("productId")} />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Title
                <span className="ml-2 text-xs text-slate-500">(read-only)</span>
              </label>
              <input
                {...register("title")}
                readOnly
                className="w-full cursor-not-allowed rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Slug
                <span className="ml-2 text-xs text-slate-500">(read-only)</span>
              </label>
              <input
                {...register("slug")}
                readOnly
                className="w-full cursor-not-allowed rounded-md border border-slate-800 bg-slate-900/50 px-3 py-2 text-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Stock</label>
              <input
                type="number"
                {...register("stock", { valueAsNumber: true })}
                className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Status</label>
              <select
                {...register("status")}
                className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              >
                <option value="Active" className="bg-slate-950">
                  Active – Ready to sell
                </option>
                <option value="NonActive" className="bg-slate-950">
                  Non-Active – Coming Soon
                </option>
              </select>
            </div>

            {selectedSizePricing.length > 0 ? (
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">
                  Size-Based Pricing
                </label>
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  {selectedSizePricing.map((entry, index) => (
                    <div
                      key={entry.size}
                      className="grid gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 md:grid-cols-[1.2fr_0.8fr_1fr_1fr]"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{entry.size}</p>
                        <p className="text-xs text-slate-500">
                          {entry.weightGrams || 0} gm
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-400">
                          Weight (gm)
                        </label>
                        <input
                          type="number"
                          value={entry.weightGrams ?? 0}
                          onChange={(event) => {
                            const nextRows = [...selectedSizePricing];
                            nextRows[index] = {
                              ...entry,
                              weightGrams: Number(event.target.value || 0),
                            };
                            setValue("sizePricing", nextRows, { shouldDirty: true });
                          }}
                          className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-400">
                          Regular Price
                        </label>
                        <input
                          type="number"
                          value={entry.regularPrice ?? 0}
                          onChange={(event) => {
                            const nextRows = [...selectedSizePricing];
                            nextRows[index] = {
                              ...entry,
                              regularPrice: Number(event.target.value || 0),
                            };
                            setValue("sizePricing", nextRows, { shouldDirty: true });
                          }}
                          className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-400">
                          Sale Price
                        </label>
                        <input
                          type="number"
                          value={entry.salePrice ?? 0}
                          onChange={(event) => {
                            const nextRows = [...selectedSizePricing];
                            nextRows[index] = {
                              ...entry,
                              salePrice: Number(event.target.value || 0),
                            };
                            setValue("sizePricing", nextRows, { shouldDirty: true });
                          }}
                          className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Regular Price</label>
                  <input
                    type="number"
                    {...register("regular_price", { valueAsNumber: true })}
                    className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Sale Price</label>
                  <input
                    type="number"
                    {...register("sale_price", { valueAsNumber: true })}
                    className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-300">
                Tags
                <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">locked</span>
              </label>
              <input
                value={Array.isArray(product?.tags) ? product.tags.join(", ") : product?.tags || ""}
                readOnly
                tabIndex={-1}
                className="w-full cursor-default select-none rounded-md border border-slate-800 bg-slate-900/30 px-3 py-2 text-slate-500 outline-none pointer-events-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-slate-300">
                Short Description
                <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">locked</span>
              </label>
              <textarea
                rows={3}
                value={product?.short_description || ""}
                readOnly
                tabIndex={-1}
                className="w-full cursor-default select-none rounded-md border border-slate-800 bg-slate-900/30 px-3 py-2 text-slate-500 outline-none pointer-events-none resize-none"
              />
            </div>


            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Cash On Delivery
              </label>
              <select
                {...register("cash_on_delivery")}
                className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
              >
                <option value="yes" className="bg-slate-950">
                  Yes
                </option>
                <option value="no" className="bg-slate-950">
                  No
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-slate-300">
                Seller Coupons
              </label>
              <div className="flex flex-wrap gap-2 rounded-md border border-slate-800 bg-slate-900/60 p-3">
                {discountCodes.length === 0 && (
                  <p className="text-sm text-slate-400">
                    No seller coupons yet. You can save the product now and add
                    coupons later.
                  </p>
                )}
                {discountCodes.map((discount) => {
                  const isSelected = selectedDiscountCodes.includes(discount.id);

                  return (
                    <button
                      key={discount.id}
                      type="button"
                      className={`rounded-md border px-3 py-1 text-sm ${
                        isSelected
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-slate-700 bg-slate-900 text-slate-300"
                      }`}
                      onClick={() => {
                        const nextValue = isSelected
                          ? selectedDiscountCodes.filter((id) => id !== discount.id)
                          : [...selectedDiscountCodes, discount.id];
                        setValue("discountCodes", nextValue);
                      }}
                    >
                      {discount.public_name} ({discount.discountValue}
                      {discount.discountType === "percentage" ? "%" : "Rs"})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/all-products")}
              className="rounded-md bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {updateMutation.isPending ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProductDetailsPage;
