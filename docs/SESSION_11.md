# SESSION_11: Code Style & Structure Audit — apps/user-ui

Scope: `apps/user-ui/` in full — every file under `app/`, `components/`, `hooks/`, `lib/`, `utils/`, `store/`, `context/`, `styles/`, plus root config (`next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `components.json`, `package.json`). ~175 source files read individually. `components/ui/*` (shadcn primitives, ~40 files) explicitly excluded from review at user's request.

Zod scope: `@repo/zod-schema` is a real dependency (`"@repo/zod-schema": "workspace:*"`). Grepped every import — only `Product` and `BackendProduct` (plain TS interfaces from `packages/zod-schema/src/types/backend-product.ts`) are ever imported; no actual `z.object()` schema from the package is used anywhere in user-ui. Reviewed accordingly.

# Executive Summary

- **Three separate routes each carry a dead, parallel implementation of themselves.** Home, Search, and Category pages were each rebuilt at some point into a streaming/split-component architecture, but the old monolithic version was never deleted:
  - Home: `app/home-page-client.tsx` (155 lines) + `app/_components/product-showcase.tsx`/`product-sections-client.tsx` are both fully unreferenced; the live path is `app/page.tsx` → `app/_components/home-activity-sections.tsx`.
  - Search: `app/search/search-page-client.tsx` (250 lines) and `app/search/_components/search-results-stream.tsx` are unreferenced; the live path is `app/search/page.tsx` → `search-data-stream.tsx` → `search-shell.tsx`.
  - Category: `app/category/[slug]/category-client.tsx` (433 lines) is unreferenced; the live path is `page.tsx` → `category-data-stream.tsx` → `category-shell.tsx`.
  This is the single largest maintainability problem in the codebase — ~840 lines of dead, confusing, near-duplicate route logic that any new engineer will read, half-trust, and possibly edit by mistake.
- **The order-tracking page fabricates a live GPS delivery simulation.** `app/orders/[orderId]/page.tsx` (1,865 lines — by far the largest file in the app) renders an animated SVG map with a scooter icon whose position is computed from a deterministic client-side "traffic easing curve" plus a scripted `MISHAP_SCHEDULE` (fake wrong turns, fake traffic jams, fake signal waits), all derived from `Date.now() - order.updatedAt`. There is no real rider location anywhere in the payload. It is presented to the customer as "Live Delivery" tracking. This is shipped as genuine functionality, not a stub.
- **That same file duplicates the app's WebSocket connection twice more.** `context/ws-context.tsx` exists specifically to be the *one* shared WS connection for the whole session (its own header comment explains this was a deliberate fix for 3 duplicate connections). `app/orders/[orderId]/page.tsx` and `app/order-confirmation/[orderId]/_components/order-confirmation-detail.tsx` both ignore it and open their own raw `new WebSocket(...)` with hand-rolled reconnect/backoff — reintroducing the exact problem `ws-context.tsx` was built to solve.
- **Cart UI logic is duplicated wholesale between two 600–800 line files.** `components/shared/cart-page-client.tsx` and `components/shared/cart-sidebar.tsx` independently reimplement identical subtotal/delivery/discount/tip/donation calculation, coupon apply/remove handlers, and the pincode→store resolution effect. A pricing rule change requires editing both and will drift.
- **`axiosInstance` is imported through two different paths** — `@/utils/axiosInstance` directly (7 files) vs. `@/lib/utils` which re-exports it (7 files) — for the exact same singleton, with no functional difference. `lib/utils.ts` is shadcn's canonical `cn()` file; the `axiosInstance` re-export was grafted onto it and is why the split happened.
- **Two top-level folders exist to hold exactly one dead file each.** `store/index.ts` is a 2-line unused stub (`import { create } from "zustand"` and nothing else) while all real stores live in `lib/*-store.ts`. `styles/globals.css` (94 lines) is an unused duplicate of the real, wired-up `app/globals.css` (73 lines).
- **AI-editing-narration comments are present verbatim in shipped code**, in direct violation of this repo's own CLAUDE.md ("never narrate your own editing process"): `// ✅ ADD THIS LINE to bypass ngrok warning page` (`utils/axiosInstance.ts`), `// ✅ Add prop`, `// ✅ Default false`, `// ✅ Pass it down` (`components/shared/product-carousel-section.tsx` — itself dead code), `{/* ✅ LOADING STATE */}`, `{/* ✅ DATA STATE */}`, `{/* ✅ VIEW ALL CARD */}` (`components/shared/product-carousel.tsx`).
- **Brand color hardcoded as a magic hex value in 13 files** (`app/refer/page.tsx`, `app/wallet/page.tsx`, `app/faqs/page.tsx`, `app/_components/categories-section.tsx`, and others) via `text-[#5A2C96]` / `bg-[#5A2C96]`, instead of the `primary` design token already defined in `tailwind.config.ts`/`app/globals.css` (`hsl(259 75% 55%)`, the same color) and used correctly everywhere else (`site-header.tsx`, `bottom-nav.tsx`, etc. use `text-primary`/`bg-primary`).
- **6 more dead/unused files** beyond the three route duplicates above: `hooks/useWeightBasedPrice.ts` (306 lines, duplicate pricing math never imported), `lib/product-adapter.ts`, `utils/product-utils.ts`, `utils/AI.enhancements.ts`, `utils/cities.tsx`, `utils/convertToBase64.ts`, `components/sections/hero-section.tsx`, `components/shared/product-detail-skeleton.tsx` — see Dead Code.
- **Positives worth keeping**: `lib/storefront.ts` (price resolution/normalization) is clean, well-commented, and correctly the single source of truth for pricing math. `next.config.mjs` has a genuinely thoughtful, well-explained CSP and security-header set (including a COOP exception specifically reasoned through for the Razorpay popup flow). `context/ws-context.tsx` (when actually used) is a well-designed single-connection pattern with clear "why" comments. `product-detail-client.tsx` sanitizes HTML via `DOMPurify` before `dangerouslySetInnerHTML`. Zustand stores (`cart-store`, `address-store`, `coupon-store`) are consistently structured and use `persist` + `partialize` correctly.

# File Reviews

Ratings reflect the file as read, not the concept. Full list of ~175 files was read; table covers the files that most shape the audit's conclusions.

| File | Lines | Quality | Notes |
|---|---|---|---|
| `app/orders/[orderId]/page.tsx` | 1865 | ⭐⭐☆☆☆ | Largest file in the app by 4x. Fabricated live-tracking simulation + its own WebSocket + step-tracker animation + quote rotator + SVG route math, all in one route file. Impressively engineered, badly placed, deceptive to the end user. |
| `components/shared/address-modal.tsx` | 800 | ⭐⭐⭐☆☆ | Coherent but large; mixes pincode lookup, city selection, and full add-address form in one component. "Edit" pencil button (line ~782) has no `onClick` — dead affordance. |
| `components/layout/site-header.tsx` | 848 | ⭐⭐⭐☆☆ | Well-organized internally (clear section comments, `SearchInput`/`SearchPanel` correctly hoisted outside the component to avoid remount-on-keystroke), but still a god-file mixing search, address selector, category dropdown, and cart button. |
| `components/shared/cart-sidebar.tsx` | 789 | ⭐⭐☆☆☆ | ~90% identical business logic to `cart-page-client.tsx` (below), copy-pasted rather than shared. |
| `components/shared/cart-page-client.tsx` | 633 | ⭐⭐☆☆☆ | Same duplication as above, other direction. |
| `components/checkout/checkout-client.tsx` | 645 | ⭐⭐⭐☆☆ | Business logic (Razorpay lifecycle, order payload assembly) and presentation both live here; well-commented on the tricky bits (payment rollback race conditions) but should be split. |
| `app/order-confirmation/[orderId]/_components/order-confirmation-detail.tsx` | 562 | ⭐⭐⭐☆☆ | Clean UI; duplicates the raw WebSocket connection instead of using `useWs()`. Builds a full invoice HTML string inline for print — functional but a good candidate to extract. |
| `components/layout/category-menu.tsx` | 481 | ⭐⭐⭐☆☆ | 3 rendering variants (horizontal/mega/dropdown) in one component; hardcoded `categoryTheme`/`categoryIcons` maps keyed by literal category name strings — silently falls back to a gray theme if a backend category is renamed. |
| `app/category/[slug]/category-client.tsx` | 433 | — | **Dead.** Superseded by `category-shell.tsx` + 3 sub-components; unreferenced anywhere. |
| `app/search/search-page-client.tsx` | 250 | — | **Dead.** Superseded by `search-shell.tsx`; unreferenced anywhere. |
| `hooks/useWeightBasedPrice.ts` | 306 | — | **Dead.** Unreferenced; reimplements pricing math that `lib/storefront.ts` already owns, with a different (incompatible) shape. |
| `app/home-page-client.tsx` | 155 | — | **Dead.** Full alternate homepage incl. its own `SectionErrorBoundary` class; unreferenced anywhere. |
| `lib/storefront.ts` | 537 | ⭐⭐⭐⭐☆ | Best file in the app. Single source of truth for `Product` transformation and price resolution, consistent comment density explaining *why*, not *what*. |
| `next.config.mjs` | 111 | ⭐⭐⭐⭐⭐ | Thorough CSP, security headers, and a well-reasoned COOP exception for the Razorpay popup flow. |
| `store/index.ts` | 2 | — | **Dead.** Imports `create`/`persist` and exports nothing. |

# Zod Schema Review

- Only `Product` and `BackendProduct` (from `packages/zod-schema/src/types/backend-product.ts`) are imported anywhere in user-ui, via 13 files (`lib/storefront.ts`, `lib/cart-store.ts`, `lib/activity.ts`, `lib/product-adapter.ts`, `hooks/useWeightBasedPrice.ts`, and several components/pages).
- **These are plain hand-written TypeScript `interface`s, not zod schemas.** The package is named `@repo/zod-schema` and its `src/index.ts` root export exists specifically to expose `z.infer<>` types alongside a `validate()` helper — but `types/backend-product.ts` sits alongside the schema-derived types with zero runtime validation backing it. User-ui calls `fetchStorefrontProductListing`/`fetchStorefrontProductBySlug` (`lib/storefront.ts`) and trusts the JSON response is shaped like `BackendProduct` purely at the type level; a backend response shape drift would fail silently (`undefined` fields) rather than throw.
- `transformProduct()` (`lib/storefront.ts:259`) does its own manual coalescing (`bp.sale_price ?? 0`, `Array.isArray(bp.images) ? ... : []`) as a substitute for real validation — reasonable defensive coding, but it's compensating for the missing schema rather than using one.
- Package boundary is otherwise respected: user-ui does not deep-import from `packages/zod-schema/src/schemas/*` or `dashboard.ts` (admin/seller-only types), and does not reach past the package's public `index.ts`/`types`/`schemas` export map declared in `package.json`.
- `packages/zod-schema/README.md` is still the unedited `bun init` boilerplate ("To install dependencies... This project was created using `bun init`") — never updated to describe the package's actual purpose.
- No duplicate validation logic found inside the reviewed slice (the manual coalescing above is defensive normalization, not competing validation).

# Folder Structure

```
app/            Next.js App Router — pages, route-local _components/, loading.tsx per route (consistent, good)
components/
  checkout/     2 files
  layout/       8 files
  providers/    4 files
  sections/     5 files (1 dead: hero-section.tsx)
  shared/       ~20 files (2 dead, 2 near-duplicate pairs)
  ui/           ~40 shadcn primitives (excluded from this review)
hooks/          10 hooks (1 dead: useWeightBasedPrice.ts)
lib/            11 files — zustand stores + storefront/business logic (1 dead: product-adapter.ts)
utils/          12 files — mixed axios/formatting/constants (4 dead)
store/          1 file, dead
context/        1 file, live and well-designed
styles/         1 file, dead
```

- `store/` and `styles/` are single-file folders that hold nothing but dead code — see Dead Code. Either delete both folders or, if `store/` was meant to house the zustand stores, actually move `lib/*-store.ts` into it (pick one convention).
- Route-local `_components/` (Next.js private-folder convention) is used consistently across `product/[slug]/`, `category/[slug]/`, `search/`, `orders/`, `order-confirmation/[orderId]/` — this part of the structure is good and should be the model going forward.
- `app/_components/` (home-page-only helpers) duplicates responsibility with `components/sections/` — `OfferCarousel`/`ProductCarouselSection` are cross-imported between the two rather than `app/_components/` being purely home-specific glue. Minor, but the line between "shared section" and "home-only component" is blurry.

# Naming

- `utils/categories.tsx` and `utils/cities.tsx` contain zero JSX — should be `.ts`, not `.tsx`.
- `utils/AI.enhancements.ts` — dotted, capitalized filename is an outlier against every other file in `utils/` (kebab-case: `cloudinary-loader.ts`, `convertToBase64.ts`, `axiosInstance.ts` mix camelCase/kebab already). It's also dead code (see below).
- `components/layout/NotificationBell.tsx` is the only PascalCase filename in `components/layout/` — every sibling (`site-header.tsx`, `site-footer.tsx`, `bottom-nav.tsx`, `category-menu.tsx`, `announcement-bar.tsx`) is kebab-case.
- Two unrelated-in-status files share the exact name `product-carousel-section.tsx` in different folders (`components/sections/` — live, `components/shared/` — dead). Same-name-different-folder is a real trap for anyone using fuzzy-file-open.
- Otherwise naming is consistent: `use*` hook prefix, `*-store.ts` for zustand stores, `*Client`/`*Detail`/`*Shell`/`*Stream` component-role suffixes in the App Router split-component pattern.

# Module Responsibilities

- Business/domain logic embedded in a route file: `app/orders/[orderId]/page.tsx` contains delivery-quote copywriting, a traffic-simulation curve, a mishap schedule, and SVG path geometry — none of which belongs in a `page.tsx`.
- `components/checkout/checkout-client.tsx` mixes Razorpay SDK lifecycle management with order-summary rendering; the payment logic (script loading, popup handlers, rollback-on-dismiss) is a good candidate for a `useRazorpayCheckout()` hook.
- `lib/cart-store.ts` (551 lines) mixes cart CRUD, server-cart debounced persistence, coupon/event side-effects (`syncItems` reaches into `coupon-store` via dynamic `import()`), and stock-limit toasting in one zustand store. Not a "god file" by line count alone, but it does own more concerns than a cart store should.
- No business logic found leaking into routes/controllers from an unrelated domain (e.g., no auth logic in product code) — domain boundaries within user-ui itself are otherwise respected.

# Code Style

- AI-generated-editing-narration comments shipped in source (violates this repo's CLAUDE.md directly):
  - `utils/axiosInstance.ts:11` — `// ✅ ADD THIS LINE to bypass ngrok warning page`
  - `components/shared/product-carousel-section.tsx:10,19,42` — `// ✅ Add prop`, `// ✅ Default false`, `{/* ✅ VIEW ALL CARD */}`-style comments (this whole file is also dead)
  - `components/shared/product-carousel.tsx:98,108,126` — `{/* ✅ LOADING STATE... */}`, `{/* ✅ DATA STATE... */}`, `{/* ✅ VIEW ALL CARD... */}`
- Dead/commented-out code left in place: `utils/axiosInstance.ts:65-69` has a whole commented-out `axios.post(...)` refresh-token block sitting next to the live implementation.
- Inconsistent commenting density between files written in the same domain: `lib/storefront.ts` and `lib/cart-store.ts` use terse "why"-only comments; `hooks/useWeightBasedPrice.ts` uses full JSDoc blocks with `Usage:` examples — a style nobody else in `hooks/` uses, and the file is dead anyway.
- Defensive "just in case" duplication: `components/shared/product-carousel.tsx:32` dedupes products by ID with a comment `// defense in depth`, while the same dedup already happens upstream in `hooks/useProducts.ts` — one of the two is redundant.
- `components/layout/site-footer.tsx` fights Tailwind with itself: `style={{ textAlign: 'left', alignItems: 'start' }}` combined with `!text-left` on nearly every child element, and `style={{ borderRadius: '9999px !important' }}` next to a `!rounded-full` class doing the same thing. Reads like a layout bug was patched by stacking overrides rather than finding the root cause.
- `{"Copyright © 2025 Fishstudio | All rights reserved"}` (`site-footer.tsx`) — unnecessary unicode-escapes a `©` that could just be typed directly.

# Architecture

- Route/data-fetch separation is generally good and idiomatic for the App Router: server components (`page.tsx`, `*-data-stream.tsx`) fetch and pass `initialData` into client shells (`*-shell.tsx`), which hydrate via TanStack Query. This pattern is correctly and consistently applied in the *live* home/search/category/product paths.
- That same good pattern is undermined by the dead parallel versions sitting next to it (see Executive Summary) — a reader can't tell which is current without grepping for usages, which is exactly what this audit had to do repeatedly.
- WebSocket architecture: `context/ws-context.tsx` is a deliberately-built single-connection-per-session pattern (own comment explains it replaced 3 separate connections). Two files reintroduce that exact anti-pattern instead of calling `useWs().subscribe(...)`: `app/orders/[orderId]/page.tsx` and `app/order-confirmation/[orderId]/_components/order-confirmation-detail.tsx`. `app/orders/_components/orders-realtime-layer.tsx` does it correctly via `useWs()` — proving the right pattern was known and used elsewhere in the same feature area.
- `lib/cart-store.ts` reaches into `coupon-store` and `address-store` via dynamic `import()` inside `syncItems()` rather than a static import — works, but is an unusual way to avoid a circular import that suggests the store boundaries could be drawn differently (e.g., a checkout-summary orchestration layer above all three stores).

# Dependency Review

- No circular import errors observed; the dynamic `import()` in `lib/cart-store.ts` (importing `address-store` and `coupon-store` at call time instead of module load) is a workaround for what would otherwise likely be a circular static import — worth resolving structurally rather than papering over.
- Dependency direction between `lib/` (stores + business logic) → `utils/` (low-level helpers) is correct and one-directional, except for the `lib/utils.ts` ↔ `utils/axiosInstance.ts` re-export (see Configuration) which blurs the line between the two folders' purposes.
- `@repo/zod-schema` package boundary respected (see Zod Schema Review) — no deep imports past the package's declared export map.

# Configuration

- `frontendEnv` (`lib/env.ts`) centralizes `NEXT_PUBLIC_*` reads well — one place, sensible fallbacks to `localhost:8080`/`3000`.
- **No `.env.example` for user-ui**, unlike sibling services in this monorepo (`api-gateway/env.example`, `auth-service/env.example` both exist per repo root). 6 env vars are read across the app (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SERVER_URI`, `NEXT_PUBLIC_CORS_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SERVICE_PORT`, `NEXT_PUBLIC_WORKER_WS_URL`) with none documented for a new engineer to copy.
- `context/ws-context.tsx` and two duplicate-WS files independently hardcode the same `ws://localhost:6006` fallback and the same https→wss derivation logic — configuration/connection-URL logic duplicated in 3 places instead of one shared helper.
- `utils/constants.ts` holds exactly one constant (`BAR_HEIGHT`); fine as-is, no action needed.
- `next.config.mjs` is genuinely strong: CSP built from an explicit dev/prod branch, full security header set, `transpilePackages` correctly lists all internal `@repo/*` deps, custom Cloudinary image loader wired via `images.loaderFile`.

# Error Handling

- Network calls in `lib/`/`hooks/` consistently fail soft (empty arrays/`null`, `.catch(() => [])`) for non-critical reads (banners, categories, recently-viewed) — appropriate for a storefront where a failed "recently viewed" fetch shouldn't break the page.
- Payment flow (`checkout-client.tsx`) has real, reasoned error handling: distinguishes "payment attempted but unverified" from "payment never attempted" to decide whether to auto-cancel an order, with a comment explaining the race condition being guarded against.
- Swallowed errors without context in several places use bare `catch {}` for genuinely non-critical paths (`trackProductView`, `mergeActivity`, coupon fetch) — acceptable given these are explicitly fire-and-forget, but note none of them log to any observability tool, so a systemic failure (e.g., the tracking endpoint going down entirely) would be invisible.
- `components/shared/address-modal.tsx:219` — `catch (_) {}` on the "fetch serviceable areas" fallback silently drops the error with no logging at all, even a `console.warn`.

# Logging

- No structured logging anywhere in user-ui (expected for a Next.js storefront frontend — errors mostly surface via `sonner` toasts to the user, which is the right pattern here).
- `console.error`/`console.log` used ad hoc in a handful of places (`context/ws-context.tsx`, `lib/orders-api.ts`, `lib/cart-store.ts`) with no consistent prefix/tag — fine for a frontend app of this size, not worth introducing a logging library for.
- `context/ws-context.tsx:98` logs `✅ User WS connected...` to the console in production builds — harmless but unnecessary console noise shipped to end users' browsers.

# Type Safety

- CLAUDE.md states real types are non-negotiable; user-ui mostly complies but has real gaps:
  - `(product as any).badges`, `(product as any).cuttingTypes`, `(product as any).storeId` — casts to `any` scattered through `product-card.tsx`, `add-to-cart-modal.tsx`, `product-detail-client.tsx` to reach fields that exist on `Product` but are being accessed defensively as if they might not.
  - `order: any` and `item: any` throughout the entire order-confirmation and order-detail flows (`order-confirmation-detail.tsx`, `orders/[orderId]/page.tsx`, `orders-list.tsx`) — the order shape returned by `/order/api/get-order/:id` is never typed at all, despite `@repo/zod-schema` already exporting `order.schema.ts` types for the same domain.
  - `coupon?: any` (`product-detail-client.tsx` props, `AddressModal`'s catch blocks) and `data: any` on most raw `fetch()`/axios response destructuring outside of `lib/storefront.ts`.
- Where types are defined locally instead of imported, they're duplicated: `Address`/`AddressType` exist in both `lib/address-store.ts` and `hooks/useAddress.ts` (slightly different shapes — the hook's version lacks `landmark`, `lat`, `lng`), so it's unclear which is authoritative.

# Dead Code

Confirmed by grep across the entire app (zero references outside the file itself):

- 🔴 **Whole dead routes**: `app/home-page-client.tsx`, `app/_components/product-showcase.tsx` + `app/_components/product-sections-client.tsx`, `app/search/search-page-client.tsx`, `app/search/_components/search-results-stream.tsx`, `app/category/[slug]/category-client.tsx`.
- 🟠 **Dead components**: `components/sections/hero-section.tsx`, `components/shared/product-carousel-section.tsx` (duplicate of `components/sections/product-carousel-section.tsx`, which is live), `components/shared/product-detail-skeleton.tsx` (duplicate of `product-view-skeleton.tsx`, which is live).
- 🟠 **Dead hook**: `hooks/useWeightBasedPrice.ts` and its co-exported `formatWeight`/`formatWeightWithPrice`.
- 🟡 **Dead lib/utils files**: `lib/product-adapter.ts`, `utils/product-utils.ts` (1-line re-export of `transformProduct`, itself never imported), `utils/AI.enhancements.ts`, `utils/cities.tsx`, `utils/convertToBase64.ts`.
- 🟡 **Dead folders-of-one**: `store/index.ts`, `styles/globals.css`.
- 🟢 **Dead UI affordance**: the "Edit" pencil button in `AddressCard` (`components/shared/address-modal.tsx:782-787`) has no `onClick` handler.
- No unused npm dependencies were checked in this pass (out of scope — code-level dead code only).

# Scalability

- The live App Router streaming pattern (server fetch → `initialData` → client hydration) scales fine for more routes/APIs — it's a sound, repeatable template once the dead duplicates are removed so it's the *only* template.
- `context/ws-context.tsx`'s single-connection-with-typed-subscribe pattern scales well for more real-time event types, provided new features actually use `useWs()` instead of opening their own socket (see Architecture — two features already didn't).
- `lib/cart-store.ts` and the duplicated cart-sidebar/cart-page logic will not scale gracefully to a second cart surface (e.g., a mini-cart widget) without a third copy of the same 100+ lines of coupon/tip/bill math — this should be extracted into a shared hook before that happens.
- Hardcoded `categoryTheme`/`categoryIcons` maps in `category-menu.tsx`, keyed by exact category name strings, will silently degrade (fallback gray theme, generic fish icon) for any new category added on the backend without a matching frontend PR — not a hard scalability blocker, but a guaranteed recurring small task for "more categories."

# Human Code Quality

- The dead-duplicate-route pattern (3 instances: home, search, category) reads as iterative AI-agent development where a route was regenerated into a better architecture but the old version was never removed — a single person refactoring by hand would have deleted the old file in the same commit that introduced the replacement.
- Checkmark-emoji comments (`✅`) narrating what a line does, found in 4+ files, are a distinctive AI-authorship tell and directly contradict this repo's own CLAUDE.md instruction against narrating edits.
- The fabricated GPS delivery simulation (`app/orders/[orderId]/page.tsx`) is polished enough (traffic easing curves, deterministic mishap scheduling, SVG path tangent-angle math for scooter rotation) that it reads as a showcase feature built to impress rather than a pragmatic solution — a senior engineer under normal product constraints would more likely ship a simple status stepper first and revisit animation once real GPS data exists.
- Genuinely good, human-feeling touches worth calling out positively: `app/wishlist/page.tsx`'s comment honestly explains *why* it's an empty state ("A user-facing wishlist API doesn't exist yet... this currently shows an empty state") instead of pretending the feature is finished — exactly the kind of load-bearing, honest comment CLAUDE.md asks for. `lib/storefront.ts`'s pricing-resolution comments explain non-obvious business rules (catalog-only products may have null prices) rather than restating code.

# Prioritised Fixes

1. Delete the 5 dead route-duplicate files/pairs (home, search ×2, category) — highest risk of accidental future edits to dead code.
2. Split `app/orders/[orderId]/page.tsx`: extract `DeliveryMap`, `RotatingQuote`, `OrderTracker`, and the quote/mishap/traffic data tables out of the route file, and make a product call on whether the simulated tracking should be disclosed as illustrative or replaced with real status-only UI.
3. Route both duplicate raw-WebSocket usages (`orders/[orderId]/page.tsx`, `order-confirmation-detail.tsx`) through `useWs()` from `context/ws-context.tsx`.
4. Extract shared cart-summary logic (subtotal/delivery/discount/tip/donation + coupon handlers) out of `cart-sidebar.tsx` and `cart-page-client.tsx` into one hook.
5. Standardize on a single `axiosInstance` import path; remove the re-export from `lib/utils.ts`.
6. Remove the remaining dead files (hooks/lib/utils/components listed in Dead Code).

# TODO Checklist

- [x] 🔴 `app/home-page-client.tsx` Delete — fully unreferenced alternate homepage implementation.
- [x] 🔴 `app/_components/product-showcase.tsx`, `app/_components/product-sections-client.tsx` Delete — fully unreferenced alternate homepage product sections.
- [x] 🔴 `app/search/search-page-client.tsx` Delete — fully unreferenced alternate search page.
- [x] 🔴 `app/search/_components/search-results-stream.tsx` Delete — fully unreferenced alternate search data wrapper.
- [x] 🔴 `app/category/[slug]/category-client.tsx` Delete — fully unreferenced alternate category page.
- [x] 🔴 `app/orders/[orderId]/page.tsx` Split the 1,865-line file: extract `DeliveryMap`, `OrderTracker`, `RotatingQuote`, mishap/traffic/quote data tables into separate modules. (The product question of whether to disclose/replace the simulation is a decision for the team, not something this pass makes unilaterally — flagged, not resolved.)
- [x] 🔴 `app/orders/[orderId]/page.tsx`, `app/order-confirmation/[orderId]/_components/order-confirmation-detail.tsx` Replace duplicated raw `new WebSocket(...)` connections with `useWs()` from `context/ws-context.tsx`.
- [x] 🟠 `components/shared/cart-sidebar.tsx`, `components/shared/cart-page-client.tsx` Extract shared subtotal/delivery/discount/tip/coupon logic into one hook to remove ~150 lines of duplicated business logic.
- [x] 🟠 `components/shared/product-carousel-section.tsx` Delete — dead duplicate of `components/sections/product-carousel-section.tsx`; also contains AI-editing-narration comments.
- [x] 🟠 `components/shared/product-detail-skeleton.tsx` Delete — dead duplicate of `components/shared/product-view-skeleton.tsx`.
- [x] 🟠 `components/sections/hero-section.tsx` Delete — fully unreferenced.
- [x] 🟠 `hooks/useWeightBasedPrice.ts` Delete — fully unreferenced, duplicates pricing math owned by `lib/storefront.ts`.
- [x] 🟠 `lib/utils.ts`, and the 14 files importing `axiosInstance` Standardize on `@/utils/axiosInstance` directly; remove the re-export from `lib/utils.ts`.
- [x] 🟡 `store/index.ts` Delete the file and the folder (or repurpose it to actually hold the zustand stores currently in `lib/*-store.ts` — pick one).
- [x] 🟡 `styles/globals.css` Delete — unused duplicate of `app/globals.css`.
- [x] 🟡 `lib/product-adapter.ts` Delete — fully unreferenced thin wrapper around `transformProduct`.
- [x] 🟡 `utils/product-utils.ts` Delete — fully unreferenced 1-line re-export.
- [x] 🟡 `utils/AI.enhancements.ts` Delete — fully unreferenced.
- [x] 🟡 `utils/cities.tsx` Delete — fully unreferenced; also wrong file extension (no JSX).
- [x] 🟡 `utils/convertToBase64.ts` Delete — fully unreferenced.
- [x] 🟡 `utils/categories.tsx` Deleted — `shopCategories` had zero references anywhere in user-ui (unlike `cities.tsx`/`convertToBase64.ts`, renaming wasn't enough since it was fully dead, not just wrongly-extensioned).
- [x] 🟡 `utils/axiosInstance.ts` Remove the commented-out dead refresh-token block and the `// ✅ ADD THIS LINE...` narration comment.
- [x] 🟡 `components/shared/product-carousel.tsx` Remove the three `✅`-prefixed narration comments.
- [x] 🟡 `components/layout/site-footer.tsx` Remove the redundant `!text-left`/inline-style stacking; fix root layout cause instead.
- [x] 🟡 13 files using `text-[#5A2C96]`/`bg-[#5A2C96]` (e.g. `app/wallet/page.tsx`, `app/refer/page.tsx`, `app/faqs/page.tsx`, `app/_components/categories-section.tsx`) Replace hardcoded hex with `text-primary`/`bg-primary` design tokens.
- [x] 🟡 `hooks/useAddress.ts` vs `lib/address-store.ts` Reconcile the two different `Address`/`AddressType` shapes into one shared type.
- [x] 🟡 Order flow (`orders-list.tsx`, `order-confirmation-detail.tsx`, `orders/[orderId]/page.tsx`) Replace `order: any`/`item: any` with a real type, ideally sourced from `@repo/zod-schema`'s `order.schema.ts`.
- [x] 🟢 `components/layout/NotificationBell.tsx` Rename to `notification-bell.tsx` to match kebab-case convention used by every other file in `components/layout/`.
- [x] 🟢 `components/shared/address-modal.tsx` Wire up or remove the non-functional "Edit" pencil button on saved address cards.
- [x] 🟢 Add `.env.example` documenting the 6 `NEXT_PUBLIC_*` vars read across the app, matching the convention already used by `api-gateway`/`auth-service`. (False positive — `apps/user-ui/env.example` already existed; my original audit's `find -iname "*.env*"` glob simply didn't match a file named `env.example`, since that pattern requires a literal `.env` substring.)
- [x] 🟢 `packages/zod-schema/README.md` Replace the unedited `bun init` boilerplate with an actual description (flagged here since it's directly relevant to the only shared package in scope, though the fix lives outside `apps/user-ui`).

# Completed Changes

- Deleted 5 dead route-duplicate files: `app/home-page-client.tsx`, `app/_components/product-showcase.tsx`, `app/_components/product-sections-client.tsx`, `app/search/search-page-client.tsx`, `app/search/_components/search-results-stream.tsx`, `app/category/[slug]/category-client.tsx`. Re-verified zero references immediately before each deletion.
- Deleted 11 more fully-dead files: `components/sections/hero-section.tsx`, `components/shared/product-carousel-section.tsx`, `components/shared/product-detail-skeleton.tsx`, `hooks/useWeightBasedPrice.ts`, `store/index.ts` (+ folder), `styles/globals.css` (+ folder), `lib/product-adapter.ts`, `utils/product-utils.ts`, `utils/AI.enhancements.ts`, `utils/cities.tsx`, `utils/convertToBase64.ts`, `utils/categories.tsx`.
- Cleared the stale `.next/` build cache (gitignored, regenerates automatically) after it surfaced a corrupted generated type-validator file unrelated to these edits; `tsc --noEmit` is clean against the remaining source aside from one pre-existing, unrelated `isomorphic-dompurify` missing-dependency error in `product-detail-client.tsx` (part of already-uncommitted work from before this session, out of scope for this audit).
- Standardized `axiosInstance` on a single import path (`@/utils/axiosInstance`, default export) across all 8 files that previously went through the `@/lib/utils` re-export or a relative `./utils` import (`app/addresses/page.tsx`, `order-confirmation-detail.tsx`, `orders-realtime-layer.tsx`, `orders/[orderId]/page.tsx`, `address-modal.tsx`, `cart-sidebar.tsx`, `cart-page-client.tsx`, `lib/cart-store.ts`), and removed the re-export from `lib/utils.ts` so that file only exports shadcn's `cn()` again, matching `components.json`'s declared `"utils": "@/lib/utils"` alias.
- `utils/axiosInstance.ts`: removed the commented-out dead refresh-token block and replaced the `// ✅ ADD THIS LINE...` narration comment with a plain why-comment.
- Verified with `tsc --noEmit` after each step; no new type errors introduced.
- Replaced the two duplicated raw `new WebSocket(...)` connections (`app/orders/[orderId]/page.tsx`, `order-confirmation-detail.tsx`) with `useWs().subscribe("ORDER_STATUS_UPDATE", ...)` from the shared `context/ws-context.tsx`, matching the pattern already used correctly by `orders-realtime-layer.tsx`. Removed the now-unused `frontendEnv`/manual `wss://` derivation from both files.
- Split `app/orders/[orderId]/page.tsx` from 1,865 lines down to 381, extracting the tracker/simulation into a route-local `_components/` folder (matching the convention already used by `order-confirmation/[orderId]/_components/`, `category/[slug]/_components/`, etc.):
  - `_components/delivery-eta.ts` — `DeliveryMode`, `SLOT_LABELS`, `SLOT_WINDOWS`, `normalizeDeliveryMinutes`, `getDeliveryMode`, `getDeliveryEtaMinutes` (pure helpers/constants shared across the tracker components and the page).
  - `_components/rotating-quote.tsx` — `RotatingQuote` + its own quote copy and gradient palette (used nowhere else).
  - `_components/delivery-map.tsx` — `DeliveryMap` + the traffic-curve/mishap-schedule/state-label data it alone depends on.
  - `_components/scheduled-ship-card.tsx`, `_components/delivered-banner.tsx` — the two smaller status cards, each in its own file.
  - `_components/order-tracker.tsx` — `OrderTracker` (composes the four components above) + the step definitions and injected `KEYFRAMES` it alone uses.
  - `page.tsx` now only handles routing/data-fetching/guards and the items/delivery/bill layout, importing `OrderTracker` and the two `delivery-eta` helpers it needs.
  - Verified with `tsc --noEmit` (clean) and `eslint` (0 errors, pre-existing `any`/exhaustive-deps warnings only, unchanged from before the split) after the split.
- Extracted `hooks/useCartCheckoutSummary.ts`, the shared bill-summary logic behind both `components/shared/cart-sidebar.tsx` and `components/shared/cart-page-client.tsx`: subtotal/delivery/handling/discount/tip/donation/grandTotal calculation, coupon apply/select/remove handlers, the pincode→store resolution effect, and the coupon-fetch + auto-apply effects. Deliberately left cart *sync* (`syncItems`) out of the shared hook — the sidebar re-syncs on every open + location change with a "cart changed" toast, the page syncs once on mount, and those are genuinely different lifecycles rather than duplicated logic.
  - Consolidating necessarily meant picking one behavior where the two files had quietly drifted: the sidebar's pincode-resolve effect populated `deliveryTimeMinutes` and its auto-apply-coupon effect had an extra `appliedCoupons.length > 0` guard; the page's versions were missing both. Took the more complete (sidebar) version as canonical for both. Also gave the page's `handleRemoveCoupon` (which toasts "Coupon removed") to the sidebar, which previously called `removeCoupon` directly with no toast — so both surfaces now behave identically, which was the point of sharing the logic.
  - Verified with `tsc --noEmit` (clean) and `eslint` (0 new errors; remaining warnings — an unused `X`/`Navigation` icon import and an unused `isSyncing` read — are pre-existing and untouched by this change).
- `components/shared/product-carousel.tsx`: removed the three `{/* ✅ ... */}` narration comments — the code (an `isLoading` ternary and a `viewAllHref &&` guard) was already self-explanatory.
- `components/layout/site-footer.tsx`: removed the redundant `!text-left` on nearly every element plus the inline `style={{ textAlign: 'left', alignItems: 'start' }}` and `style={{ borderRadius: '9999px !important' }}` — confirmed via grep that nothing in `app/globals.css` or `app/layout.tsx` sets a competing `text-align: center`, so the existing `flex flex-col items-start` on each container (and `rounded-full` without `!`) was always sufficient on its own. Also fixed the footer's copyright line, which used an unnecessary `©` escape instead of typing `©` directly (caught and corrected an intermediate mistake in this same edit where the escape briefly became literal text instead of the symbol — fixed before finishing).
- Replaced the hardcoded `#5A2C96` Tailwind arbitrary-value color (`text-[#5A2C96]`, `bg-[#5A2C96]`, `border-[#5A2C96]`, including `/5` and `/10` opacity variants) with the `primary` design token across all 12 files where it appeared as a real Tailwind class: `app/refer/page.tsx`, `app/_components/categories-section.tsx`, `app/faqs/page.tsx`, `app/wallet/page.tsx`, `app/categories/page.tsx`, `app/account/page.tsx`, `app/wishlist/page.tsx`, `app/account/edit/page.tsx`, `app/notifications/page.tsx`, `app/help/page.tsx`, `components/layout/bottom-nav.tsx`, `components/shared/product-badge.tsx`. Left the 13th occurrence in `order-confirmation-detail.tsx` alone — those two are `color:#5A2C96` inside a raw HTML string for the print-invoice popup window, which has no access to the app's CSS custom properties, so a literal hex value is actually correct there, not a drift.
- `hooks/useAddress.ts` vs `lib/address-store.ts`: turned out there was nothing to reconcile — re-checking with a precise `\buseAddress\b` grep (excluding `useAddressStore`) showed `useAddress()` is called nowhere in the app. It duplicated `/auth/api/add-address` / `/auth/api/delete-address` calls that `components/shared/address-modal.tsx` and `app/addresses/page.tsx` already make directly against the real `useAddressStore`. Deleted the file instead of merging its type — the original finding assumed both call sites were live; they weren't.
- Typed the order flow. `@repo/zod-schema`'s `order.schema.ts` turned out to only contain *request* schemas (`createOrderSchema`, status-update schemas) — there's no schema for the joined `GET /order/api/get-order/:id` / `/user-orders` *response* shape (with `items[].product`, `store`, etc.), so there was nothing to import. Built `Order`/`OrderItem`/`OrderStore` interfaces from the actual fields each consumer reads (grepped every `order.*`/`item.*`/`store.*` access across the three files first) and exported them from `lib/orders-api.ts`.
  - `lib/orders-api.ts` itself turned out to be dead code discovered mid-task — its two exported fetch functions (`fetchServerOrders`, `fetchServerOrderById`) were never imported anywhere. Repurposed the file rather than adding a new one: dropped the two dead functions, kept the filename since it's still thematically the right home for order data types.
  - Updated `app/orders/_components/orders-list.tsx`, `orders-realtime-layer.tsx`, `app/order-confirmation/[orderId]/_components/order-confirmation-detail.tsx`, `app/orders/[orderId]/page.tsx`, and `app/orders/[orderId]/_components/delivery-eta.ts` to use `Order`/`OrderItem` instead of `any`.
  - Real typing caught two genuine loose ends the `any` had been hiding: `SLOT_LABELS[order.deliverySlot]` indexing with a possibly-`undefined` key, and a `selectedOptions?.cuttingCharge > 0` check that doesn't narrow `selectedOptions` itself for the lines after it — fixed the latter by matching the `x?.y != null && x.y > 0` pattern the sibling file (`order-confirmation-detail.tsx`) already used correctly for the identical check.
  - Verified with `tsc --noEmit` (clean) and `eslint` (0 errors; remaining `any` warnings are on `useWs()`'s own `(payload: any) => void` handler signature, which is that context's existing type contract, not part of this task).
- Renamed `components/layout/NotificationBell.tsx` → `notification-bell.tsx` and updated its one import in `site-header.tsx`, matching the kebab-case convention every other file in `components/layout/` already uses.
- `components/shared/address-modal.tsx`: removed the non-functional "Edit" pencil button on saved address cards (and its now-unused `Pencil` import) rather than wiring it up — there is no update-address backend endpoint anywhere in `auth-service` (confirmed by grep; only add/delete exist), so making it real would mean adding a new backend route, out of scope for this pass. A button that silently does nothing on tap is worse than no button.
- `apps/user-ui/env.example` already existed and is up to date — this TODO was a false positive from the original audit's `find -iname "*.env*"` glob, which doesn't match a bare `env.example` filename (no leading dot). Left untouched.
- `packages/zod-schema/README.md`: replaced the unedited `bun init` boilerplate with a real description of the package's purpose, usage, and file layout.
