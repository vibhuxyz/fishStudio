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
- [ ] Implement OpenTelemetry for Distributed Tracing across microservices
- [ ] Deploy Prometheus (Metrics Storage) and Grafana (Dashboards) stack
- [ ] Set up UptimeRobot for Heartbeats on `/gateway-health`

## Phase 3: Advanced Features
- [ ] Build personalized homepage sections using `product_views`
- [ ] Deploy Meilisearch container when catalog scales
