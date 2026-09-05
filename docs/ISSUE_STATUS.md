# Issue Tracker — Verified Status

Audited 2026-09-05 against the code and against the live Neon/Atlas data (read-only).
Supersedes the status labels in the shared tracking document, several of which were stale.

**Headline:** two "still broken" issues are not code defects at all — they are unset store
configuration. Everything needed to make them work is already deployed.

---

## Blocked on store configuration, not code

Both stores (`FishWallah`/ccu and `Fishstudio`/Kolkata) have `locationCode`, `gstin` and
`legalName` all `NULL`. That single gap explains two long-running issues:

| Issue | Symptom | Cause |
|---|---|---|
| MAP-8 sequential order IDs | 0 of 69 orders have an `orderNumber` | `allocateOrderNumber` returns `null` when `locationCode` is unset (`order/utils.ts:144`) |
| #4 GST invoice | Every download fails with "store is not set up for tax invoices yet" | Guard requires `legalName` **and** `gstin` **and** `locationCode` (`invoice.controller.ts:149`) |

**Action:** set these per store in Master Admin → Sellers → [store]
(`admin-ui/.../dashboard/sellers/[id]/page.tsx:368`). Needs real business values:

- `locationCode` — a short code per store; it is baked into every printed order number, so
  pick deliberately and do not change it later. Two stores must not share a code, or they
  share one daily counter.
- `gstin`, `legalName` — statutory values; must match the GST registration exactly.

Existing orders stay `NULL` (both columns are nullable by design). Numbering starts from the
next order placed.

---

## Verified already shipped — close these

| Issue | Evidence |
|---|---|
| #2 Sticky checkout sidebar | `sticky top-24 max-h-[calc(100vh-7rem)]` — `user-ui/components/checkout/checkout-client.tsx:778` |
| #3 Failed-payment handling | `PUT /order/api/request-cod/:orderId` — `order.route.ts:65`; `PaymentStatus.NOT_PAID` distinguishes "never attempted" from a real decline |
| #5 Session 30 days | `REFRESH_TTL_BY_ROLE.user = "30d"` + matching cookie max-age, rotation, Redis revocation family — `auth-service/src/utils/roleCookies.ts:17` |
| MAP-1 Master-admin coupons | Admin may edit/delete any seller's coupon; `isActive` + `toggleCouponStatus` exist — `coupon.controller.ts:141` |
| MAP-2 Localhost links | `resolveUserUiUrl()` falls back to the prod origin outside dev — `admin-ui/src/config/env.ts:1` |
| MAP-5 Order auto-accept | `shouldAutoAcceptOnCreate()`, per-store `codAutoAcceptLimit` (default ₹3000) — `order/utils.ts:88` |
| MAP-9 Timezone | All columns `@db.Timestamptz(3)`; IST rendering via `packages/shared/src/datetime` |
| MAP-9 Category image | The cache race is fixed — `invalidateSiteConfigCache()` is awaited after every write |

---

## Partly shipped

**#1 Google Maps.** Web is complete: a pluggable `GeocodingProvider` with **both** Google and
OSM implementations plus a pin-drop picker (`user-ui/lib/geocoding-provider.ts`). It is
switched off — `NEXT_PUBLIC_MAP_PROVIDER` defaults to `osm` and the key is blank. Mobile has
only the OSM/Nominatim provider and renders Leaflet in a WebView; the Google provider is not
written. Mongo `stores` has no lat/lng at all.

**#6 Cart sync — FIXED 2026-09-05.** The gap was one-sided: web persisted on every mutation via
a 2s debounce, mobile never did — its mutations didn't call `validate-cart`, the only server write
path. A mobile cart reached the account only if the cart tab happened to be opened, and restore ran
at login only, so a change made on the web never reached an already-signed-in phone.

Now: mobile debounces the same persist on add/remove/combo-remove/quantity (including emptying,
which routes to `cart/clear` since `validate-cart` requires at least one line), and
`syncCartOnForeground` reconciles on app foreground. That pull *replaces* rather than merges, but
only when nothing local is pending — a dirty local cart is pushed up instead. Merging on every
foreground would have resurrected lines the user had just deleted, which is the hazard the original
once-per-session guard existed to avoid.

**Still open:** neither platform persists a cart until the customer has chosen a location.
`validate-cart` needs a pincode to resolve a store, and it is deliberately the single write path
(see `cart.controller.ts:87`). Closing that gap means a dedicated cart-write endpoint, which is a
decision against an existing documented one — flagged, not taken.

**#7 Razorpay confirmation — FIXED 2026-09-05.** There were two independent gates, and no server
prefetch despite the prop suggesting one (`initialOrder` was hardcoded `null`). The page blocked
on `useUserSession().isLoading`, and the order query was additionally gated `enabled: !!user`. A
session read that was slow, or whose cookie didn't survive the gateway hop, therefore showed
**"Sign in to view this order"** to someone who had just paid.

`get-order` is already behind `isAuthenticated`, so the client gate duplicated a check the server
owns. Now the fetch fires on `orderId` alone and the sign-in prompt appears only on a real 401/403.
The verify race is handled by polling every 3s while an online payment is still `PENDING`, so a
paid order stops rendering as unpaid.

**MAP-6 / MAP-7 Bulk status + multi-filter.** Complete in **seller-ui** (checkboxes,
`BulkStatusBar`, combined status/slot/date filter). **Absent in admin-ui**, which has only a
text search and a pincode dropdown.

---

## Genuinely open

| Issue | Note |
|---|---|
| #8 Delivery slots | `deliverySlot` is a free-text string with no date, capacity or cutoff; `validateCart` returns a hardcoded array |
| MAP-3 Product sorting / featured | No `isFeatured`/`sortOrder` anywhere. Adding one must be mirrored into every Meilisearch reindex path or search silently diverges |
| MAP-4 Zero-stock variants | Currently shown-but-sorted-last by deliberate design. Changing to hidden/disabled is a one-flag change — needs a UX decision |
| DP-1 Rider multi-assign | `activeDeliveryCount` is already an `Int` for exactly this. Both riders sit at `DELIVERING` with 1 open order each, so **neither is assignable right now** — that is the reported symptom |
| SP-3 Bulk rider assign | No bulk endpoint; model on `bulk-status.controller.ts` |
| SP-1 COD reconciliation | No collection/settlement tables exist |
| SP-2 / DP-3 Attendance | Nothing exists. The 50m geofence needs store lat/lng, which also does not exist |
| DP-2 Rider daily stats | Orders + COD are derivable once SP-1 lands. **Earnings needs a payout formula that does not exist**; km needs distance capture |

---

## Not a defect

Rider counters are consistent, not leaked: each of the two riders has exactly one open
`SHIPPED` order and `activeDeliveryCount = 1`. 16 orders have been rider-assigned historically
and every terminal one released correctly.
