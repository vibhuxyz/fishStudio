# SESSION_10: Code Style & Structure Audit — apps/mobile

Scope: `apps/mobile/` in full — every file under `app/`, `components/`, `hooks/`, `lib/`, `store/`, `context/`, `config/`, `constants/`, `utils/`, `actions/`, `screens/`, `stubs/`, plus root config (`app.json`, `eas.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`, `tailwind.config.js`, `eslint.config.js`, `package.json`). 104 source files read individually, ~21.5k lines.

> Filename note: the session brief said `docs/SESSION_09.md`, which already exists (a completed `apps/payment-service` audit). Written as `SESSION_10.md` instead, matching this session's own title, to avoid destroying that record — same convention SESSION_09 itself used when it collided with SESSION_04.

Zod scope: grepped `apps/mobile` for any import containing `zod-schema` — **zero matches**. `@repo/zod-schema` is not a dependency in `apps/mobile/package.json` and is not imported anywhere. There is nothing to review under "only files imported by mobile/" because none are imported; this absence is itself the finding (see Zod Schema Review).

# Executive Summary

- **A secret named "private key" ships to every device.** `app/(tabs)/profile.tsx:88` reads `EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY` and sends it as an HTTP Basic-Auth credential straight from the client to ImageKit's upload API. Any `EXPO_PUBLIC_*` var is baked into the JS bundle and trivially extractable from the shipped app. Whoever pulls this key can upload/manipulate files on the ImageKit account directly, bypassing the backend entirely.
- **The "live" delivery tracker is entirely fabricated.** `components/order-tracker.tsx` (1146 lines) simulates a rider's GPS position along a hardcoded SVG path using a synthetic traffic-easing curve and a scripted "mishap schedule" (fake traffic jams, wrong turns, signal stops) — all computed from elapsed wall-clock time since `updatedAt`, with zero real location data from any backend. It renders as a polished, convincing "Live Delivery" map. This is a deceptive-by-construction UI shipped as if it were real tracking.
- **Two full, parallel, incompatible auth systems exist; only one is reachable.** The live flow is phone-OTP passwordless (`app/index.tsx` → `(routes)/login/index.tsx`, `/auth/api/send-otp` + `/auth/api/verify-otp`). A second email+password+OTP flow (`(routes)/signup`, `signup-otp`, `forgot-password`, `change-password`) uses different endpoints entirely and is never linked to from anywhere — confirmed by grep, nothing routes to any of these four screens.
- **A second full checkout/payment path is also dead.** `checkout/index.tsx` places orders directly via `/order/api/create` with a `paymentMethod` string (upi/card/cod) and never touches Stripe. A separate `(routes)/payment/index.tsx` implements a complete Stripe `CardField` checkout — unreferenced anywhere (confirmed by grep). The `@stripe/stripe-react-native` dependency, its EAS/metro web-stub wiring, and the screen itself are all dead weight for an unreachable feature.
- **That web stub is now broken.** `metro.config.js` resolves `@stripe/stripe-react-native` on web to `stubs/stripe-react-native.js`, but that file no longer exists in the working tree (confirmed: deleted, uncommitted). `expo export`/`expo start --web` will fail to resolve the import today.
- **Cart/wishlist analytics never fire.** `store/index.tsx`'s `sendKafkaEvent` calls are guarded by `if (user?.id && location && deviceInfo)`, but every single call site in the app (`cart.tsx`, `product/[id]/index.tsx`, `product.card.tsx`, `products.tsx`, `wishlist.tsx`) passes `location` as a literal `null`. The guard can never pass. Add-to-cart/remove/wishlist analytics have been silently dead code since day one.
- **Three disagreeing "primary purple" tokens.** `constants/theme.ts` (a genuinely thorough, Figma-sourced design system) is imported by **zero files**. `tailwind.config.js` / `constants/Colors.ts` define primary as `#6C3CE1`. 25 files instead hardcode `#5A2C96` directly. 6 files (`product/[id]/index.tsx`, `cart.tsx`, `my-orders/index.tsx`, `order-confirmation/[id]/index.tsx`, `add-to-cart-modal.tsx`, `location-modal.tsx`) use **both** conventions in the same file — two visibly different purples render side by side on screen.
- **"Delete Account" doesn't delete the account.** `settings/index.tsx`'s `handleDeleteAccount` does `await new Promise(r => setTimeout(r, 2000))`, clears `AsyncStorage`, and redirects to login. No backend call. The account and its server-side data are untouched.
- **Generic e-commerce template never adapted to the domain.** `(routes)/products/index.tsx` filters by "Electronics / Fashion / Home & Kitchen / Sports & Fitness" and clothing sizes XS–XXL with 7 colour swatches, on a fish-and-meat delivery app. `components/home/banner.tsx` ("Big Sale — Up to 50%") is the same vintage and is unused. `wishlist.tsx` and `shop/[id]/index.tsx` price everything in `$` while the rest of the app is ₹/+91/en-IN throughout.
- **Pervasive `any`, in direct conflict with this repo's own CLAUDE.md rule** ("No `req: any`... non-negotiable"). Product/order/coupon payloads are typed `any` almost everywhere; `experiments.typedRoutes: true` is set in `app.json` but nearly every dynamic `router.push` is cast `as any`, defeating the feature.
- **`@repo/zod-schema` is fully unused despite covering exactly mobile's domains** (auth, product, order, coupon, notification, weight-pricing). Every screen hand-rolls its own interfaces and manual validation instead.
- Positives worth keeping: `utils/axiosInstance.tsx`'s token-refresh/rotation logic is careful and well-reasoned; the zustand stores (`address-store`, `coupon-store`, `delivery-slot-store`) are clean and appropriately scoped; FlatList perf props (`keyExtractor`, `initialNumToRender`, `windowSize`, `removeClippedSubviews`) are used correctly wherever FlatList is actually used; SecureStore vs AsyncStorage separation for sensitive vs. non-sensitive data is correct throughout.

# File Reviews

Ratings reflect the file as read, not the concept.

| File | Lines | Quality | Notes |
|---|---|---|---|
| `app/(routes)/product/[id]/index.tsx` | 1379 | ⭐⭐☆☆☆ | God screen: 3 queries + 1 mutation + duplicated per-kg pricing math + 7 inline render-functions instead of components. |
| `components/order-tracker.tsx` | 1146 | ⭐⭐☆☆☆ | Impressively engineered, but simulates fake GPS tracking. ~10 sub-components in one file. Dead empty `export { styles }` at the end. |
| `components/shared/address-modal.tsx` | 920 | ⭐⭐⭐☆☆ | Large but coherent; mixes networking + two view-modes + UI. "Detect my location" is a stub toast while `add-address` implements the real thing. |
| `app/(routes)/login/index.tsx` | 859 | ⭐⭐⭐⭐☆ | Clean 4-step OTP wizard, good use of refs/timers, consistent inline `StyleSheet`. Large but not tangled. |
| `app/(tabs)/cart.tsx` | 836 | ⭐⭐⭐☆☆ | 3 near-duplicate location/offer `useEffect`s; one duplicates checkout's "resolve store from pincode" block almost verbatim. |
| `app/(routes)/checkout/index.tsx` | 723 | ⭐⭐⭐☆☆ | Good pricing/coupon logic; duplicates cart's store-resolution effect; 100% inline style objects (different convention from cart.tsx's className mix). |
| `app/(routes)/products/index.tsx` | 566 | ⭐☆☆☆☆ | Generic e-commerce template (clothing sizes/colors/categories) never adapted to the fish/meat domain; `$` pricing. |
| `app/(tabs)/profile.tsx` | 560 | ⭐☆☆☆☆ | Exposes an `EXPO_PUBLIC_*` "private key" to ImageKit from the client; hardcoded fake "•••• 4242 VISA" payment card; ships literal Lorem ipsum body copy. |
| `app/(routes)/shop/[id]/index.tsx` | 519 | ⭐⭐☆☆☆ | `$` pricing, `bg-blue-600` instead of the app's `bg-primary`, generic "Follow/Products/Offers/Reviews" template feel. |
| `utils/axiosInstance.tsx` | 242 | ⭐⭐⭐⭐⭐ | Careful token-refresh/rotation with request queueing, dev-host auto-detection, safe HTTPS fallback for release builds. Best file in the codebase. |
| `utils/pricing.ts` | 283 | ⭐⭐⭐⭐☆ | Well-structured weight/size pricing helpers — but per-kg cutting/piece pricing logic is duplicated elsewhere instead of living here (see Code Style). |
| `hooks/useLiveOrder.ts` | 181 | ⭐⭐⭐⭐☆ | Solid websocket-with-fallback-polling design; duplicates the separate global `WebSocketProvider` connection (see Architecture). |
| `lib/address-store.ts` / `coupon-store.ts` / `delivery-slot-store.ts` | 137/231/23 | ⭐⭐⭐⭐☆ | Clean zustand stores, sensible persistence partitioning, good comments explaining *why*. |
| `(routes)/forgot-password/index.tsx` | 223 | ⭐☆☆☆☆ | Non-functional: submit handler is commented out, `console.log` stands in for real submission. Unreachable from anywhere in the app. |
| `(routes)/payment/index.tsx` | 405 | ⭐⭐☆☆☆ | Well-built Stripe screen — that nothing routes to. |
| `components/home/location-modal.tsx` | 189 | ⭐☆☆☆☆ | Hardcoded fake area list, admits in its own comment "In a real app, this would use expo-location." Unreferenced anywhere. |
| Default Expo template files (`ThemedText`, `ThemedView`, `Collapsible`, `HelloWave`, `ExternalLink`, `ParallaxScrollView`, `HapticTab`, `ui/IconSymbol*`, `ui/TabBarBackground*`) | ~330 total | n/a | Scaffolding from `create-expo-app`, unused outside the also-effectively-dead `+not-found.tsx`. |

# Zod Schema Review

- `packages/zod-schema` (`@repo/zod-schema`) exists and exports schemas for exactly the domains mobile touches: `auth.schema.ts`, `product.schema.ts`, `order.schema.ts`, `coupon.schema.ts`, `notification.schema.ts`, `weight-pricing.schema.ts`, `category.schema.ts`, `banner.schema.ts`, `event.schema.ts`, `store.schema.ts`, `image.schema.ts`.
- `apps/mobile/package.json` does not list `@repo/zod-schema` as a dependency, and no file imports from it. Confirmed by grep across the whole app.
- Consequence: every form does manual validation instead — `react-hook-form` `rules` with inline regex (signup, forgot-password), hand-checked strings (`add-address`'s `if (!name.trim())` chain, `change-password`'s regex-based password-strength checks), or nothing (checkout's coupon/address selection). None of it is shared with, or checked against, the schemas the rest of the monorepo already defines for the same data.
- Response typing is the same story: `Order`/`OrderItem` interfaces are hand-declared 3 times (`my-orders`, `order-details`, `order-confirmation`) instead of importing an inferred type from `order.schema.ts`; product shapes are `any` everywhere instead of `product.schema.ts`/`backend-product.ts`; `utils/pricing.ts` reimplements weight/cutting/piece-size pricing math that `weight-pricing.schema.ts` already models.
- Nothing to review line-by-line under the "only imported files" constraint, since nothing is imported — the gap itself is the finding.

# Folder Structure

```
app/
  (routes)/<20 route dirs>/index.tsx      one screen per route, expo-router convention followed
  (tabs)/                                 4 tab screens + custom floating tab bar
components/
  cards/, home/, shared/, skelton/, ui/   mixed granularity, some dead
hooks/, lib/, store/, context/, config/, constants/, utils/, actions/, screens/
```

- `screens/` exists for exactly **one** screen (`onboarding.screen.tsx`) while all 23 others live directly under `app/`. No documented rule for when a screen gets extracted vs. inlined in its route file.
- Global client state is split across two unrelated top-level folders with no boundary logic: `lib/` holds `address-store`, `coupon-store`, `delivery-slot-store`, `device`; `store/` holds `index.tsx` (cart/wishlist) and `ui-store.ts`. Same conceptual layer (zustand + AsyncStorage), two folder names.
- No `api/`/`services/` layer — every screen imports `axiosInstance` directly and inlines the request. At 20+ route screens this is why the same `Order` interface, `STATUS_CONFIG` map, and `normalizeSlug()` helper are each hand-copied 2–3 times (see Module Responsibilities).
- `constants/pricing.ts` (delivery/GST/packaging money constants) and `utils/pricing.ts` (weight/size pricing math) are two differently-named files both about "pricing," in two different top-level folders — easy to import the wrong one.
- Folder sizes are inflated by dead weight: 5 orphaned route screens, ~10 unused default-template components, 2 unused hooks, 2 largely-unused constants files, 2 unused shared components. Actual maintained surface area is meaningfully smaller than file count suggests.

# Naming

- Route files: consistent, correct expo-router conventions (`index.tsx`, `[id]`, `[slug]`, `(group)`).
- Component filenames use three different conventions simultaneously: kebab-case (`order-tracker.tsx`, `floating-tab-bar.tsx`, `add-to-cart-modal.tsx`), dot-namespaced (`product.card.tsx`, `shop.card.tsx`, `product.skelton.tsx`, `shop.skelton.tsx` — note "skelton" misspells "skeleton" consistently in both the folder and every filename in it), and PascalCase template leftovers (`ThemedText.tsx`, `ParallaxScrollView.tsx`).
- Hooks correctly use `useX` camelCase throughout.
- `constants/pricing.ts` vs `utils/pricing.ts` — see Folder Structure.
- Function/variable naming inside files is generally domain-specific and good (`resolveProductSizePricing`, `getDeliveryEtaMinutes`, `checkAndIncrement`, `sendKafkaEvent`) — this is not a weak spot.

# Module Responsibilities

- **God screens**: `product/[id]/index.tsx` (1379 lines — fetch + reviews + related products + per-kg pricing business logic + 7 render-functions); `order-tracker.tsx` (1146 — simulation engine + ~10 UI sub-components); `address-modal.tsx` (920 — networking + two view modes + UI).
- **Duplicated business logic, not extracted**: per-kg pricing (`cuttingCharge`/`sizeMultiplier`/`ratePerKg`/`computedSalePrice`) is written out nearly identically in both `product/[id]/index.tsx` and `components/home/add-to-cart-modal.tsx`, instead of living in `utils/pricing.ts` (which already houses the non-per-kg equivalent, `resolvePrice`/`resolveProductSizePricing`). Meanwhile `hooks/useWeightBasedPrice.ts` — which *does* correctly wrap `utils/pricing.ts`'s `calculatePrice` — is imported by nothing (confirmed by grep).
- **Duplicated types/config**: `Order`/`OrderItem` interfaces and the `STATUS_CONFIG` status-color map are each hand-declared separately in `my-orders/index.tsx`, `order-details/[id]/index.tsx`, and `order-confirmation/[id]/index.tsx`. `Conversation` interface is redeclared in both `messages.tsx` and `chat/[id].tsx`.
- **Duplicated helper**: `normalizeSlug()` is copy-pasted verbatim between `category/[slug]/index.tsx` and `category-row.tsx`.
- **Duplicated network client**: two independent WebSocket connections exist — the global `context/web-socket.context.tsx` (chat + unread counts + order-status) and `hooks/useLiveOrder.ts` (per-order screen, its own token fetch + exponential-backoff reconnect). Both listen for `"ORDER_STATUS_UPDATE"` on the same endpoint.
- **Network calls inside UI components** rather than a service layer throughout — acceptable at small scale, but already causing the duplication above at 20+ screens.
- **Business logic mixed with rendering**: `product/[id]/index.tsx`'s pricing `useMemo`s recompute cart-line pricing math inline in the same file as its 7 render functions.

# Code Style

- Three styling systems coexist with no single convention: 100% inline `style={{}}` objects (`checkout/index.tsx`, `order-tracker.tsx`), NativeWind `className` (most of `app/(tabs)`), and `StyleSheet.create` (`login/index.tsx`, `signup-otp/index.tsx`) — sometimes two of the three inside the same screen (`cart.tsx` mixes className and inline style objects).
- Color tokens: see Executive Summary — `constants/theme.ts` (0 imports) vs. tailwind/`Colors.ts` primary `#6C3CE1` vs. 25 files hardcoding `#5A2C96`, 6 of them mixing both in one file.
- Currency inconsistency: ₹ used correctly almost everywhere (matches +91/en-IN throughout), but `wishlist.tsx`, `shop/[id]/index.tsx`, and the dead `payment/index.tsx` use `$`; `product/[id]/index.tsx` and `add-to-cart-modal.tsx` switch between "₹123" and "Rs. 123.00" formatting *within the same component* depending on pricing mode.
- Generic, non-domain template content shipped as-is: `products/index.tsx`'s clothing categories/sizes/colors; `banner.tsx`'s "Big Sale — Up to 50%" (also unused).
- Placeholder copy in production: `profile.tsx`'s "Have a party order?" card renders literal `"Lorem ipsum dolor sit amet, consectetur adipiscing elit..."`.
- Fake data rendered as real: `profile.tsx`'s Payment card always shows a hardcoded "•••• 4242 VISA Expires 12/26" — there is no real payment-methods API behind it.
- `console.log`/`console.error` scattered with decorative emoji (`"⚠️ Clearing stale mobile auth..."`, `"🚪 Logout triggered"`, `"✅ All auth data cleared"`) and no stripping mechanism for production builds (no `babel-plugin-transform-remove-console` or similar in `babel.config.js`).
- Many silent `catch {}` / `.catch(() => {})` blocks with zero logging (several in `cart.tsx`'s location/offer effects, `address-modal.tsx`'s background store resolution) — genuinely silent, not just terse.

# Architecture

- No API/service layer; no domain/types layer — both gaps trace directly back to `@repo/zod-schema` not being adopted (see Zod Schema Review).
- Server-state boundary is blurred: `useCouponStore`/`useAddressStore` (zustand + AsyncStorage) hold server-fetched data (available coupons, saved addresses) rather than react-query cache, so there's no single invalidation path — e.g. `cart.tsx` fetches store offers via its own inline `useEffect`, while `checkout/index.tsx` fetches the conceptually same data via the zustand store's `fetchAvailableCoupons` action. Two different code paths for one concept.
- No centralized auth/session state: `hooks/useUser.tsx` re-reads `SecureStore` into fresh local component state on every mount, with no context/cache. Multiple simultaneously-mounted instances (header, profile, cart) can hold divergent stale copies of the same user object; `profile.tsx`'s `updateUserData()` doesn't propagate to other mounted consumers until they remount.
- Two parallel, incompatible auth systems (see Executive Summary) — the dead one still has real screens, real endpoints referenced, and real validation logic; it's not stub code, it's a second finished implementation nobody wired up or removed.
- Two parallel payment paths (see Executive Summary) — same situation.
- Domain boundaries are otherwise respected: mobile does not reach into other apps' or packages' internals (aside from the zod-schema absence), and no circular imports were found among mobile's own modules.

# Navigation

- expo-router used exclusively — no React Navigation mixed in beyond what expo-router itself wraps. Consistent.
- `experiments.typedRoutes: true` is set in `app.json`, but nearly every dynamic route push is cast `as any` — e.g. `router.push("/(routes)/products" as any)`, `router.push(\`/(routes)/order-details/${order.id}\` as any)` — which defeats the point of the feature and violates this repo's own "no `as any`" rule.
- Auth gating is copy-pasted per screen (`if (!user) return <NotLoggedInView/>`) independently in `checkout`, `my-orders`, `shipping`, `profile`, and folded into `cart.tsx`'s CTA-label logic — no shared guard component or route-group-level check.
- `app/_layout.tsx`'s root `<Stack>` explicitly lists only 4 screens (`index`, `(routes)/login/index`, `(tabs)`, `+not-found`) even though 19 more `(routes)` screens exist and are pushed to at runtime. This works (expo-router auto-registers file-based routes) but the explicit list reads as vestigial — unclear why only login was special-cased.
- Back navigation is consistently `router.back()`.

# State & Data Fetching

- react-query is used broadly and consistently for server data, with sensible global defaults (`config/providers.tsx`: 5 min staleTime, 15 min gcTime, retry 1, refetch-on-focus/reconnect/mount all disabled).
- Query keys are ad hoc rather than key-factory-based: similarly-shaped queries (home products, category products) build their key arrays with different orderings/field sets, making cache invalidation reasoning harder as more screens are added.
- Loading states duplicate the same visual idea with different implementations per screen; several ("messages.tsx", "notifications/index.tsx", "settings/index.tsx", "payment/index.tsx") wrap a static `Ionicons name="refresh"` icon in `<View className="animate-spin">` — NativeWind's `animate-spin` is a web/CSS-animation utility with no equivalent continuous native driver wired up here, so these likely render as **static, non-spinning icons** on iOS/Android while claiming to be spinners.
- Optimistic updates are used well for chat send and cart quantity changes, but the websocket send in `chat/[id].tsx` has no ack/error handling — a message can show as "sent" in the UI with no confirmation it was ever delivered, and no rollback path if the send silently fails.
- No offline handling anywhere: no `NetInfo`/connectivity-aware retry or queueing (confirmed no `@react-native-community/netinfo` dependency).
- Persistence layering is correct: SecureStore for tokens/user/device-id, AsyncStorage (via zustand persist) for cart/wishlist/address/coupon/delivery-slot/settings.
- "Delete Account" (`settings/index.tsx`) only clears local `AsyncStorage` — no backend deletion call exists (see Executive Summary).

# Performance & Rendering

- FlatList is used correctly, with `keyExtractor`, `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews` set, in `products/index.tsx`, `category/[slug]/index.tsx`, `shop/[id]/index.tsx`.
- But the home tab, cart, wishlist, messages, my-orders, and notifications all render their item lists via `.map()` inside a plain `ScrollView` — no virtualization for lists that can grow (orders, notifications, conversations, cart lines).
- `expo-image` is a declared dependency and is imported nowhere (confirmed by grep) — every image in the app uses the plain RN `Image` component, losing the caching/perf benefits the dependency exists for.
- Animation libraries are split with no consistent choice: RN's legacy `Animated` (`animated-splash-screen.tsx`, `order-confirmation`'s success-check animation, `signup-otp.tsx`'s floating bubbles) vs. `react-native-reanimated` (`order-tracker.tsx`, `HelloWave.tsx`) for equivalent-complexity effects, despite `reanimated`/`react-native-worklets` already being dependencies.
- `order-tracker.tsx`'s `DeliveryMap` recomputes an entire synthetic SVG scene (traffic-easing curve, mishap-schedule lookup, path interpolation) on a `setInterval` every 5 seconds on the JS thread — real, recurring computation cost spent on a simulated feature (see Executive Summary).
- Inline arrow functions/object literals as props are the norm across list-row renderers (`ProductCard`, order rows) with no `useCallback`/`useMemo`/`React.memo` — not yet a visible problem at current data volumes, but will be as catalogs/order history grow.

# Dependency Review

- `@stripe/stripe-react-native` — installed, EAS/metro-wired (with a now-broken web stub), unreachable from any live screen. Either finish wiring it or remove it.
- `expo-image` — declared, never used.
- `@repo/zod-schema` (workspace package) — not a dependency of `apps/mobile` at all, despite the exact-domain overlap described above.
- `rn-emoji-selector` — imported from its internal `rn-emoji-selector/dist/data` path (`chat/[id].tsx`) rather than a public export — fragile coupling that can break on a patch bump.
- No circular imports found among mobile's own files.
- No package-boundary violations: mobile does not reach into other apps' or non-public package internals.
- Path alias `@/*` is defined once in `tsconfig.json` and relies on Expo's default babel resolution (no explicit `module-resolver` config in `babel.config.js`) — consistent, no divergence observed between the two.

# Expo & Native Configuration

- `app.json` is fully static (no `app.config.ts`), `newArchEnabled: true`, `typedRoutes: true`, Android `edgeToEdgeEnabled: true` — modern, SDK-54-consistent baseline.
- No `ios.bundleIdentifier` key present in `app.json` (only `ios.supportsTablet` is set) — iOS builds must be getting this from EAS project settings outside the repo; worth confirming it's actually configured somewhere, since it's invisible from source.
- Naming mismatch across identifiers: app name "FishStudio", slug `"Eshop"`, Android package `com.vibhuxyz.Eshop` — three different names for the same app, suggesting a rename that was never fully propagated.
- `expo-location`'s permission plugin is scoped to one real feature (`add-address`'s "use my current location") — correctly minimal.
- No `expo-updates`/OTA channel strategy configured — updates rely entirely on EAS builds. Not necessarily wrong at this size, but worth a deliberate decision rather than an omission.
- `ios.supportsTablet: true` is set, but no screen has tablet/responsive layout — all width math is done via a one-time `Dimensions.get("window")` snapshot rather than `useWindowDimensions` (the one exception is `signup-otp.tsx`), so rotation/split-view wouldn't reflow properly on iPad.
- `eas.json` build profiles (development/preview/preview-compact/preview-aab/production) look reasonable and cover the common cases; each hardcodes the same three production URLs independently rather than referencing one source (see Configuration).

# Configuration

- Secret exposure via `EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY` — see Executive Summary. This is the standout finding of the whole audit.
- The production API host `https://api.fishstudio.in` is hardcoded independently in 4 places: `utils/axiosInstance.tsx` (`PRODUCTION_API_BASE_URL` fallback), `hooks/useLiveOrder.ts` (wss fallback), `context/web-socket.context.tsx` (wss fallback), and `eas.json`'s per-profile `env` blocks — four copies to keep in sync if it ever changes.
- Placeholder contact/links never replaced: `settings/index.tsx`'s "Rate App" opens `https://apps.apple.com/app/your-app-id` / `.../details?id=your.app.id`; Privacy Policy/Terms open `https://yourwebsite.com/privacy-policy` / `.../terms-conditions` — literal template placeholders, while `login/index.tsx` correctly links to the real `fishstudio.app/terms`.
- Hardcoded placeholder WhatsApp number `919999999999` appears in both `app/(tabs)/index.tsx` and `app/(tabs)/profile.tsx`.
- `settings/index.tsx`'s default settings hardcode `currency: "USD ($)"` and `language: "English (US)"` for an India-only, ₹/+91 app — and neither field is actually editable anywhere in the Settings UI; they're dead defaults.
- No feature-flag mechanism anywhere in the codebase.
- `README.md` is present but empty — no setup/env documentation for a new engineer joining the mobile app.

# Error Handling

- No React error boundary anywhere in the app — a render-time crash in any screen has no fallback UI; `app/_layout.tsx` provides no catch-all.
- No crash-reporting integration (no Sentry or equivalent) in `package.json` or source — production crashes are invisible to the team.
- Error normalization is inconsistent: `signup/index.tsx` and `signup-otp/index.tsx` (the dead flow, ironically) have genuinely good status-code-branching error handling into typed `Error` objects; most live screens instead do ad hoc `error.response?.data?.message || "generic fallback"` per call site with no shared helper.
- Multiple fully silent `catch` blocks with no logging at all (several in `cart.tsx`, `address-modal.tsx`'s background resolution) — real errors there are invisible even in development.
- No custom error classes/types anywhere; relies entirely on axios's `isAxiosError` plus raw string message checks.

# Logging

- Plain `console.*` throughout, no shared logger, no log levels, no production stripping — several logs carry decorative emoji that read as debug scaffolding left in place (`utils/auth.ts`, `app/index.tsx`).
- The one "analytics" mechanism in the app (`sendKafkaEvent`) is dead in practice (see Executive Summary) — there is currently no working product-analytics signal from the mobile client at all.
- No request/correlation IDs anywhere, so a given user's issue can't be traced across API calls even if logs were captured centrally (they aren't).

# Type Safety

- `tsconfig.json` sets `strict: true` — good baseline, actively undermined elsewhere.
- `any` is pervasive: `product: any`, `order.items?.map((item: any) => ...)`, `(item as any)`, handler params like `handleAddToCart = (product: any) =>`, `renderProductItem = ({ item }: { item: any })` — this directly violates the project's own CLAUDE.md §3 rule, repeated across nearly every screen and component that touches API data.
- Typed routes are declared (`app.json`'s `experiments.typedRoutes`) but routinely bypassed with `as any` on `router.push`/`router.replace` calls to dynamic paths.
- Hand-rolled interfaces are duplicated instead of shared (`Order`/`OrderItem` ×3, `Conversation` ×2) — directly downstream of `@repo/zod-schema` not being used for inferred types.

# Accessibility & i18n

- No `accessibilityLabel`/`accessibilityRole` found on any interactive element in any file read — icon-only touchables (header's notification/cart icons, close buttons, back buttons across every screen) have no accessible label.
- Touch targets are mostly reasonable (40×40/44×44) but several icon buttons are smaller (28–30px) without `hitSlop` — a few screens do add `hitSlop` (cart's trash icon) but it's not consistent.
- No dynamic font-scaling consideration; heavy reliance on `numberOfLines` truncation that would clip harder at larger accessibility text sizes.
- No i18n library anywhere (no `i18next`/`expo-localization` string catalog) — all strings are hardcoded English. Reasonable for a single-market app today, a real blocker if the team ever expands beyond India.
- No RTL handling.
- Safe-area handling via `react-native-safe-area-context`'s `SafeAreaView` is applied consistently and correctly across screens — a genuine strength.

# Dead Code

- **Entire unreachable route screens** (verified via grep — nothing routes to any of them): `(routes)/signup`, `(routes)/signup-otp`, `(routes)/forgot-password`, `(routes)/change-password`, `(routes)/payment`.
- **Unused shared components**: `components/shared/location-modal.tsx`, `components/home/banner.tsx`, `components/home/announcement-banner.tsx`, `components/cards/shop.card.tsx`.
- **Unused default-Expo-template scaffolding**: `components/ThemedText.tsx`, `ThemedView.tsx`, `Collapsible.tsx`, `HelloWave.tsx`, `ExternalLink.tsx`, `ParallaxScrollView.tsx`, `HapticTab.tsx`, `components/ui/IconSymbol.tsx` + `.ios.tsx`, `components/ui/TabBarBackground.tsx` + `.ios.tsx` — reachable only through the also-barely-used default `+not-found.tsx`.
- **Unused hooks**: `hooks/useWeightBasedPrice.ts` (the "correct" pricing abstraction, unused in favor of duplicated inline logic), `hooks/useUnreadMessages.ts`.
- **Unused design tokens**: `constants/theme.ts` (0 imports), `constants/Colors.ts` (used only by the dead template chain).
- **Broken reference**: `metro.config.js` points at `stubs/stripe-react-native.js`, which is absent from the current working tree.
- **Empty no-op export**: `components/order-tracker.tsx` ends with `const styles = StyleSheet.create({}); export { styles };`, kept "for consistency with web" per its own comment.
- `scripts/reset-project.js` — harmless default Expo CLI boilerplate, irrelevant post-setup.

# Scalability

- The current shape (no API layer, `any`-typed responses, no error boundary, three competing styling systems, several duplicated business-logic blocks) gets materially harder to extend as more screens are added — every new screen currently re-derives its own fetch/loading/error/status-config boilerplate instead of reusing one.
- No feature-based modularization (`features/cart`, `features/orders`, etc.) — the flat technical-layer structure (components/hooks/lib/store) is workable at this size, but the cross-cutting duplication already observed (Order interfaces, STATUS_CONFIG, `normalizeSlug`, per-kg pricing) is the direct symptom of that structure not being paired with shared feature modules.
- A larger team would immediately collide on styling convention (inline vs. NativeWind vs. StyleSheet) with nothing documented to point to.
- Hardcoded ₹/+91/en-IN assumptions throughout mean any multi-country expansion touches dozens of files individually — no central locale/currency config exists despite `constants/theme.ts` having the scaffolding for one (unused).

# Human Code Quality

- Two distinct authorship eras are visible: (a) a polished, fish-domain-specific, `#5A2C96`/₹-consistent layer built with real "why" comments (home, cart, checkout, product detail, order tracking/confirmation, `axiosInstance.tsx`, the zustand stores), and (b) an earlier generic e-commerce scaffold (clothing-filtered `products/index.tsx`, `$`-priced shop/wishlist screens, the entire dead password-based auth flow, the dead Stripe screen, the dead `LocationModal`) that was never migrated or removed once (a) was built on top of it.
- `order-tracker.tsx`'s simulated live-tracking system is the single strongest "not how a real shipped feature works" signal in the codebase — it is *more* elaborately engineered (traffic curves, mishap schedules, scripted rider quotes) than a real GPS integration would need to be, spent entirely on looking real rather than being real.
- Comment quality in the newer files is genuinely good and matches this repo's own CLAUDE.md guidance (why, not what) — `axiosInstance.tsx`'s refresh-token rotation note, `useLiveOrder.ts`'s WS reconnect comments, `delivery-slots.ts`'s cross-screen-consistency note. This isn't a uniformly machine-generated codebase; it's an inconsistent one, and the inconsistency is itself human — multiple people/passes without reconciliation, rather than one uniform hand or one uniform generator.

# Prioritised Fixes

1. Remove the `EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY` client-side upload path — move it behind the backend.
2. Decide the fate of the fake order-tracker simulation — either wire it to real driver location or stop presenting it as live tracking.
3. Delete or finish the dead auth flow (`signup`, `signup-otp`, `forgot-password`, `change-password`) and the dead payment flow (`payment/index.tsx` + Stripe dependency + web stub).
4. Fix `sendKafkaEvent`'s always-null `location` parameter so cart/wishlist analytics actually fire, or remove the dead instrumentation.
5. Make "Delete Account" actually call a backend deletion endpoint.
6. Reconcile the three color-token systems onto one (`constants/theme.ts`, adopted for real, is the strongest candidate).
7. Adopt `@repo/zod-schema` for validation and response typing; stop hand-duplicating `Order`/`OrderItem`/status-config across screens.
8. Extract the duplicated per-kg pricing logic into `utils/pricing.ts` and have `product/[id]/index.tsx` + `add-to-cart-modal.tsx` both call it (or adopt the already-written, currently-unused `useWeightBasedPrice` hook).
9. Remove the redundant second WebSocket connection (`useLiveOrder.ts` vs. `context/web-socket.context.tsx`).
10. Replace pervasive `any` with real types; stop casting `router.push(... as any)` given `typedRoutes` is already enabled.

# TODO Checklist

- [ ] 🔴 `app/(tabs)/profile.tsx:88` Stop sending `EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY` as a client-side Basic-Auth credential to ImageKit — any `EXPO_PUBLIC_*` value ships inside the bundle and is extractable from the shipped app; route uploads through the backend instead.

- [ ] 🔴 `app/(routes)/settings/index.tsx` `handleDeleteAccount` only clears local `AsyncStorage` and never calls a backend deletion endpoint — the account is not actually deleted server-side despite the UI claiming so.
- [ ] 🔴 `store/index.tsx` `sendKafkaEvent` never fires because every call site (`cart.tsx`, `product/[id]/index.tsx`, `product.card.tsx`, `products.tsx`, `wishlist.tsx`) passes `location` as `null`, and the guard requires it truthy — add-to-cart/wishlist analytics have always been dead. Fix the guard/call sites or remove the dead instrumentation.
- [ ] 🔴 `app/(routes)/signup/index.tsx`, `signup-otp/index.tsx`, `forgot-password/index.tsx`, `change-password/index.tsx` Delete or finish this entire unreachable email+password+OTP auth flow — no screen routes to any of them; it conflicts with the live phone-OTP flow in `login/index.tsx`.
- [ ] 🔴 `app/(routes)/payment/index.tsx` + `@stripe/stripe-react-native` + `metro.config.js` web-stub wiring Delete or wire up this entire unreachable Stripe checkout — `checkout/index.tsx` places orders through a completely different path and never uses it.
- [ ] 🔴 `metro.config.js:20` References `stubs/stripe-react-native.js`, which no longer exists in the working tree — web bundling of `@stripe/stripe-react-native` will fail until this is resolved (resolves itself if the Stripe screen/dependency above is removed).
- [ ] 🟠 `constants/theme.ts` vs `tailwind.config.js`/`constants/Colors.ts` vs. 25 files hardcoding `#5A2C96` Pick one primary-purple source of truth — `product/[id]/index.tsx`, `cart.tsx`, `my-orders/index.tsx`, `order-confirmation/[id]/index.tsx`, `add-to-cart-modal.tsx` currently render two different purples in the same screen.
- [ ] 🟠 `app/(routes)/product/[id]/index.tsx`, `components/home/add-to-cart-modal.tsx` Extract the duplicated per-kg pricing math (`cuttingCharge`/`sizeMultiplier`/`ratePerKg`) into `utils/pricing.ts`, or switch both call sites to the already-written but unused `hooks/useWeightBasedPrice.ts`.
- [ ] 🟠 `hooks/useLiveOrder.ts` vs `context/web-socket.context.tsx` Two independent WebSocket connections both listen for `ORDER_STATUS_UPDATE` on the same endpoint — consolidate into one connection.
- [ ] 🟠 `app/(routes)/my-orders/index.tsx`, `order-details/[id]/index.tsx`, `order-confirmation/[id]/index.tsx` Extract the duplicated `Order`/`OrderItem` interfaces and `STATUS_CONFIG` map into one shared module (or the inferred type from `@repo/zod-schema`'s `order.schema.ts`).
- [ ] 🟠 `app/(routes)/category/[slug]/index.tsx`, `components/home/category-row.tsx` Extract the duplicated `normalizeSlug()` helper into a shared util.
- [ ] 🟠 Adopt `@repo/zod-schema` (add as a dependency, import schemas) for form validation and API response typing across the app instead of hand-rolled interfaces and manual `if (!field)` checks.
- [ ] 🟠 Replace `any` with real types across product/order/coupon handling (`product: any`, `(item as any)`, `{ item: any }` render props) — direct CLAUDE.md §3 violation, repeated across most screens.
- [ ] 🟠 Remove `as any` casts on `router.push(...)`/`router.replace(...)` now that `experiments.typedRoutes` is enabled in `app.json` — currently bypassed almost everywhere it's used with a dynamic path.
- [ ] 🟠 Add a root-level React error boundary in `app/_layout.tsx` — no fallback UI exists anywhere for a render-time crash.
- [ ] 🟠 Add crash reporting (Sentry or equivalent) — no integration exists; production crashes are currently invisible.
- [ ] 🟡 `app/(routes)/settings/index.tsx` Replace placeholder links (`your-app-id`, `your.app.id`, `yourwebsite.com/privacy-policy`, `.../terms-conditions`) with the real fishstudio.app/fishstudio.in URLs already used correctly in `login/index.tsx`.
- [ ] 🟡 `app/(tabs)/index.tsx`, `app/(tabs)/profile.tsx` Replace the hardcoded placeholder WhatsApp number `919999999999` with the real business number.
- [ ] 🟡 `app/(routes)/products/index.tsx` Replace the generic clothing categories/sizes/colors filter UI with fish/meat-relevant filters (or remove filtering until it's built for the real domain).
- [ ] 🟡 `app/(tabs)/wishlist.tsx`, `app/(routes)/shop/[id]/index.tsx` Fix `$` pricing to ₹, and swap `bg-blue-600` for the app's actual primary token to match the rest of the app.
- [ ] 🟡 `app/(tabs)/profile.tsx` Remove the hardcoded fake "•••• 4242 VISA" payment card and the Lorem-ipsum "Have a party order?" copy.
- [ ] 🟡 `hooks/useUser.tsx` Centralize user/session state (context or react-query) instead of independent local-state copies per mount — `updateUserData()` currently doesn't propagate to other mounted consumers.
- [ ] 🟡 `utils/axiosInstance.tsx`, `hooks/useLiveOrder.ts`, `context/web-socket.context.tsx`, `eas.json` Consolidate the 4 independently hardcoded copies of `https://api.fishstudio.in` into one config source.
- [ ] 🟡 Add a shared logger and strip `console.*` from production builds (no `transform-remove-console` or equivalent currently configured in `babel.config.js`).
- [ ] 🟡 `app/(tabs)/index.tsx`, `cart.tsx`, `wishlist.tsx`, `messages.tsx`, `my-orders/index.tsx`, `notifications/index.tsx` Switch `.map()`-inside-`ScrollView` list rendering to `FlatList`/`FlashList` for lists that can grow (orders, notifications, conversations, cart lines).
- [ ] 🟡 Replace `expo-image` non-usage: either start using it (it's already a dependency) for product/avatar images, or remove the dependency.
- [ ] 🟡 Standardize on one animation library (`react-native-reanimated`, already a dependency) instead of mixing it with RN's legacy `Animated` API across different screens.
- [ ] 🟡 Add `accessibilityLabel`/`accessibilityRole` to icon-only touchables (header notification/cart icons, back/close buttons) across all screens.
- [ ] 🟢 `components/shared/location-modal.tsx`, `components/home/banner.tsx`, `components/home/announcement-banner.tsx`, `components/cards/shop.card.tsx` Remove — confirmed unused anywhere.
- [ ] 🟢 `components/ThemedText.tsx`, `ThemedView.tsx`, `Collapsible.tsx`, `HelloWave.tsx`, `ExternalLink.tsx`, `ParallaxScrollView.tsx`, `HapticTab.tsx`, `components/ui/IconSymbol*.tsx`, `components/ui/TabBarBackground*.tsx` Remove default Expo template scaffolding — unused outside the barely-relevant `+not-found.tsx`.
- [ ] 🟢 `hooks/useWeightBasedPrice.ts`, `hooks/useUnreadMessages.ts` Remove if not adopted per the pricing-duplication fix above; otherwise wire them in.
- [ ] 🟢 `constants/Colors.ts` Remove if `constants/theme.ts` becomes the adopted single source of truth (see color-token fix above).
- [ ] 🟢 `components/order-tracker.tsx` Remove the empty no-op `const styles = StyleSheet.create({}); export { styles };` at the end of the file.
- [ ] 🟢 `app.json` Add `ios.bundleIdentifier` explicitly (currently only inferable from EAS project settings, not visible in source); reconcile the app name/slug/package mismatch (`FishStudio` / `Eshop` / `com.vibhuxyz.Eshop`).
- [ ] 🟢 `README.md` Fill in — currently an empty file, no setup/env documentation for the mobile app.
- [ ] 🟢 `app/(routes)/settings/index.tsx` Remove the dead `currency`/`language` default-settings fields that are never surfaced in any UI control.

# Completed Changes

None yet — this is the initial audit pass.
