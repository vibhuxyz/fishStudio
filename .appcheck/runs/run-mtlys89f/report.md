# AppCheck Report — fishStudio

## Run

- Profile: boot only — the app did not become reachable
- Seed: `run-mtlys89f`
- Boot level: L1
- Data: 

## Plan

- Source: planner-llm (1 model call)
- Scenarios: Customer Product Discovery and Checkout (65%) · Seller Order and Inventory Management (25%) · Delivery Staff Order Dispatch (10%)
- A product must be in stock before order creation via /create-razorpay-order
- Seller must accept an order before rider assignment or delivery dispatch
- Orders must be marked picked up via /staff/mark-picked-up/:orderId before being marked delivered via /staff/mark-delivered/:orderId

## Validity

Control workload stayed flat throughout. Results are application-bound; no host saturation in the measured range.

## Measured

P50 0ms · P95 0ms · P99 0ms · 0 requests · 0 errors

## Findings

## Not measured this run

- everything that needs a running app — the app rejected its environment on boot — a required variable is missing. copy the missing keys from .env.example into a local .env, or set `env` in the config
- missing-index / EXPLAIN / verified proof — Postgres-only in the MVP
- data-volume findings — no Mongoose schema and the API seed did not populate anything.

---

> Understand the application. Model realistic behaviour. Simulate it safely. Measure the whole system. Prove what broke. Explain why. Say clearly what you did not measure.