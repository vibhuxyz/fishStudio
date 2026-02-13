"use client";
import BreadCrumbs from "@/shared/components/breadcrumbs";
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

import { useQuery } from "@tanstack/react-query";

import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm();

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

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (slugValue) {
        setIsSlugChecking(true);
        axiosInstance
          .post("/product/api/slug-validator", { slug: slugValue }, isProtected)
          .then((res) => {
            if (res.data.available) {
              toast.success("Slug is available and applied!");
            } else {
              setValue("slug", res.data.slug);
              toast.info("Slug was taken. Suggested new one applied.");
            }
          })
          .catch(() => {
            toast.error("Error checking slug!");
          })
          .finally(() => {
            setIsSlugChecking(false);
          });
      }
    }, 3000);

    return () => clearTimeout(delayDebounce);
  }, [slugValue]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          "/product/api/get-categories",
          isProtected,
        );
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-discount-codes",
        isProtected,
      );
      return res?.data?.discount_codes || [];
    },
  });

  // Extract data from API response
  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  // Watch form fields
  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  // Category mapping from display name to API key
  const categoryKeyMap: { [key: string]: string } = {
    "Fresh Water": "freshWater",
    "Sea Fish": "seaFish",
    "Premium Sea Food": "premiumSeaFood",
    "Pet Serve": "petServe",
  };

  // Memoized subcategories based on selected category
  const subcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryKey = categoryKeyMap[selectedCategory];
    return subCategoriesData[categoryKey] || [];
  }, [selectedCategory, subCategoriesData]);

  // ---------------------------------------------------------
  // UPDATED SUBMIT LOGIC FOR IMAGES
  // ---------------------------------------------------------
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      // 1. Filter valid images
      const validImages = images.filter((img) => img !== null && img.base64);

      // 2. Upload images
      const uploadedImagesData = await Promise.all(
        validImages.map(async (img) => {
          if (!img?.base64) return null;

          try {
            // Send base64 data as 'fileName' to match backend destructuring
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

      // 3. Prepare final payload
      const submitData = {
        ...data,
        sizes: data.sizes,
        cuttingTypes: data.cuttingType,
        pieceSizes: data.pieceSizes,
        images: finalImages,
        ...(data.processingWeightLoss &&
          data.processingWeightLoss.trim() && {
            processingWeightLoss: data.processingWeightLoss,
          }),
      };

      console.log("Submitting final payload:", submitData);

      // 4. Create Product
      await axiosInstance.post("/product/api/create-product", submitData);

      toast.success("Product created successfully!");
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create product");
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
                          const res = await axiosInstance.post(
                            "/product/api/slug-validator",
                            { slug: rawSlug },
                          );
                          const { available, suggestedSlug } = res.data;

                          if (available) {
                            setValue("slug", rawSlug);
                            toast.success("Slug is available!");
                          } else if (suggestedSlug) {
                            setValue("slug", suggestedSlug);
                            toast.info(
                              "Slug not available, suggested new one!",
                            );
                          } else {
                            toast.error(
                              "Slug is already taken, try editing it.",
                            );
                          }
                        } catch (err) {
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
              </div>

              <div className="mt-2">
                <Input
                  label="Regular Price"
                  placeholder="200₹"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Price must be at least 1" },
                    validate: (value) =>
                      !isNaN(value) || "Only numbers are allowed",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.regular_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Sale Price *"
                  placeholder="15₹"
                  {...register("sale_price", {
                    required: "Sale Price is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Sale Price must be at least 1" },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed";
                      if (regularPrice && value >= regularPrice) {
                        return "Sale Price must be less than Regular Price";
                      }
                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sale_price.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    required: "Stock is required!",
                    valueAsNumber: true,
                    min: { value: 1, message: "Stock must be at least 1" },
                    max: {
                      value: 1000,
                      message: "Stock cannot exceed 1,000",
                    },
                    validate: (value) => {
                      if (isNaN(value)) return "Only numbers are allowed!";
                      if (!Number.isInteger(value))
                        return "Stock must be a whole number!";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stock.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
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
                      const wordCount = value
                        ?.split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 1 || "Description must be at least 1 word!"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
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
              <div className="mt-3">
                <label className="block font-semibold text-gray-300 mb-1">
                  Select Discount Codes (optional)
                </label>

                {discountLoading ? (
                  <p className="text-gray-400">Loading discount codes...</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {discountCodes?.map((code: any) => (
                      <button
                        key={code.id}
                        type="button"
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                          watch("discountCodes")?.includes(code.id)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                        }`}
                        onClick={() => {
                          const currentSelection = watch("discountCodes") || [];
                          const updatedSelection = currentSelection?.includes(
                            code.id,
                          )
                            ? currentSelection.filter(
                                (id: string) => id !== code.id,
                              )
                            : [...currentSelection, code.id];
                          setValue("discountCodes", updatedSelection);
                        }}
                      >
                        {code?.public_name} ({code.discountValue}
                        {code.discountType === "percentage" ? "%" : "$"})
                      </button>
                    ))}
                  </div>
                )}
                {discountCodes?.length === 0 && !discountLoading && (
                  <p className="text-gray-400">
                    No Discount codes available to add!
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
