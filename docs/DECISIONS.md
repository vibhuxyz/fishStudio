# Architecture Decision Records (ADR)

*Real engineering teams use ADRs to document the "why" behind big technical choices so future developers don't blindly undo them.*

---

## 1. Search Engine for MVP

**Decision:** Use MongoDB Regex search + Frontend Debouncing for the initial launch, rather than self-hosting Meilisearch immediately.

**Why we chose it:** It saves infrastructure costs and reduces moving parts during the critical launch window. Our product catalog is small enough (<5000 products) that MongoDB will perform almost identically in speed.

**Alternatives considered:** Self-hosting Meilisearch on our existing VPS or using Meilisearch Cloud.

**Trade-offs:** We lose typo-tolerance initially (e.g., searching "Slamon" won't return "Salmon").

**When we might change it in the future:** When our catalog grows beyond 10,000 variants or we see metrics showing high search failure rates due to typos.

---

## 2. Universal 4-Digit OTPs

**Decision:** Generate 4-digit OTPs universally across all roles (Users, Admins, Sellers) rather than 6-digits for elevated roles.

**Why we chose it:** Provides a uniform UI experience and faster login UX across all platforms, simplifying the frontend validation logic.

**Alternatives considered:** 6-digits for admins/sellers for slightly increased brute-force resistance.

**Trade-offs:** Slightly lower keyspace for admin brute forcing (mitigated by rate limiting).

**When we might change it in the future:** If a security audit mandates stricter access controls for administrative dashboards.
