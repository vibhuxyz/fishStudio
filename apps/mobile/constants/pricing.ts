// Fallback bill config, used only until /product/api/validate-cart returns
// the resolved store's actual seller-set values (see useDeliverySlotStore).
// Matches order-service's DEFAULT_CART_PRICING so a stale/pre-fetch preview
// never shows a number the backend wouldn't also charge.
export const FREE_DELIVERY_THRESHOLD = 500;
export const BASE_DELIVERY_CHARGE = 49;
export const PACKAGING_CHARGE = 0;
export const GST_RATE = 0; // fraction, e.g. 0.05 for 5%
