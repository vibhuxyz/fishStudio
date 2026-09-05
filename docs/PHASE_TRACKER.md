# Outstanding Issues — Phase Tracker

Working tracker for the program in `docs/ISSUE_STATUS.md`. Updated as each phase lands.
Legend: `[x]` done · `[~]` in progress · `[ ]` not started · `[!]` blocked on someone else

---

## [x] Phase 0 — Verification
- [x] Static audit of all ~20 tracked issues
- [x] Read-only audit of live Neon + Atlas data
- [x] `docs/ISSUE_STATUS.md` written with verified statuses

## [!] Phase 0b — Store configuration (BLOCKED: needs business values)
Two features are fully built but inert because both stores have these unset.
- [ ] `locationCode` per store — unblocks order numbers (0/69 orders have one)
- [ ] `gstin` + `legalName` per store — unblocks every GST invoice download
Set at Master Admin → Sellers → [store]. Values are statutory/permanent; cannot be guessed.

## [x] Phase 2 — Cart sync (#6) + Razorpay confirmation (#7)
- [x] Mobile debounced persist on add / remove / combo-remove / quantity
- [x] Emptying the cart routes to `cart/clear` (validate-cart needs >= 1 line)
- [x] `syncCartOnForeground` — replace-when-clean, push-when-dirty
- [x] AppState listener in the mobile root layout
- [x] Confirmation page: drop both session gates, 401/403 drives the sign-in prompt
- [x] Poll while an online payment is still PENDING (the verify race)
- [x] `tsc --noEmit` clean on mobile and user-ui

## [x] Phase 3 — Delivery slots (#8)
- [x] `DeliverySlotBooking` model + `Order.deliveryDate` + `[storeId, deliveryDate]` index
- [x] Hand-written migration `20260905120000_delivery_slot_capacity` (NOT applied)
- [x] `stores.deliverySlotConfig` in Mongo
- [x] `packages/shared/src/delivery-slots` — config parsing, dated slots, cutoff
- [x] `reserveDeliverySlot` / `releaseDeliverySlot` in order-service utils
- [x] Slot validated against store config at checkout; reserved inside the txn
- [x] Release on customer cancel
- [x] Release on seller reject, seller cancel, admin cancel, stale-order sweep
- [x] Availability in `validate-cart` (dated slots + remaining capacity)
- [x] Web checkout date+slot picker, grouped by day
- [x] Mobile slot sheet date+slot picker
- [x] Seller settings UI — label, window, capacity, cutoff per slot
- [x] Delivery day shown on the order confirmation
- [x] All 11 apps `tsc --noEmit` clean; all 10 packages build

**Not done, deliberately:** the per-slot display maps in the user-ui order-detail
components (`SLOT_LABELS`, `SLOT_WINDOWS`) are still hardcoded to morning/evening. They
render correctly for the default slots; a store that configures a custom key falls back to
"Standard Delivery" there. Making them config-driven touches five components for display
polish and was left out of this pass.

## [x] Phase 1 — Google Maps (#1)
Decision taken: proxy Google through the backend so the key never ships in a client.
- [x] `GOOGLE_MAPS_API_KEY` (server-side) in `packages/env-config`
- [x] Geocoding proxy in auth-service: search / reverse / forward / nearby
- [x] Behind `isAuthenticated` + a fail-open `geocodingRateLimiter` (60 per 10 min)
- [x] 24h Redis cache per query — these calls are billed per request
- [x] Mobile `googleMapsProvider` against the existing `GeocodingProvider` interface
- [x] `EXPO_PUBLIC_MAP_PROVIDER` switch, defaulting to OSM
- [x] `stores.latitude` / `longitude` (+ both-or-neither validation)
- [x] Env vars documented in `.env` and `env.prod.example`
- [ ] **You:** create two keys, restrict, and fill them in (see below)
- [ ] Web: flip `NEXT_PUBLIC_MAP_PROVIDER=google` once its key is in

### Two keys, not one
A Google Maps key carries exactly one restriction type, and the web and server paths need
different ones:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — browser JS SDK. Restrict by **HTTP referrer**.
- `GOOGLE_MAPS_API_KEY` — the server proxy. Restrict by **IP** (the droplet).

Restrict each to Maps JavaScript, Places and Geocoding only, and set a billing budget alert.
The key shared in chat should be treated as disclosed and rotated.

### Open question before flipping mobile to google
Google Maps Platform terms restrict displaying Google Maps *content* (geocoding and Places
results) on a non-Google map. The mobile picker renders **Leaflet with OSM tiles** in a
WebView, so routing its geocoding through Google is worth checking against your terms before
switching `EXPO_PUBLIC_MAP_PROVIDER` to `google` in production. The compliant options are to
render a Google map on mobile (react-native-maps + Google provider, which needs a dev build
and an app-restricted key) or to leave mobile on OSM/Nominatim. The proxy works either way —
this is a licensing call, not a technical one. **Web is unaffected**: it already renders a
real Google map when the provider is switched.

## [x] Phase 4 — Rider assignment (DP-1, SP-3)
- [x] Eligibility on `activeDeliveryCount < maxConcurrentDeliveries`, not `riderStatus`
- [x] `stores.maxConcurrentDeliveries` (+ seller settings field, default 3)
- [x] Eligible riders sorted least-loaded first, so work spreads by default
- [x] `releaseRiderIfNoOtherDeliveries` verified — already only frees at zero
- [x] Single assign: capacity claimed with a conditional `updateMany`, not a read-then-write
- [x] Cross-DB compensation — a failed order write hands the claimed capacity back
- [x] `POST /order/api/bulk-assign-rider`, partial success reported per order
- [x] Multi-select + dispatch bar in the staff order list
- [x] All 11 apps typecheck clean

**Note on the two riders that looked stuck:** they were not. Each had exactly one open
`SHIPPED` order against `activeDeliveryCount: 1` — correct under the old single-delivery
rule, which is precisely why neither was assignable. With the default of 3 they now are.

**Race note:** the rider counter lives in Mongo and the order in Postgres, so the two
writes cannot share a transaction. Both assign paths claim capacity first with a
conditional write and compensate if the order write then fails — capacity can briefly be
held for an order that does not exist, never the reverse. Handing out a place twice would
be the damaging direction.

## [x] Phase 5 — COD ledger, attendance, rider stats
- [x] `CodCollection` + `CodSettlement` + `StaffAttendance` + `Order.deliveryDistanceKm`
- [x] Migration `20260905160000_cod_reconciliation_and_attendance` (NOT applied)
- [x] `packages/shared/src/geo` — Haversine + the 50m geofence constant
- [x] COD rows written on every delivery path, idempotent via a unique index on orderId
- [x] Settle in one transaction, re-reading `settlementId: null` inside it
- [x] `COD_SETTLED` written to the append-only `AuditLog`
- [x] Check-in: selfie + GPS, distance computed server-side against the store's own pin
- [x] Manager COD screen (`/staff/cod`) and attendance roster (`/staff/attendance`)
- [x] Rider shift screen (`/staff/rider/shift`) — check in/out + the day's numbers
- [x] Store map pin in seller settings, with "use my current location"
- [x] All 11 apps typecheck clean

**Earnings is intentionally `null`, not `0`.** No payout rule exists anywhere in this
system — no per-delivery rate, no distance slabs, no incentives. The endpoint returns
`earnings: null` plus a reason, and the rider screen says "no payout rate has been set up".
An invented number about someone's pay is worse than no number. Define the rule and this
becomes a small addition.

**Km is straight-line, not routed.** Store pin to delivery pin, stamped once at delivery.
Routing would be more accurate and costs a billed Google request per delivery. Any payout
rule built on this must be calibrated to straight-line distance.

**Partial settlement is the default.** A manager ticks the specific orders whose cash they
actually hold; the rest stay outstanding. Settling the whole balance in one action would
quietly write off cash that never arrived.

**Out-of-range check-ins are recorded, then rejected.** "The rider tried to check in from
4km away" is the signal a manager needs; discarding it would leave no trace of the attempt.

## [x] Phase 7 — Follow-ups
- [x] **Fourth** delivery path found and fixed: `updateAdminOrderStatus` could mark an
      order DELIVERED without recording COD or distance. My earlier "all three paths"
      claim was wrong — there are four, and the admin one was missed
- [x] `site_config.mapProvider` — admin toggles OSM/Google for web and app, no redeploy
- [x] Both clients resolve the provider at runtime; `geocodingProvider` delegates, so no
      call site changed
- [x] Mobile picker gained a Google Maps view, so tiles follow the geocoding backend
- [x] `stores.attendanceGeofenceMeters` — per-store radius, floor 20m
- [x] Attendance dashboard reports median / p90 / max accepted distance + rejection count,
      and warns when p90 exceeds 80% of the limit
- [x] All 11 apps typecheck clean

**Why the map provider is config, not an env var.** Google Maps bills per request and a key
can be revoked or a billing account can lapse. When that happens the fix has to be one
toggle away — on mobile, an env var would mean waiting for an app-store release. OSM needs
no key and is always the fallback. A client with no Google key stays on OSM regardless of
the setting, rather than rendering an empty map.

**Why the mobile picker now has a Google map.** Google Maps Platform terms do not allow
displaying Google geocoding/Places results on a non-Google map. Making the backend
switchable therefore meant making the tiles switch with it, or the toggle would produce a
combination the terms disallow. The key is loaded into a WebView given an explicit
`baseUrl`, so an HTTP-referrer restriction has something to match against.

**Why the geofence radius is per store.** The right value is a property of the site, not of
the platform: a standalone unit with the pin on its door is not a stall inside a market
building where GPS bounces off the structure. The floor is 20m because consumer GPS is
routinely 10–30m out, and a fence that rejects honest check-ins gets worked around.

**Set it from the data, not from a guess.** The dashboard now shows what the fence is
actually doing over the selected range. The number that matters is the p90 of *accepted*
check-ins: if it is pressed against the limit, the limit is measuring GPS error rather than
distance, and honest riders are being turned away.

## [x] Phase 6 — Panel gaps
- [x] Admin order list: multi-select status + slot chips + date range (MAP-7)
- [x] Admin order list: checkboxes + bulk forward-status bar (MAP-6)
- [x] Reused `parseSellerOrderFilters` and the existing bulk handler rather than
      writing a second copy of the workflow-rank and side-effect logic
- [x] `products.sortOrder` + `isFeatured` + `[storeId, isFeatured, sortOrder]` index (MAP-3)
- [x] Mirrored into `toMeiliDoc`, `sortableAttributes` and `filterableAttributes`
- [x] Admin rank input + featured star on the product list
- [x] `sizeAvailability` on storefront responses; sold-out sizes disabled on web and mobile (MAP-4)
- [x] All 11 apps typecheck clean

**Bug found and fixed while here:** `bulkUpdateOrderStatus` could move orders to DELIVERED
without recording the COD collected on them or the distance ridden — the Phase 5 hooks were
only on the two single-order paths. Marking fifty orders delivered in one action was a way
for cash to escape reconciliation entirely. Now hooked on all three.

**Meilisearch needs a reindex after deploying**, because `sortOrder`/`isFeatured` are new
document fields and `initMeilisearchIndex` has new sortable/filterable attributes. Existing
documents carry neither until they are rewritten. Every reindex path uses `include` rather
than `select`, so the fields flow through automatically once the products are re-pushed.

**Unranked products sort with a sentinel, not null.** Meilisearch orders null unpredictably
against numbers, and Mongo sorts null *first* on ascending — which would put every unranked
product ahead of every ranked one, exactly backwards. Meili documents get `999_999`, and the
Mongo sort leads with `isFeatured: desc` so `sortOrder` only orders within the featured set.

---

## Decisions taken without asking
Recorded here so they can be reversed deliberately rather than discovered later.

- **Slot capacity default 50/slot/day.** A placeholder, tunable per store. Chosen generous
  rather than tight: too high only reproduces today's uncapped behaviour, too low turns
  customers away silently.
- **`deliverySlot` relaxed from a zod enum to a slug pattern.** Stores configure their own
  slots, so the valid set is per-store data; the value is checked against that store's real
  config in order-service, which is the only place that knows it.
- **Slot release is best-effort.** It must never be the reason a cancellation fails. A leaked
  place costs one delivery of headroom for one day; a throwing cancel strands a customer.
- **Zero-stock sizes are disabled, not hidden.** A size that silently disappears makes the
  product look broken and throws away the demand signal. A size with no `sizeStock` entry is
  treated as sold out rather than unlimited — the safe direction once a seller has opted
  into per-size tracking.
- **Featuring is admin-only, not seller-settable.** A seller able to feature their own
  products turns a curated rail into a race.
- **Geofence is 50m and check-out has none.** Phone GPS is routinely 10-30m out, so a
  tighter fence would reject honest check-ins and get worked around. A rider ending their
  last delivery is by definition not at the store, so requiring a return trip to close a
  shift would only teach them to check out early.
- **A store with no map pin cannot accept check-ins at all.** Recording an unverified
  check-in as if it had passed a geofence would make the whole record untrustworthy.
- **Default `maxConcurrentDeliveries` is 3, not 1.** One was the old behaviour, and
  batching nearby drops is the point of the change. A store wanting the old rule sets 1.
- **The geocoding proxy sits behind `isAuthenticated`.** An open proxy to a billed API is
  somebody else's free geocoding service. Address entry already happens signed in.
- **The geocoding rate limiter fails open**, unlike the auth limiters. Redis being down
  should degrade rate limiting, not take address entry offline.
- **Foreground cart pull replaces rather than merges, but only when clean.** Merging every
  time would resurrect just-deleted lines — the hazard the original once-per-session guard
  was there to avoid.
