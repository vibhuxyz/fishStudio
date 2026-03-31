# FishStudio - Premium Meat & Fish E-commerce

FishStudio is a high-performance, modern e-commerce platform built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. It is designed for maximum speed, with a "Native App" feel on the web.

---

## 🚀 Performance Snapshot
We have recently undergone a major architectural overhaul to achieve **0ms perceived load times**.

- **Shell + Stream Architecture**: Content renders as it arrives.
- **Intent-Based Prefetching**: Data is pre-warmed on hover.
- **Optimized Pincode Delivery**: Serviceability is calculated with 6-digit precision.

👉 **Detailed documentation of our optimizations can be found here: [optimize.md](./optimize.md)**

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (App Router), Turbopack
- **UI Components**: Shadcn UI + Framer Motion
- **State Management**: Zustand + TanStack Query (React Query)
- **Backend Services**: Express.js + Prisma (MongoDB)
- **Real-time**: WebSocket (Socket.io) for Order Tracking

---

## 📦 Project Structure
```text
.
├── apps/
│   ├── admin-ui/        # Management dashboard
│   ├── seller-ui/       # Seller/Store operations
│   ├── auth-service/    # Shared authentication logic
│   └── user-ui/         # The main consumer storefront
├── packages/            # Shared libraries (DB, Config, Types)
└── optimize.md          # Performance & UX documentation
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PNPM or NPM (Turbo-enabled)

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

---

## 🔧 Maintenance & Best Practices
For any core UI/UX changes, please refer to the patterns established in `user-ui/app/category` and `user-ui/app/orders` to maintain the streaming integrity of the application.

---

> [!NOTE]
> This repository is optimized for **Turbopack**. Use `npm run dev` for the fastest HMR experience.
