# Notification Service

Handles multi-channel notification dispatch (in-app, email, SMS, push) and OTP delivery for the platform.

## Architecture

- **Consumer-driven**: Listens on RabbitMQ queues (`NOTIFICATION_QUEUE`, `OTP_QUEUE`) for async notification/OTP events published by other services.
- **HTTP API**: Exposes authenticated endpoints for users to read and manage their in-app notifications.
- **Multi-channel dispatch**: Routes notifications through in-app (Postgres), email, SMS, and push (stub) channels.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/notifications` | Required | List user's notifications (latest 50) |
| `PATCH` | `/api/notifications/:id/read` | Required | Mark a single notification as read |
| `PATCH` | `/api/notifications/read-all` | Required | Mark all notifications as read |

## Queue Contracts

### `NOTIFICATION_QUEUE`
```json
{
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "INFO | SUCCESS | WARNING | ERROR",
  "category": "ORDER | SYSTEM | PROMO | ...",
  "metadata": {},
  "channels": ["IN_APP", "EMAIL", "SMS", "PUSH"]
}
```

### `OTP_QUEUE`
```json
{
  "userType": "user | seller | admin",
  "name": "string",
  "email": "string (optional)",
  "phone_number": "string (optional)",
  "template": "string (optional)",
  "otp": "string"
}
```

## Setup

```bash
# From monorepo root
bun install

# Run in dev mode
cd apps/notification-service
bun run dev
```

## Environment Variables

See `env.example` for required configuration.
