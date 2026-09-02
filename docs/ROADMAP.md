# FishStudio Project Roadmap

## Phase 1: MVP Stabilization (Current)
- [x] Fix Admin access code seeding (Hashing)
- [x] Sync OTP lengths across frontend and backend (4-digits)
- [x] Fix rogue login toasts (React state sync)
- [ ] Implement search input debouncing on the frontend
- [ ] Implement infinite scrolling for products on the Home Page (`user-ui`)
- [ ] Complete Razorpay Payment Integration (Rate limiting, Webhooks, Reconciliation)
- [ ] Finalize production database environments (Atlas M10, Neon Pro)

## Phase 2: Production Readiness
- [ ] Put domains behind Cloudflare for DDoS protection
- [ ] Set up an Application Load Balancer
- [x] Replace the `console.log` shim with pino + correlation IDs, shipped to Loki
- [x] Implement OpenTelemetry for Distributed Tracing across microservices (Tempo) — including across the RabbitMQ hop
- [x] Define SLIs and SLOs for checkout, catalogue read and login — with error budgets
- [x] Alertmanager rules on symptoms and error-budget burn, not on raw thresholds
- [x] Deploy Prometheus (Metrics Storage) and Grafana (Dashboards) stack — plus `apps/control-center`, the custom dashboard on top (see DECISIONS.md #3)
- [ ] Set up UptimeRobot for Heartbeats on `/gateway-health`

## Phase 3: Advanced Features
- [ ] Build personalized homepage sections using `product_views`
- [ ] Deploy Meilisearch container when catalog scales
