"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import BreadCrumbs from "@/shared/components/breadcrumbs";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";

type CatalogProduct = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  tags: string[];
  sizes: string[];
  images: Array<{ url?: string | null }>;
  alreadyAdded?: boolean;
  sellerProductId?: string | null;
};

type SizePricingRow = {
  size: string;
  weightGrams: number;
  regularPrice: number;
  salePrice: number;
};

type DiscountCode = {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
};

type SellerCatalogFormValues = {
  stock: number;
  cash_on_delivery: "yes" | "no";
  short_description: string;
  detailed_description: string;
  tags: string;
  status: "Active" | "Draft" | "Pending";
  discountCodes: string[];
  sizePricing: SizePricingRow[];
};

const parseWeightToGrams = (size: string) => {
  const match = size.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|g|gm)/);
  if (!match) return 0;

  const amount = Number(match[1]);
  return match[2] === "kg" ? Math.round(amount * 1000) : Math.round(amount);
};

const buildSizePricingRows = (sizes: string[]): SizePricingRow[] =>
  sizes.map((size) => ({
    size,
    weightGrams: parseWeightToGrams(size),
    regularPrice: 0,
    salePrice: 0,
  }));

const fetchCatalogProducts = async (): Promise<CatalogProduct[]> => {
  const res = await axiosInstance.get("/product/api/get-catalog-products", isProtected);
  return Array.isArray(res.data.products) ? res.data.products : [];
};

const fetchDiscountCodes = async (): Promise<DiscountCode[]> => {
  const res = await axiosInstance.get("/product/api/get-discount-codes", isProtected);
  return Array.isArray(res.data.discount_codes) ? res.data.discount_codes : [];
};

const addProductToStore = async ({
  catalogProductId,
  payload,
}: {
  catalogProductId: string;
  payload: SellerCatalogFormValues;
}) => {
  await axiosInstance.post(
    `/product/api/add-catalog-product-to-store/${catalogProductId}`,
    payload,
    isProtected,
  );
};

const Page = () => {
  useRequireAuth("product");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const {
    data: catalogProducts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["seller", "catalog-products"],
    queryFn: fetchCatalogProducts,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const { data: discountCodes = [] } = useQuery({
    queryKey: ["seller", "discounts"],
    queryFn: fetchDiscountCodes,
    staleTime: 1000 * 60 * 5,
  });

  const { register, handleSubmit, reset, watch, setValue } =
    useForm<SellerCatalogFormValues>({
      defaultValues: {
        stock: 0,
        cash_on_delivery: "yes",
        short_description: "",
        detailed_description: "",
        tags: "",
        status: "Active",
        discountCodes: [],
        sizePricing: [],
      },
    });

  const selectedDiscountCodes = watch("discountCodes") || [];
  const selectedSizePricing = watch("sizePricing") || [];

  const addMutation = useMutation({
    mutationFn: addProductToStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "catalog-products"] });
      queryClient.invalidateQueries({ queryKey: ["seller", "products"] });
      toast.success("Product added to your shop.");
      setSelectedProduct(null);
      router.push("/dashboard/all-products");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add product to store.");
    },
  });

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return catalogProducts;

    return catalogProducts.filter((product) =>
      [product.title, product.category, product.subCategory, product.short_description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [catalogProducts, search]);

  const openConfigureModal = (product: CatalogProduct) => {
    setSelectedProduct(product);
    reset({
      stock: 0,
      cash_on_delivery: "yes",
      short_description: product.short_description || "",
      detailed_description: product.detailed_description || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
      status: "Active",
      discountCodes: [],
      sizePricing: buildSizePricingRows(product.sizes || []),
    });
  };

  const onSubmit = (values: SellerCatalogFormValues) => {
    if (!selectedProduct) return;
    const hasInvalidPricing = values.sizePricing.some(
      (entry) => entry.weightGrams <= 0 || entry.salePrice <= 0,
    );

    if (hasInvalidPricing) {
      toast.error("Add a valid weight and sale price for each size.");
      return;
    }

    addMutation.mutate({
      catalogProductId: selectedProduct.id,
      payload: values,
    });
  };

  return (
    <div className="mx-auto w-full rounded-lg p-8 text-white shadow-md">
      <div className="mb-1">
        <h2 className="py-2 text-2xl font-semibold font-Poppins text-white">
          Add Product From Catalog
        </h2>
        <p className="text-sm text-slate-400">
          Choose an admin catalog product, then set your own seller price,
          stock, coupon, and availability before it goes live in your shop.
        </p>
      </div>
      <BreadCrumbs title="Create Product" />

      <div className="mt-6 flex items-center rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
        <Search size={18} className="mr-2 text-slate-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the admin catalog..."
          className="w-full bg-transparent text-white outline-none"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-slate-300">
            Loading catalog products...
          </div>
        )}

        {!isLoading &&
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70"
            >
              <div className="relative h-52 w-full bg-slate-900">
                <Image
                  src={product.images?.[0]?.url || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {product.title}
                    </h3>
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{product.subCategory}</p>
                </div>

                <p className="line-clamp-3 text-sm text-slate-300">
                  {product.short_description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {(product.tags || []).slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={product.alreadyAdded}
                  onClick={() => openConfigureModal(product)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  <Plus size={16} />
                  {product.alreadyAdded ? "Already In Shop" : "Configure And Add"}
                </button>
              </div>
            </div>
          ))}

        {!isLoading && isError && (
          <div className="rounded-xl border border-rose-800 bg-rose-950/30 p-6 text-rose-200">
            {error instanceof Error
              ? error.message
              : "We could not load the admin catalog right now."}
          </div>
        )}

        {!isLoading && !isError && filteredProducts.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-slate-300">
            No catalog products matched your search.
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6">
          <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Configure Shop Product
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedProduct.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <label className="mb-1 block text-sm text-slate-300">Stock</label>
                <input
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
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

              <div>
                <label className="mb-1 block text-sm text-slate-300">Status</label>
                <select
                  {...register("status")}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                >
                  <option value="Active" className="bg-slate-950">
                    Active
                  </option>
                  <option value="Draft" className="bg-slate-950">
                    Draft
                  </option>
                  <option value="Pending" className="bg-slate-950">
                    Pending
                  </option>
                </select>
              </div>

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
                          Price will be used for {entry.weightGrams || "selected"} gm
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
                            setValue("sizePricing", nextRows, {
                              shouldDirty: true,
                            });
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
                            setValue("sizePricing", nextRows, {
                              shouldDirty: true,
                            });
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
                            setValue("sizePricing", nextRows, {
                              shouldDirty: true,
                            });
                          }}
                          className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-300">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  {...register("short_description")}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-300">
                  Detailed Description
                </label>
                <textarea
                  rows={5}
                  {...register("detailed_description")}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-slate-300">Tags</label>
                <input
                  {...register("tags")}
                  className="w-full rounded-md border border-slate-700 bg-transparent px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">
                  Seller Coupons
                </label>
                <div className="flex flex-wrap gap-2 rounded-md border border-slate-800 bg-slate-900/60 p-3">
                  {discountCodes.length === 0 && (
                    <p className="text-sm text-slate-400">
                      No seller coupons yet. You can still add the product now
                      and attach coupons later.
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

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-md bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {addMutation.isPending ? "Adding..." : "Add To Shop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
