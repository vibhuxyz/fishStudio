import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@repo/zod-schema";
import axiosInstance from "@/utils/axiosInstance";
import { frontendEnv } from "@/lib/env";
import { toast } from "sonner";

/* ── Server-side cart persistence ─────────────────────────────────────────
   There is exactly one server write path for a non-empty cart: validate-cart,
   which syncItems() calls. It already receives every line and persists it
   against the authenticated user, so persisting here means debouncing a
   syncItems() rather than POSTing a second, competing copy of the cart.

   An empty cart is the exception. validate-cart requires >= 1 item and so
   cannot express one, which means emptying the cart by removing its last line
   has to go to /cart/clear instead — otherwise the server keeps the last
   non-empty snapshot and loadServerCart pushes it straight back. persistCart
   is the single write path that gets both cases right; nothing else should
   call syncItems in order to persist.

   site-header re-syncs every 60s anyway; this just makes a change show up on
   the user's other device in seconds instead of up to a minute.
─────────────────────────────────────────────────────────────────────────── */
let _saveCartTimer: ReturnType<typeof setTimeout> | null = null;

/** Bumped by every cart mutation. A write captures it before starting and
 *  only clears `cartDirty` if it hasn't moved — otherwise an edit made while
 *  the request was in flight would be marked saved on the strength of a
 *  response that didn't contain it, and the next load would overwrite it. */
let _cartRevision = 0;

function cancelPendingPersist() {
  if (_saveCartTimer) {
    clearTimeout(_saveCartTimer);
    _saveCartTimer = null;
  }
}

/** Debounce a write of the whole cart. Callers must also set `cartDirty` in
 *  the same set() that changed the items — this timer dies with the page, and
 *  the persisted flag is the only thing that survives a refresh inside the
 *  debounce window to tell loadServerCart which copy is the newer one. */
function schedulePersistCart() {
  _cartRevision += 1;
  cancelPendingPersist();
  _saveCartTimer = setTimeout(() => {
    // Errors are swallowed inside persistCart, which treats a failed write as
    // non-fatal; the cart stays dirty and the next load retries it.
    void useCartStore.getState().persistCart();
  }, 2_000);
}

/** Options travel to the server as names and come back rebuilt into slug ids
 *  ("Whole Fish" → "whole-fish", where the local default id is "whole"), and
 *  a product id is rewritten to its resolved variant by syncItems. Keying the
 *  signature on the normalized *name* is what stops a restored line from
 *  failing to dedupe against the identical local line and showing up twice. */
function normalizeSignaturePart(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

/** Stable signature for a cart line so the same product+options dedupes.
 *  Combo-linked lines never dedupe with a standalone purchase of the same
 *  product+options — they're priced (and must checkout) as part of the
 *  bundle, not merged into an unrelated line. */
function cartItemSignature(i: CartItem): string {
  return [
    i.product?.id,
    normalizeSignaturePart(i.cuttingType?.name),
    normalizeSignaturePart(i.pieceSize?.name),
    normalizeSignaturePart(i.size),
    i.comboId ?? "",
  ].join("|");
}

/** Merge server-restored items into local items, deduping by signature. */
function mergeCartItems(local: CartItem[], incoming: CartItem[]): CartItem[] {
  const bySig = new Map<string, CartItem>();
  for (const item of local) bySig.set(cartItemSignature(item), item);
  for (const item of incoming) {
    const sig = cartItemSignature(item);
    // Local edits win for a line that exists on both devices.
    if (!bySig.has(sig)) bySig.set(sig, item);
  }
  return [...bySig.values()];
}

/** @returns true only when the server acknowledged the clear, so a failure
 *  leaves the cart dirty to be retried rather than silently dropped. */
async function clearServerCart(): Promise<boolean> {
  try {
    // validate-cart cannot express an empty cart (it requires >= 1 item), so
    // clearing needs its own endpoint or the server would keep the last
    // non-empty snapshot forever.
    await axiosInstance.post("/product/api/cart/clear", {});
    return true;
  } catch {
    // Non-critical — an order-placed clear is also handled server-side by
    // createOrder, and the reminder job skips empty carts.
    return false;
  }
}

type CuttingType = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

type PieceSize = {
  id: string;
  name: string;
  range?: string;
  description?: string;
  useCase?: string;
};

export type PriceBreakdown = {
  baseRatePerKg?: number;
  cuttingCharge?: number;
  sizeMultiplier?: number;
  weightGrams?: number;
  effectiveRatePerKg?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
  cuttingType: CuttingType;
  pieceSize: PieceSize;
  size: string;
  totalPayable: number;
  priceBreakdown?: PriceBreakdown;
  // Set when this line came from a combo bundle — checkout tags the order
  // item with it so order-service reprices the whole group to the bundle
  // price instead of charging this line's own catalog price.
  comboId?: string;
  // True between a cross-device restore and the syncItems that fills the
  // product in. The line is an identity with no title or price yet, so the
  // cart renders it as a skeleton rather than a blank ₹0 row.
  isPlaceholder?: boolean;
};

interface CartState {
  items: CartItem[];
  cartStoreId: string | null;
  /** A local change hasn't reached the server yet. Persisted, not module
   *  state: a refresh inside the debounce window kills the pending write, and
   *  this flag is what tells loadServerCart that this device still holds the
   *  newer copy — including a cart the customer just emptied. */
  cartDirty: boolean;
  /** Content version of the server-side cart, from the last validate-cart.
   *  Quoted against and re-asserted at checkout so a cart edited on another
   *  device is caught before the customer is charged the old total. Null until
   *  the first validate-cart of the session lands. */
  cartVersion: number | null;
  /** The account this local cart has already been reconciled with. Null means
   *  the next load is a first reconcile and must merge rather than replace, so
   *  a cart built before signing in is never dropped. */
  syncedUserId: string | null;
  addItem: (
    product: Product,
    quantity: number,
    cuttingType: CuttingType | string,
    pieceSize: PieceSize | string,
    size: string,
    priceBreakdown?: PriceBreakdown,
  ) => void;
  /** Adds a combo bundle member at its bundle-prorated unit price rather
   *  than the product's own catalog price. */
  addComboItem: (
    comboId: string,
    product: Product,
    quantity: number,
    cuttingType: CuttingType | string,
    pieceSize: PieceSize | string,
    unitPrice: number,
  ) => void;
  removeItem: (index: number) => void;
  /** Removes every line belonging to a combo bundle in one shot — combo
   *  members can't be removed individually, only as a whole group. */
  removeComboGroup: (comboId: string) => void;
  updateQuantity: (index: number, quantity: number) => void;
  /** Async + click: fetches live stock, updates the item's stock, then increments if still available. */
  checkAndIncrement: (index: number, step?: number) => Promise<{ ok: boolean; message?: string }>;
  quickAdd: (product: Product) => void;
  quickRemove: (productId: string) => void;
  getProductQty: (productId: string) => number;
  totalItems: () => number;
  totalPrice: () => number;
  clearCart: () => void;
  /** Drop this device's cart without touching the server copy — for logout,
   *  where the account's saved cart has to survive for the next sign-in. */
  resetLocalCart: () => void;
  /** The one write path for the cart. Routes an emptied cart to /cart/clear
   *  and anything else to validate-cart, and clears `cartDirty` only when the
   *  write actually landed. */
  persistCart: () => Promise<void>;
  /** Reconcile with the user's server-saved cart (cross-device) on load. */
  loadServerCart: (userId: string) => Promise<void>;
  /** Reprices and hydrates the cart via validate-cart, which also persists it.
   *  @returns the response when a POST actually happened, else null. Use
   *  persistCart() to save changes — this can't express an empty cart. */
  syncItems: () => Promise<any>;
  deliveryMetadata: {
    cartDeliveryTime: number | null;
    isStoreOpen: boolean;
    isInstantAvailable: boolean;
    storeName: string | null;
    isServiceable: boolean;
    nearbyHint: string | null;
    openingHours: string | null;
    closingHours: string | null;
    // Seller-set bill config (Store settings in seller-ui) — defaults here
    // match order-service's DEFAULT_CART_PRICING fallback, used only until
    // the first validate-cart response for the resolved store lands.
    gstRate: number;
    packagingCharge: number;
    baseDeliveryCharge: number;
    freeDeliveryThreshold: number;
  };
}

/** Matches order-service's DEFAULT_CART_PRICING fallback; used until the
 *  first validate-cart response for the resolved store lands, and restored
 *  whenever the cart is emptied. */
const DEFAULT_DELIVERY_METADATA: CartState["deliveryMetadata"] = {
  cartDeliveryTime: null,
  isStoreOpen: true,
  isInstantAvailable: true,
  storeName: null,
  isServiceable: true,
  nearbyHint: null,
  openingHours: null,
  closingHours: null,
  gstRate: 0,
  packagingCharge: 0,
  baseDeliveryCharge: 49,
  freeDeliveryThreshold: 500,
};

const DEFAULT_CUTTING: CuttingType = {
  id: "whole",
  name: "Whole Fish",
  description: "Complete fish, cleaned and ready to cook",
  icon: "fish",
};

const DEFAULT_PIECE_SIZE: PieceSize = {
  id: "medium",
  name: "Medium",
  range: "60-80 gm",
  description: "Medium-sized pieces, versatile for most dishes",
  useCase: "Curry, Tandoori, Grill, Fry",
};

const DEFAULT_SIZE = "500 gm - 1 Kg";

/** One line of the server-side cart, as stored by validate-cart. Identities
 *  and options only — never a product snapshot. */
type ServerCartLine = {
  productId: string;
  quantity?: number;
  cuttingType?: string;
  pieceSize?: string;
  size?: string;
  comboId?: string;
};

/** A stand-in product for a line restored from the server, before
 *  validate-cart has resolved what it actually is. Every descriptive field is
 *  empty on purpose: syncItems overwrites them a moment later, and an empty
 *  title is a visible "still loading" rather than a plausible wrong one. */
const placeholderProduct = (id: string, storeId: string | null): Product => ({
  id,
  name: "",
  slug: "",
  description: "",
  image: "",
  images: [],
  price: 0,
  weight: "",
  sizes: [],
  sizePricing: [],
  cuttingTypePricing: [],
  pieceSizePricing: [],
  rating: 0,
  totalSold: 0,
  stock: 0,
  subCategory: "",
  category: "",
  ...(storeId ? { storeId } : {}),
  cuttingTypes: [],
  pieceSizes: [],
  processingWeightLoss: null,
  status: "Active",
  isBestseller: false,
  isFavorite: false,
});

const normalizeOption = (
  option: CuttingType | PieceSize | string,
  fallbackId: string,
) => {
  if (typeof option === "string") {
    return {
      id: option.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: option,
    };
  }

  const normalized = { ...option } as any;
  if (!normalized.id) normalized.id = fallbackId;
  if (!normalized.name) normalized.name = fallbackId;
  return normalized;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartStoreId: null,
      cartDirty: false,
      cartVersion: null,
      syncedUserId: null,
      deliveryMetadata: { ...DEFAULT_DELIVERY_METADATA },

      addItem: (product, quantity, cuttingType, pieceSize, size, priceBreakdown) => {
    const normalizedCuttingType = normalizeOption(cuttingType, "cutting-type");
    const normalizedPieceSize = normalizeOption(pieceSize, "piece-size");
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.cuttingType.id === normalizedCuttingType.id &&
          item.pieceSize.id === normalizedPieceSize.id &&
          item.size === size
      );

      if (existingIndex >= 0) {
        const updated = [...state.items];
        const existing = updated[existingIndex];

        const currentTotalQty = get().getProductQty(product.id);
        if (product.stock !== undefined && currentTotalQty + quantity > product.stock) {
          toast.error(`Cannot add more than ${product.stock} available units`);
          return {};
        }

        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPayable: newQty * product.price,
        };
        schedulePersistCart();
        return { items: updated, cartDirty: true };
      }

      if (product.stock !== undefined && quantity > product.stock) {
        toast.error(`Only ${product.stock} units available in stock`);
        return {};
      }

      const nextItems = [
        ...state.items,
        {
          product,
          quantity,
          cuttingType: normalizedCuttingType,
          pieceSize: normalizedPieceSize,
          size,
          totalPayable: quantity * product.price,
          priceBreakdown,
        },
      ];
      schedulePersistCart();
      return { items: nextItems, cartDirty: true };
    });
  },

  addComboItem: (comboId, product, quantity, cuttingType, pieceSize, unitPrice) => {
    const normalizedCuttingType = normalizeOption(cuttingType, "cutting-type");
    const normalizedPieceSize = normalizeOption(pieceSize, "piece-size");
    set((state) => {
      const size = DEFAULT_SIZE;
      const existingIndex = state.items.findIndex(
        (item) =>
          item.comboId === comboId &&
          item.product.id === product.id &&
          item.cuttingType.id === normalizedCuttingType.id &&
          item.pieceSize.id === normalizedPieceSize.id,
      );

      let nextItems: CartItem[];
      if (existingIndex >= 0) {
        nextItems = [...state.items];
        const existing = nextItems[existingIndex]!;
        const newQty = existing.quantity + quantity;
        nextItems[existingIndex] = { ...existing, quantity: newQty, totalPayable: newQty * unitPrice };
      } else {
        nextItems = [
          ...state.items,
          {
            product,
            quantity,
            cuttingType: normalizedCuttingType,
            pieceSize: normalizedPieceSize,
            size,
            totalPayable: quantity * unitPrice,
            comboId,
          },
        ];
      }
      schedulePersistCart();
      return { items: nextItems, cartDirty: true };
    });
  },

  removeItem: (index) => {
    set((state) => {
      const nextItems = state.items.filter((_, i) => i !== index);
      schedulePersistCart();
      return { items: nextItems, cartDirty: true };
    });
  },

  removeComboGroup: (comboId) => {
    set((state) => {
      const nextItems = state.items.filter((it) => it.comboId !== comboId);
      schedulePersistCart();
      return { items: nextItems, cartDirty: true };
    });
  },

  updateQuantity: (index, quantity) => {
    if (quantity <= 0) {
      get().removeItem(index);
      return;
    }

    const item = get().items[index];
    if (!item) return;

    const otherItemsQty = get().items
      .filter((it, i) => it.product.id === item.product.id && i !== index)
      .reduce((sum, it) => sum + it.quantity, 0);

    if (item.product.stock !== undefined && otherItemsQty + quantity > item.product.stock) {
      toast.error(`Limit reached: Only ${item.product.stock} units available`);
      return;
    }

    set((state) => {
      const nextItems = state.items.map((it, i) =>
        i === index
          ? { ...it, quantity, totalPayable: quantity * it.product.price }
          : it
      );
      schedulePersistCart();
      return { items: nextItems, cartDirty: true };
    });
  },

  checkAndIncrement: async (index, step = 0.5) => {
    const item = get().items[index];
    if (!item) return { ok: false, message: "Item not found" };

    try {
      const { data } = await axiosInstance.get(
        `/product/api/stock/${item.product.id}`,
      );

      const freshStock: number = data.stock ?? 0;
      const freshStatus: string = data.status ?? "Active";

      // Update the stock value stored in the cart item so the UI reflects it
      set((state) => ({
        items: state.items.map((it, i) =>
          i === index
            ? { ...it, product: { ...it.product, stock: freshStock, status: freshStatus as "Active" | "NonActive" } }
            : it,
        ),
      }));

      if (freshStatus !== "Active" || freshStock === 0) {
        const msg = freshStock === 0 ? "This product is out of stock" : "This product is no longer available";
        toast.error(msg);
        return { ok: false, message: msg };
      }

      // Total qty across all cart lines for this product after the increment
      const otherQty = get().items
        .filter((it, i) => it.product.id === item.product.id && i !== index)
        .reduce((s, it) => s + it.quantity, 0);
      const newQty = item.quantity + step;

      if (otherQty + newQty > freshStock) {
        const available = Math.max(0, freshStock - otherQty);
        const msg = available <= 0
          ? "No more stock available"
          : `Only ${available} kg available`;
        toast.error(msg);
        return { ok: false, message: msg };
      }

      get().updateQuantity(index, newQty);
      return { ok: true };
    } catch {
      // Network error — fall back to local check so UX doesn't break
      const item = get().items[index];
      if (!item) return { ok: false, message: "Item not found" };
      const otherQty = get().items
        .filter((it, i) => it.product.id === item.product.id && i !== index)
        .reduce((s, it) => s + it.quantity, 0);
      const newQty = item.quantity + step;
      if (item.product.stock !== undefined && otherQty + newQty > item.product.stock) {
        toast.error(`Only ${item.product.stock} units available`);
        return { ok: false, message: "Stock limit reached" };
      }
      get().updateQuantity(index, newQty);
      return { ok: true };
    }
  },

  quickAdd: (product) => {
    const state = get();
    const currentQty = state.getProductQty(product.id);

    if (product.stock !== undefined && currentQty + 0.5 > product.stock) {
      toast.error(`Limit reached: ${product.stock} units available`);
      return;
    }

    const existingIndex = state.items.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingIndex >= 0) {
      // Use live stock check for existing items
      state.checkAndIncrement(existingIndex, 0.5);
    } else {
      const firstSize = product.sizes?.[0] || product.weight || "unit";
      const firstCutting = product.cuttingTypes?.[0] || "default";
      const firstPieceSize = product.pieceSizes?.[0] || "default";
      state.addItem(product, 0.5, firstCutting, firstPieceSize, firstSize);
    }
  },

  quickRemove: (productId) => {
    const state = get();
    const existingIndex = state.items.findIndex(
      (item) => item.product.id === productId
    );
    if (existingIndex >= 0) {
      const current = state.items[existingIndex].quantity;
      if (current <= 0.5) {
        state.removeItem(existingIndex);
      } else {
        state.updateQuantity(existingIndex, current - 0.5);
      }
    }
  },

  getProductQty: (productId) => {
    return get().items
      .filter((item) => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  },

  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  totalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.totalPayable, 0);
  },

  clearCart: () => {
    // A queued persist would re-upload the cart we're about to clear.
    cancelPendingPersist();
    // Mark the server-side cart as converted (order placed)
    void clearServerCart();
    set({
      items: [],
      cartStoreId: null,
      cartDirty: false,
      deliveryMetadata: { ...DEFAULT_DELIVERY_METADATA },
    });
  },

  resetLocalCart: () => {
    // Logout. The server copy is deliberately left alone so the account's
    // cart is still there at the next sign-in, here or on another device —
    // clearing it here is what made cross-device restore single-session.
    cancelPendingPersist();
    set({
      items: [],
      cartStoreId: null,
      cartDirty: false,
      syncedUserId: null,
      deliveryMetadata: { ...DEFAULT_DELIVERY_METADATA },
    });
  },

  persistCart: async () => {
    const revision = _cartRevision;

    // syncItems answers null when no POST happened at all — no pincode yet, or
    // the request failed. Staying dirty makes the next load push this copy up
    // instead of pulling the server's older one down over it.
    //
    // validate-cart requires >= 1 item, so an emptied cart can only be
    // expressed through the clear endpoint. Skipping that is what left the
    // last non-empty snapshot on the server to be restored on refresh.
    const written =
      get().items.length === 0
        ? await clearServerCart()
        : Boolean(await get().syncItems());

    if (written && _cartRevision === revision) set({ cartDirty: false });
  },

  loadServerCart: async (userId: string) => {
    const firstReconcile = get().syncedUserId !== userId;

    // Something changed here and hasn't landed yet, so this device holds the
    // newer copy — including a cart just emptied, whose write never had an
    // endpoint to go to before. Push it up rather than pulling an older one
    // down. cartDirty is persisted, so this still holds after a refresh that
    // killed the debounce timer before it could fire.
    //
    // Only once this device has reconciled with the account, though. Before
    // that the pending change belongs to a signed-out session, and treating
    // it as authoritative would push a guest cart over the account's saved
    // one — or, if the guest had emptied theirs, clear the account's outright.
    if (!firstReconcile && get().cartDirty) {
      cancelPendingPersist();
      await get().persistCart();
      return;
    }

    try {
      const { data } = await axiosInstance.get("/product/api/cart");
      if (!data?.success) return;
      const lines: ServerCartLine[] = Array.isArray(data.items) ? data.items : [];

      // Lines are stored as identities only — no price, title or image. Build
      // placeholder products here and let syncItems() below fill them in from
      // validate-cart, which is the single source of pricing. A restored cart
      // therefore never shows a price the checkout wouldn't honour.
      const restored: CartItem[] = lines
        .filter((line) => typeof line?.productId === "string" && line.productId)
        .map((line) => ({
          product: placeholderProduct(line.productId, data.storeId ?? null),
          quantity: typeof line.quantity === "number" && line.quantity > 0 ? line.quantity : 1,
          cuttingType: normalizeOption(line.cuttingType ?? DEFAULT_CUTTING, "cutting-type"),
          pieceSize: normalizeOption(line.pieceSize ?? DEFAULT_PIECE_SIZE, "piece-size"),
          size: line.size ?? DEFAULT_SIZE,
          totalPayable: 0,
          isPlaceholder: true,
          ...(line.comboId ? { comboId: line.comboId } : {}),
        }));

      if (firstReconcile) {
        // First reconcile with this account in this browser. A cart may have
        // been built here before signing in, so a union is the only safe
        // answer: nothing local may be dropped. From here on this device's
        // cart is a copy of the account's, which is what lets the branch
        // below delete.
        set((state) => ({
          // Local lines win on a signature clash: whatever the customer just
          // did on this device is more current than the stored copy.
          items: restored.length > 0 ? mergeCartItems(state.items, restored) : state.items,
          cartStoreId: data.storeId ?? state.cartStoreId,
          syncedUserId: userId,
        }));
      } else {
        // Replace rather than merge. Nothing is pending locally, so the local
        // cart is exactly what this device last uploaded — anything that
        // differs on the server was written since, by this device before a
        // refresh or by another device, and that includes removed lines.
        // Merging would resurrect them; this is the one place a pull deletes.
        set((state) => {
          const localBySignature = new Map(
            state.items.map((item) => [cartItemSignature(item), item]),
          );

          return {
            // The server list decides which lines exist; local state keeps
            // whatever it already knows about them. Rebuilding a surviving
            // line as a placeholder would flash a skeleton on every load,
            // since localStorage already holds it fully hydrated. Quantity
            // still comes from the server — another device may have changed
            // it, and this branch only runs when nothing is pending here.
            items: restored.map((line) => {
              const local = localBySignature.get(cartItemSignature(line));
              if (!local) return line;
              return {
                ...local,
                quantity: line.quantity,
                totalPayable: local.product.price * line.quantity,
              };
            }),
            cartStoreId: data.storeId ?? state.cartStoreId,
          };
        });
      }

      // Prices, titles, images and stock all arrive here — without it the
      // restored lines stay skeletons. Routing through persistCart rather than
      // syncItems also settles cartDirty, which matters on a first reconcile
      // that just merged a guest cart in and still owes the server a write.
      if (get().items.length > 0) await get().persistCart();
      else set({ cartDirty: false });
    } catch {
      // Non-critical — fall back to whatever is in local storage.
    }
  },

  syncItems: async () => {
    const { items } = get();
    // An empty cart has no representation here — persistCart routes that case
    // to the clear endpoint instead. Returning early keeps the periodic
    // callers (site-header's 60s tick, the sidebar, the cart page) from ever
    // firing a destructive clear of their own.
    if (items.length === 0) return null;

    // Get pincode from address store
    const { selectedLocation, getSelectedAddress } = (await import("./address-store")).useAddressStore.getState();
    const selectedAddress = getSelectedAddress();
    const pincode = selectedLocation?.pincode || selectedAddress?.pincode;
    const city = selectedLocation?.city || selectedAddress?.city;
    const area = selectedLocation?.area || selectedAddress?.area;

    // Nothing to validate against, so no POST — persistCart leaves the cart
    // dirty and retries once an address exists.
    if (!pincode) return null;

    try {
      // Every field here is also what gets persisted as the server-side cart
      // (validateCart writes exactly this array), so the options must be sent
      // on every line, not just combo members — a line restored on another
      // device without its cutting type and size is not the same line.
      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        cuttingType: item.cuttingType?.name,
        pieceSize: item.pieceSize?.name,
        size: item.size,
        // Lets the backend identify combo bundle members and reprice the
        // whole group to the bundle price instead of catalog price.
        ...(item.comboId ? { comboId: item.comboId } : {}),
      }));

      const { data } = await axiosInstance.post("/product/api/validate-cart", {
        cartItems,
        pincode,
        city,
        area,
        storeId: selectedLocation?.storeId || undefined,
      });

      // Recorded even on the unserviceable branch, which still persists the
      // cart and so still moves the version.
      if (typeof data.cartVersion === "number") set({ cartVersion: data.cartVersion });

      if (data.success && data.items) {
        const validatedItems = data.items;
        
        set((state) => ({
          cartStoreId: data.storeId || state.cartStoreId,
          deliveryMetadata: {
            cartDeliveryTime: data.cartDeliveryTime || null,
            isStoreOpen: data.isStoreOpen !== false,
            isInstantAvailable: data.isInstantAvailable === true,
            storeName: data.storeName || data.store?.name || null,
            isServiceable: data.isServiceable !== false,
            nearbyHint: data.nearbyHint || null,
            openingHours: data.openingHours || data.store?.opening_hours || null,
            closingHours: data.closingHours || data.store?.closing_hours || null,
            gstRate: data.gstRate ?? 0,
            packagingCharge: data.packagingCharge ?? 0,
            baseDeliveryCharge: data.baseDeliveryCharge ?? 49,
            freeDeliveryThreshold: data.freeDeliveryThreshold ?? 500,
          },
          items: state.items.map((item) => {
            const fresh = validatedItems.find((p: any) => p.productId === item.product.id);
            if (fresh) {
              return {
                ...item,
                product: {
                  ...item.product,
                  id: fresh.resolvedProductId || item.product.id,
                  storeId: data.storeId || item.product.storeId,
                  stock: fresh.availableQty,
                  price: fresh.price,
                  // Also the hydration path for a cart restored from another
                  // device, whose lines start as empty placeholders.
                  name: fresh.title || item.product.name,
                  slug: fresh.slug || item.product.slug,
                  // Mark as inactive if not in stock or not enough qty
                  status: fresh.inStock ? "Active" : "NonActive",
                  image: fresh.image || item.product.image,
                },
                totalPayable: item.quantity * fresh.price,
                // Hydrated — it can render as a real line now.
                isPlaceholder: false,
              };
            }
            return {
              ...item,
              product: {
                ...item.product,
                status: "NonActive",
                stock: 0,
              },
            };
          }),
        }));

        // Also update coupons/events in coupon-store if data is returned
        if (data.coupons || data.events) {
          const { setAvailableCoupons, setAvailableEvents } = (await import("./coupon-store")).useCouponStore.getState() as any;
          if (data.coupons && setAvailableCoupons) setAvailableCoupons(data.coupons);
          if (data.events && setAvailableEvents) setAvailableEvents(data.events);
        }

      }

      // Returned whenever the POST completed, including an unserviceable
      // `success: false` — validateCart persists the submitted lines either
      // way, so persistCart can stop treating the cart as dirty. Null is
      // reserved for "nothing reached the server".
      return data;
    } catch (error) {
      console.error("Cart sync failed:", error);
      return null;
    }
  },
    }),
    {
      name: "fish-studio-cart",
      // cartDirty and syncedUserId have to outlive the page: a refresh inside
      // the 2s debounce window destroys the pending write, and they are what
      // tell the next loadServerCart that this device's copy is still the
      // newer one rather than something to overwrite from the server.
      partialize: (state) => ({
        items: state.items,
        cartStoreId: state.cartStoreId,
        cartDirty: state.cartDirty,
        syncedUserId: state.syncedUserId,
        deliveryMetadata: state.deliveryMetadata,
      }),
    }
  )
);

/* Belt-and-braces for the debounce window. The persisted cartDirty flag is
   what actually guarantees a change survives a refresh; this just gets it to
   the server as the page goes away instead of on the next load, so another
   device sees it sooner. Axios won't outlive an unload, hence keepalive. */
if (typeof window !== "undefined") {
  const flushCart = () => {
    const { cartDirty, items } = useCartStore.getState();
    if (!cartDirty) return;
    const revision = _cartRevision;
    cancelPendingPersist();

    if (items.length > 0) {
      void useCartStore.getState().persistCart();
      return;
    }

    // The clear is the case that must not be lost — it's the one a normal
    // request can't retry, because an empty cart leaves nothing to re-derive
    // it from. Left dirty on failure so the next load retries.
    fetch(`${frontendEnv.apiUrl}/product/api/cart/clear`, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json", "x-auth-role": "user" },
      body: "{}",
    })
      .then((res) => {
        if (res.ok && _cartRevision === revision) {
          useCartStore.setState({ cartDirty: false });
        }
      })
      .catch(() => {
        // Offline or the page is already gone; the next load retries.
      });
  };

  window.addEventListener("pagehide", flushCart);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushCart();
  });
}

// Legacy compatibility aliases used by some components
export function addToCart(
  product: Product,
  quantity: number,
  cuttingType: CuttingType | string,
  pieceSize: PieceSize | string,
  size: string,
  priceBreakdown?: PriceBreakdown,
) {
  useCartStore.getState().addItem(product, quantity, cuttingType, pieceSize, size, priceBreakdown);
}

export function addComboItemToCart(
  comboId: string,
  product: Product,
  quantity: number,
  cuttingType: CuttingType | string,
  pieceSize: PieceSize | string,
  unitPrice: number,
) {
  useCartStore.getState().addComboItem(comboId, product, quantity, cuttingType, pieceSize, unitPrice);
}

export function removeFromCart(index: number) {
  useCartStore.getState().removeItem(index);
}

export function updateCartQuantity(index: number, quantity: number) {
  useCartStore.getState().updateQuantity(index, quantity);
}

/** Hook for components that just need total items + total price */
export function useCart() {
  const items = useCartStore((s) => s.items);
  // Show number of distinct line items in badge (not fractional qty sum)
  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.totalPayable, 0);
  return { items, totalItems, totalPrice };
}
