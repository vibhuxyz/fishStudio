# @repo/zod-schema

Shared zod validation schemas and their inferred TypeScript types for the fishStudio backend services (auth, product, order, store, coupon, notification, payment, etc.) and any app that needs matching request/response types.

## Usage

```ts
import { loginSchema, validate } from "@repo/zod-schema";

const input = validate(loginSchema, req.body); // throws ValidationError on failure
```

Types can be imported directly, or inferred from a schema with `z.infer<typeof someSchema>`.

`./types` also exports plain (non-zod) interfaces for read-model shapes that don't have a corresponding input schema, such as `Product`/`BackendProduct` (storefront) and the admin/seller dashboard types.

## Structure

- `src/schemas/` — one file per domain (`auth`, `product`, `order`, `store`, `category`, `coupon`, `event`, `banner`, `image`, `notification`, `payment`).
- `src/types/` — hand-written interfaces for shapes not backed by a zod schema.
- `src/index.ts` — public entry point: re-exports schemas/types and the `validate()` helper.

## Build

```bash
bun run build   # tsup, outputs to dist/
bun run dev     # tsup --watch
```
