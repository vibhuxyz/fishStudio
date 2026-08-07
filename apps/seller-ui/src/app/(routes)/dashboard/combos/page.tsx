"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  X,
  Search,
  Package,
  Loader2,
  Power,
  Tag,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { isProtected } from "@/utils/protected";
import useRequireAuth from "@/hooks/useRequiredAuth";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import ImagePlaceHolder from "@/shared/components/image-placeholder";

interface OwnedProduct {
  id: string;
  title: string;
  status: string;
  regular_price: number;
  sale_price: number;
  cuttingTypes: string[];
  pieceSizes: string[];
  images?: { url: string }[];
}

interface ComboItem {
  productId: string;
  quantity: number;
  cuttingType?: string;
  pieceSize?: string;
}

interface Combo {
  id: string;
  title: string;
  description: string | null;
  items: ComboItem[];
  regularTotal: number;
  comboPrice: number;
  isActive: boolean;
}

// Working copy of a picked product while the create form is open — carries
// the product's own variant options along so the form can offer them.
type PickedItem = ComboItem & {
  title: string;
  regular_price: number;
  cuttingTypes: string[];
  pieceSizes: string[];
};

const fetchOwnedProducts = async (): Promise<OwnedProduct[]> => {
  const res = await axiosInstance.get(
    "/product/api/get-owned-products?page=1&limit=200",
    isProtected,
  );
  return Array.isArray(res.data.products) ? res.data.products : [];
};

const fetchCombos = async (): Promise<Combo[]> => {
  const res = await axiosInstance.get("/product/api/get-seller-combos", isProtected);
  return Array.isArray(res.data.combos) ? res.data.combos : [];
};

export default function CombosPage() {
  useRequireAuth("product");
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: combos = [], isLoading } = useQuery({
    queryKey: ["seller", "combos"],
    queryFn: fetchCombos,
    staleTime: 1000 * 30,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["seller", "combos"] });

  const handleToggle = async (combo: Combo) => {
    try {
      await axiosInstance.patch(`/product/api/toggle-combo/${combo.id}`, {}, isProtected);
      toast.success(combo.isActive ? "Combo deactivated" : "Combo activated");
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update combo");
    }
  };

  const handleDelete = async (combo: Combo) => {
    if (!confirm(`Delete "${combo.title}"? This can't be undone.`)) return;
    try {
      await axiosInstance.delete(`/product/api/delete-combo/${combo.id}`, isProtected);
      toast.success("Combo deleted");
      invalidate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete combo");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <BreadCrumbs title="Combos" />
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Combo
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : combos.length === 0 ? (
        <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-10 text-center text-gray-400">
          No combos yet. Bundle a few of your products together at a special price.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo) => {
            const discountPct = Math.round(
              ((combo.regularTotal - combo.comboPrice) / combo.regularTotal) * 100,
            );
            return (
              <div
                key={combo.id}
                className="rounded-xl border border-gray-700 bg-gray-800/50 p-5"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-white">{combo.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      combo.isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {combo.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mb-3 text-xs text-gray-400">
                  {combo.items.length} products bundled
                </p>
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white">₹{combo.comboPrice}</span>
                  <span className="text-sm text-gray-500 line-through">₹{combo.regularTotal}</span>
                  <span className="text-xs font-semibold text-emerald-400">{discountPct}% off</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(combo)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-600 py-2 text-xs font-semibold text-gray-300 transition hover:bg-gray-700"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {combo.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(combo)}
                    className="flex items-center justify-center rounded-lg border border-gray-600 px-3 text-gray-400 transition hover:border-red-500/40 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateComboModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            invalidate();
          }}
        />
      )}
    </div>
  );
}

function CreateComboModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["seller", "products", "picker"],
    queryFn: fetchOwnedProducts,
    staleTime: 1000 * 60,
  });

  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [picked, setPicked] = useState<PickedItem[]>([]);
  const [saving, setSaving] = useState(false);
  // A dedicated combo photo, uploaded separately from the bundled products —
  // relying on the component products' own images meant a combo with items
  // that had no photo of their own showed nothing at all.
  const [comboImages, setComboImages] = useState<any[]>([null]);

  const activeProducts = useMemo(
    () => products.filter((p) => p.status === "Active" && !picked.some((i) => i.productId === p.id)),
    [products, picked],
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return activeProducts.filter((p) => p.title.toLowerCase().includes(q)).slice(0, 8);
  }, [search, activeProducts]);

  const regularTotal = picked.reduce((sum, i) => sum + i.regular_price * i.quantity, 0);
  const priceNum = Number(comboPrice) || 0;
  const discountPct =
    regularTotal > 0 ? Math.round(((regularTotal - priceNum) / regularTotal) * 100) : 0;

  const addProduct = (p: OwnedProduct) => {
    setPicked((prev) => [
      ...prev,
      {
        productId: p.id,
        quantity: 1,
        title: p.title,
        regular_price: p.regular_price || p.sale_price,
        cuttingTypes: p.cuttingTypes || [],
        pieceSizes: p.pieceSizes || [],
      },
    ]);
    setSearch("");
  };

  const removeItem = (productId: string) => {
    setPicked((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateItem = (productId: string, patch: Partial<PickedItem>) => {
    setPicked((prev) => prev.map((i) => (i.productId === productId ? { ...i, ...patch } : i)));
  };

  const isImageUploading = comboImages.some((img) => img?.uploading);

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error("Enter a combo title"); return; }
    if (picked.length < 2) { toast.error("A combo needs at least 2 products"); return; }
    if (!priceNum || priceNum <= 0) { toast.error("Enter a valid combo price"); return; }
    if (priceNum >= regularTotal) {
      toast.error("Combo price must be less than the combined regular price");
      return;
    }
    if (isImageUploading) { toast.error("Wait for the combo image to finish uploading"); return; }

    const images = comboImages
      .filter((img) => img?.file_url)
      .map((img) => img.file_url as string);

    setSaving(true);
    try {
      await axiosInstance.post(
        "/product/api/create-combo",
        {
          title: title.trim(),
          description: description.trim() || undefined,
          comboPrice: priceNum,
          images,
          items: picked.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            ...(i.cuttingType ? { cuttingType: i.cuttingType } : {}),
            ...(i.pieceSize ? { pieceSize: i.pieceSize } : {}),
          })),
        },
        isProtected,
      );
      toast.success("Combo created!");
      onCreated();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create combo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Create Combo</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Combo Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekend Fish Feast"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What makes this combo worth it?"
              className="w-full resize-none rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Combo Image</label>
            <p className="text-xs text-gray-500 mb-1">
              Shown on the combo card instead of the bundled products' own photos.
            </p>
            <ImagePlaceHolder
              index={0}
              size="800 x 800"
              small
              images={comboImages}
              setImages={setComboImages}
              autoUpload
              setValue={() => {}}
            />
          </div>

          {/* Product picker */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-300">Add Products</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={productsLoading ? "Loading your products..." : "Search your products..."}
                disabled={productsLoading}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 py-2.5 pl-9 pr-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-600 bg-gray-800">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addProduct(p)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-gray-700"
                  >
                    <span className="truncate">{p.title}</span>
                    <span className="ml-3 flex-shrink-0 text-gray-400">₹{p.regular_price || p.sale_price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Picked items */}
          {picked.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Combo Items ({picked.length})
              </label>
              {picked.map((item) => (
                <div key={item.productId} className="rounded-lg border border-gray-700 bg-gray-800/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Package className="h-3.5 w-3.5 text-gray-500" />
                      {item.title}
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">Qty</span>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.productId, { quantity: Math.max(1, Number(e.target.value) || 1) })
                        }
                        className="w-16 rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    {item.cuttingTypes.length > 0 && (
                      <select
                        value={item.cuttingType || ""}
                        onChange={(e) => updateItem(item.productId, { cuttingType: e.target.value || undefined })}
                        className="rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Cutting: let customer choose</option>
                        {item.cuttingTypes.map((ct) => (
                          <option key={ct} value={ct}>Cutting: {ct}</option>
                        ))}
                      </select>
                    )}
                    {item.pieceSizes.length > 0 && (
                      <select
                        value={item.pieceSize || ""}
                        onChange={(e) => updateItem(item.productId, { pieceSize: e.target.value || undefined })}
                        className="rounded-md border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Size: let customer choose</option>
                        {item.pieceSizes.map((ps) => (
                          <option key={ps} value={ps}>Size: {ps}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pricing */}
          {picked.length >= 2 && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-gray-300">Combined regular price</span>
                <span className="font-semibold text-white">₹{regularTotal.toFixed(0)}</span>
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
                  <Tag className="h-3.5 w-3.5" />
                  Combo Price
                </label>
                <input
                  type="number"
                  min={1}
                  value={comboPrice}
                  onChange={(e) => setComboPrice(e.target.value)}
                  placeholder={`Less than ₹${regularTotal.toFixed(0)}`}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              {priceNum > 0 && priceNum < regularTotal && (
                <p className="mt-2 text-xs font-semibold text-emerald-400">
                  {discountPct}% off for the customer
                </p>
              )}
              {priceNum > 0 && priceNum >= regularTotal && (
                <p className="mt-2 text-xs font-semibold text-red-400">
                  Combo price must be less than ₹{regularTotal.toFixed(0)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-600 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || isImageUploading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Creating..." : "Create Combo"}
          </button>
        </div>
      </div>
    </div>
  );
}
