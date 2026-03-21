"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@repo/ui";

import DashboardPageShell from "@/shared/components/dashboard/dashboard-page-shell";
import {
  adminQueryKeys,
  createAdminCategory,
  createAdminSubCategory,
  getCategoryConfigKey,
  useAdminCategories,
} from "@/hooks/useAdminQueries";

type CategoryFormValues = {
  name: string;
};

type SubCategoryFormValues = {
  category: string;
  name: string;
};

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminCategories();
  const categories = data?.categories || [];
  const subCategories = data?.subCategories || {};

  const {
    register: registerCategory,
    handleSubmit: handleCategorySubmit,
    reset: resetCategory,
  } = useForm<CategoryFormValues>({
    defaultValues: { name: "" },
  });

  const {
    register: registerSubCategory,
    handleSubmit: handleSubCategorySubmit,
    reset: resetSubCategory,
  } = useForm<SubCategoryFormValues>({
    defaultValues: { category: "", name: "" },
  });

  const refreshCategories = () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories });

  const createCategoryMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => createAdminCategory(values.name),
    onSuccess: () => {
      toast.success("Category created");
      resetCategory();
      refreshCategories();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create category");
    },
  });

  const createSubCategoryMutation = useMutation({
    mutationFn: (values: SubCategoryFormValues) =>
      createAdminSubCategory(values.category, values.name),
    onSuccess: () => {
      toast.success("Subcategory created");
      resetSubCategory();
      refreshCategories();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create subcategory",
      );
    },
  });

  return (
    <DashboardPageShell
      title="Categories"
      breadcrumbTitle="Category Manager"
      description="Manage the catalog categories and subcategories used in admin product forms."
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px,1fr]">
        <div className="space-y-6">
          <div className="rounded-xl bg-gray-900 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Add Category</h3>
            <form
              className="space-y-4"
              onSubmit={handleCategorySubmit((values) =>
                createCategoryMutation.mutate(values),
              )}
            >
              <Input
                label="Category Name"
                placeholder="Fresh Water"
                {...registerCategory("name", { required: true })}
              />
              <button
                type="submit"
                disabled={createCategoryMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus size={18} />
                {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-gray-900 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Add Subcategory
            </h3>
            <form
              className="space-y-4"
              onSubmit={handleSubCategorySubmit((values) =>
                createSubCategoryMutation.mutate(values),
              )}
            >
              <div>
                <label className="mb-1 block text-sm text-gray-300">Category</label>
                <select
                  {...registerSubCategory("category", { required: true })}
                  className="w-full rounded-md border border-gray-700 bg-transparent px-3 py-2 text-white outline-none"
                >
                  <option value="" className="bg-slate-950">
                    Select category
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-slate-950"
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Subcategory Name"
                placeholder="Rui/Rohu"
                {...registerSubCategory("name", { required: true })}
              />
              <button
                type="submit"
                disabled={createSubCategoryMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus size={18} />
                {createSubCategoryMutation.isPending
                  ? "Creating..."
                  : "Create Subcategory"}
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-xl bg-gray-900 p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Current Category Tree
          </h3>
          {isLoading ? (
            <p className="text-gray-400">Loading categories...</p>
          ) : (
            <div className="space-y-5">
              {categories.map((category) => {
                const items = subCategories[getCategoryConfigKey(category)] || [];

                return (
                  <div
                    key={category}
                    className="rounded-lg border border-gray-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-white">
                        {category}
                      </h4>
                      <span className="text-xs text-slate-400">
                        {items.length} subcategories
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {items.length === 0 && (
                        <p className="text-sm text-slate-400">
                          No subcategories added yet.
                        </p>
                      )}
                      {items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
};

export default CategoriesPage;
