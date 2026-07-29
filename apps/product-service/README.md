# product-service

Product catalog, storefront, cart validation, banners, categories, coupons,
seller events, reviews, and search (Meilisearch + MongoDB fallback) for the
fishStudio platform. Also runs the hourly cron that hard-deletes products
past their soft-delete grace period.

To install dependencies (run from the repo root):

```bash
bun install
```

To run in development:

```bash
bun run dev
```

To build and start:

```bash
bun run build
bun run start
```

## Environment variables

See `env.example`. In addition to `PRODUCT_SERVICE_PORT`, this service reads
`MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, `CLOUDINARY_FOLDER`, and
`ACCESS_TOKEN_JWT_SECRET_KEY` (the last is used to optionally identify a
logged-in user on public endpoints like view-tracking and recommendations).
