"use client";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import {
  getCategoryConfigKey,
  useAdminCategories,
  validateProductSlug,
} from "@/hooks/useAdminQueries";
import ImagePlaceHolder from "@/shared/components/image-placeholder";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import { Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CoustomCuttingType,
  CoustomPices,
  CustomSizes,
  Input,
  RichTextEditor,
} from "@repo/ui";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type SlugFeedback = {
  tone: "info" | "success" | "error";
  message: string;
};

type ProductFormValues = {
  title?: string;
  slug?: string;
  category?: string;
  subCategory?: string;
  short_description?: string;
  detailed_description?: string;
  tags?: string;
  sizes?: unknown;
  cuttingType?: unknown;
  pieceSizes?: unknown;
  processingWeightLoss?: string;
  discountCodes?: string[];
  [key: string]: unknown;
};

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>();

  const { onChange: formOnChange, ...restSlugProps } = register("slug", {
    required: "Slug is required!",
    pattern: {
      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message:
        "Invalid slug format! Use only lowercase letters, numbers, and dashes (e.g., product-slug).",
    },
    minLength: {
      value: 3,
      message: "Slug must be at least 3 characters long.",
    },
    maxLength: {
      value: 50,
      message: "Slug cannot be longer than 50 characters.",
    },
  });

  const [images, setImages] = useState<
    (null | { file: File; base64: string })[]
  >([null]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [slugValue, setSlugValue] = useState("");
  const [isSlugChecking, setIsSlugChecking] = useState(false);
  const [slugFeedback, setSlugFeedback] = useState<SlugFeedback | null>(null);
  const lastValidatedSlug = useRef("");
  const latestValidationRequest = useRef(0);

  useEffect(() => {
    const trimmedSlug = slugValue.trim();

    if (!trimmedSlug || trimmedSlug.length < 3) {
      setIsSlugChecking(false);
      setSlugFeedback(null);
      return;
    }

    if (trimmedSlug === lastValidatedSlug.current) {
      return;
    }

    const requestId = latestValidationRequest.current + 1;
    latestValidationRequest.current = requestId;

    const delayDebounce = window.setTimeout(async () => {
      setIsSlugChecking(true);
      setSlugFeedback({
        tone: "info",
        message: "Checking slug availability...",
      });

      try {
        const result = await validateProductSlug(trimmedSlug);

        if (latestValidationRequest.current !== requestId) {
          return;
        }

        if (result.available) {
          lastValidatedSlug.current = trimmedSlug;
          setSlugFeedback({
            tone: "success",
            message: "Slug is available.",
          });
          return;
        }

        const resolvedSlug = result.suggestedSlug || result.slug;

        if (resolvedSlug && resolvedSlug !== trimmedSlug) {
          lastValidatedSlug.current = resolvedSlug;
          setSlugValue(resolvedSlug);
          setValue("slug", resolvedSlug, {
            shouldDirty: true,
            shouldValidate: true,
          });
          setSlugFeedback({
            tone: "info",
            message: `"${resolvedSlug}" was applied because the original slug was already taken.`,
          });
          return;
        }

        setSlugFeedback({
          tone: "error",
          message: "We couldn't validate the slug right now.",
        });
      } catch {
        if (latestValidationRequest.current === requestId) {
          setSlugFeedback({
            tone: "error",
            message: "We couldn't validate the slug right now.",
          });
        }
      } finally {
        if (latestValidationRequest.current === requestId) {
          setIsSlugChecking(false);
        }
      }
    }, 800);

    return () => window.clearTimeout(delayDebounce);
  }, [setValue, slugValue]);

  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useAdminCategories();

  const categories = categoriesData?.categories || [];
  const subCategoriesData = categoriesData?.subCategories || {};

  const selectedCategory = watch("category");

  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryKey = getCategoryConfigKey(selectedCategory);
    return subCategoriesData[categoryKey] || [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      const validImages = images.filter((img) => img !== null && img.base64);

      const uploadedImagesData = await Promise.all(
        validImages.map(async (img) => {
          if (!img?.base64) return null;

          try {
            const uploadRes = await axiosInstance.post(
              "/product/api/upload-product-image",
              { fileName: img.base64 },
              isProtected,
            );

            if (uploadRes.data.success) {
              return {
                fileId: uploadRes.data.fileId,
                file_url: uploadRes.data.file_url,
              };
            }
            return null;
          } catch (err) {
            console.error("Image upload failed", err);
            return null;
          }
        }),
      );

      const finalImages = uploadedImagesData.filter(Boolean);

      const submitData = {
        ...data,
        sizes: data.sizes,
        cuttingTypes: data.cuttingType,
        pieceSizes: data.pieceSizes,
        images: finalImages,
        stock: 0,
        sale_price: 0,
        regular_price: 0,
        cash_on_delivery: "yes",
        ...(typeof data.processingWeightLoss === "string" &&
          data.processingWeightLoss.trim() && {
            processingWeightLoss: data.processingWeightLoss,
          }),
      };

      await axiosInstance.post(
        "/product/api/create-product",
        submitData,
        isProtected,
      );

      toast.success("Product created successfully!");
      router.push("/dashboard/all-products");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create product";
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Heading & Breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
         
        Create Product
        <p className="text-red-900 text-4xl">Image upload is not Working Now so Create Product Without image In v1 we will fix</p>
      </h2>
      <BreadCrumbs title="Create Product" />

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left side - Image upload section */}
       
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              size="765 x 850"
              small={false}
              images={images}
              setImages={setImages}
              setValue={setValue}
              index={0}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                size="765 x 850"
                images={images}
                setImages={setImages}
                key={index}
                small
                setValue={setValue}
                index={index + 1}
              />
            ))}
          </div>
        </div>

        {/* Right side - form inputs */}
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            {/* LEFT COLUMN */}

            <div className="w-2/4">
              {/* Product Title Input */}
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words)"
                  placeholder="Enter product description for quick view"
                  {...register("short_description", {
                    required: "Description is required",
                    validate: (value) => {
                      if (!value) return "Description is required";
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
                {errors.short_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.short_description.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Tags *"
                  placeholder="rohu,seafood"
                  {...register("tags", {
                    required: "Separate related products tags with a comma",
                  })}
                />
                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <div className="relative">
                  <Input
                    label="Slug *"
                    placeholder="product_slug"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSlugValue(e.target.value);
                      setValue("slug", e.target.value);
                      formOnChange(e);
                    }}
                    value={watch("slug")}
                    className="pr-10"
                    {...restSlugProps}
                  />

                  <div className="absolute w-7 h-7 flex items-center justify-center bg-blue-600 !rounded shadow top-[70%] right-3 transform -translate-y-1/2 text-white cursor-pointer hover:bg-blue-700">
                    <Wand2
                      size={16}
                      onClick={async () => {
                        const title = getValues("title");
                        if (!title) {
                          toast.error(
                            "Please enter a product title to generate a slug!",
                          );
                          return;
                        }

                        const rawSlug = title
                          .toLowerCase()
                          .trim()
                          .replace(/[^a-z0-9\s-]/g, "")
                          .replace(/\s+/g, "-")
                          .replace(/-+/g, "-");

                        try {
                          const result = await validateProductSlug(rawSlug);
                          const resolvedSlug =
                            result.available ? rawSlug : result.suggestedSlug || result.slug;

                          if (!resolvedSlug) {
                            toast.error("Slug is already taken, try editing it.");
                            return;
                          }

                          lastValidatedSlug.current = resolvedSlug;
                          setSlugValue(resolvedSlug);
                          setValue("slug", resolvedSlug, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });

                          if (result.available || resolvedSlug === rawSlug) {
                            setSlugFeedback({
                              tone: "success",
                              message: "Slug is available.",
                            });
                          } else {
                            setSlugFeedback({
                              tone: "info",
                              message: `"${resolvedSlug}" was applied because the original slug was already taken.`,
                            });
                          }
                        } catch {
                          toast.error("Failed to validate slug. Try again.");
                        }
                      }}
                    />
                  </div>
                </div>

                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.slug.message as string}
                  </p>
                )}
                {!errors.slug && slugFeedback && (
                  <p
                    className={`text-xs mt-1 ${
                      slugFeedback.tone === "success"
                        ? "text-green-400"
                        : slugFeedback.tone === "error"
                          ? "text-red-400"
                          : "text-slate-400"
                    }`}
                  >
                    {isSlugChecking ? "Checking slug availability..." : slugFeedback.message}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                Admin creates the catalog product here. Seller-specific price,
                sale price, stock, coupons, and availability are now managed
                from the seller dashboard after the seller adds this catalog
                product to their shop.
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-2/4">
              {/* Category Dropdown */}
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400">Loading categories...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                    >
                      <option value="" className="bg-black">
                        Select Category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          value={category}
                          key={category}
                          className="bg-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}
              {/* Subcategory Dropdown */}
              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Subcategory *
                </label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: "Subcategory is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                    >
                      <option value="" className="bg-black">
                        Select Subcategory
                      </option>
                      {subcategories?.map((subcategory: string) => (
                        <option
                          key={subcategory}
                          value={subcategory}
                          className="bg-black"
                        >
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subCategory.message as string}
                  </p>
                )}
              </div>
              {/* Coustom Sizes */}
              <div className="mt-2">
                <CustomSizes control={control} errors={errors} />
              </div>

              {/* Coustom Pices*/}
              <div className="mt-2">
                <CoustomPices control={control} errors={errors} />
              </div>

              {/* Coustom Cutting Type*/}
              <div className="mt-2">
                <CoustomCuttingType control={control} errors={errors} />
              </div>

              {/* Processing Weight Loss Info Display */}
              <div className="mt-3">
                <Input
                  label="Processing Weight Loss (optional)"
                  placeholder="e.g., 5%, 10%, 15%"
                  {...register("processingWeightLoss")}
                />
                {errors.processingWeightLoss && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.processingWeightLoss.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Detailed Description * (Min 1 word)
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required!",
                    validate: (value) => {
                      if (!value) {
                        return "Description must be at least 1 word!";
                      }
                      const wordCount = value
                        .split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 1 || "Description must be at least 1 word!"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default Page;
