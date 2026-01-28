import { shopCategories } from "@/utils/categories";
import { cities } from "@/utils/cities";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const [submitError, setSubmitError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      bio: "",
      city: "",
      address: "",
      pincode: "",
      opening_hours: "",
      website: "",
      category: "",
    },
  });

  const bioValue = watch("bio");
  const countWords = (text: string) => text.trim().split(/\s+/).length;
  const wordCount = bioValue ? countWords(bioValue) : 0;

  const shopCreateMutation = useMutation({
    mutationFn: async (data: any) => {
      const shopData = {
        ...data,
        sellerId,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/auth/api/create-store`,
        shopData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Store created successfully:", data);
      setActiveStep(3);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create shop. Please try again.";
        setSubmitError(errorMessage);
      } else {
        setSubmitError(
          "An unexpected error occurred. Please check the console.",
        );
      }
      console.error("Create shop error:", error);
    },
  });

  const onSubmit = async (data: any) => {
    setSubmitError("");
    console.log("Submitting form with data:", { ...data, sellerId });
    shopCreateMutation.mutate(data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>

        {/* Shop Name */}
        <label className="block text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          placeholder="My Awesome Shop"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2"
          {...register("name", {
            required: "Shop name is required",
            minLength: {
              value: 2,
              message: "Shop name must be at least 2 characters",
            },
            maxLength: {
              value: 100,
              message: "Shop name cannot exceed 100 characters",
            },
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.name.message)}
          </p>
        )}

        {/* Shop Bio */}
        <label className="block text-gray-700 mb-1">
          Bio (Max 100 words) *{" "}
          {wordCount > 0 && (
            <span className="text-gray-500">({wordCount} words)</span>
          )}
        </label>
        <textarea
          placeholder="Tell customers about your shop..."
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2 resize-none"
          rows={4}
          {...register("bio", {
            required: "Shop bio is required",
            minLength: {
              value: 10,
              message: "Bio must be at least 10 characters",
            },
            validate: (value) =>
              countWords(value) <= 100 || "Bio cannot exceed 100 words",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.bio.message)}
          </p>
        )}

        {/* City */}
        {/*<label className="block text-gray-700 mb-1">City *</label>
        <select
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2 bg-white"
          {...register("city", { required: "City is required" })}
        >
          <option value="">Select your city</option>
          {cities.map((city) => (
            <option key={city.code} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
        {errors.city && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.city.message)}
          </p>
        )}*/}

        <label className="block text-gray-700 mb-1">City</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM - 6PM, Sat 10AM - 4PM"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2"
          {...register("city", {
            required: "Opening hours are required",
            minLength: {
              value: 3,
              message: "Please enter valid opening hours",
            },
          })}
        />
        {errors.city && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.city.message)}
          </p>
        )}

        {/* Address */}
        <label className="block text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          placeholder="123 Main Street, Suite 100"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2"
          {...register("address", {
            required: "Shop address is required",
            minLength: {
              value: 5,
              message: "Address must be at least 5 characters",
            },
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.address.message)}
          </p>
        )}

        {/* Pincode - IMPORTANT: Use text, not number */}
        <label className="block text-gray-700 mb-1">Pin Code *</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="123456"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2"
          maxLength={6}
          {...register("pincode", {
            required: "Pincode is required",
            pattern: {
              value: /^[1-9][0-9]{5}$/,
              message: "Pincode must be exactly 6 digits (starting with 1-9)",
            },
          })}
        />
        {errors.pincode && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.pincode.message)}
          </p>
        )}

        {/* Opening Hours */}
        <label className="block text-gray-700 mb-1">Opening Hours *</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM - 6PM, Sat 10AM - 4PM"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2"
          {...register("opening_hours", {
            required: "Opening hours are required",
            minLength: {
              value: 3,
              message: "Please enter valid opening hours",
            },
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.opening_hours.message)}
          </p>
        )}

        {/* Website - Optional */}
        <label className="block text-gray-700 mb-1">Website *</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM - 6PM, Sat 10AM - 4PM"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2"
          {...register("website", {
            required: "Opening hours are required",
            minLength: {
              value: 3,
              message: "Please enter valid opening hours",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.website.message)}
          </p>
        )}

        {/* Website - Optional */}
        <label className="block text-gray-700 mb-1">Category *</label>
        <input
          type="text"
          placeholder="e.g., Mon-Fri 9AM - 6PM, Sat 10AM - 4PM"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-2"
          {...register("category", {
            required: "Opening hours are required",
            minLength: {
              value: 3,
              message: "Please enter valid opening hours",
            },
          })}
        />
        {errors.category && (
          <p className="text-red-500 text-sm mb-3">
            {String(errors.category.message)}
          </p>
        )}

        {/* API Error Message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
            <p className="text-red-600 text-sm">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || shopCreateMutation.isPending}
          className="w-full cursor-pointer text-lg bg-blue-600 text-white py-2 rounded-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {shopCreateMutation.isPending ? "Creating Store..." : "Create Store"}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
