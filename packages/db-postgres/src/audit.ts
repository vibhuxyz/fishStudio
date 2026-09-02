import {
  Prisma,
  type ActorType,
  type AuditEntityType,
} from "../prisma/generated-client/index.js";
import { prismaPostgres } from "./client.js";

/**
 * The action vocabulary. Kept as a TypeScript union against a `String` column
 * rather than a Postgres enum: audit actions are added every time a new event
 * is instrumented, and an enum would make each one a schema migration. This
 * catches the typo at the call site, which is where it would actually happen.
 */
export type AuditAction =
  | "ORDER_CREATED"
  | "ORDER_CANCELLED_BY_USER"
  // Customer chose Cash on Delivery after their online payment failed.
  | "ORDER_COD_CONVERSION_REQUESTED"
  | "COUPON_APPLIED"
  | "STOCK_RESERVED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_FAILED"
  | "PAYMENT_AMOUNT_MISMATCH"
  | "PAYMENT_ORDER_MISMATCH"
  | "PAYMENT_SIGNATURE_MISMATCH"
  | "PAYMENT_ON_CANCELLED_ORDER"
  // Checkout was created but the customer never attempted a payment, and the
  // reconcile sweep closed it out. Not a failure — nothing to investigate.
  | "PAYMENT_ABANDONED"
  | "REFUND_INITIATED"
  | "REFUND_PROCESSED"
  | "REFUND_FAILED"
  | "REFERRAL_REWARDED";

// Fire-and-forget: the audit trail must never block or fail the request that
// produced it. Failures are logged with enough context to backfill manually.
export function writeAuditLog(
  entityType: AuditEntityType,
  entityId: string,
  action: AuditAction,
  actorId: string | null,
  actorType: ActorType,
  metadata?: Prisma.InputJsonObject,
) {
  prismaPostgres.auditLog
    .create({
      data: { entityType, entityId, action, actorId, actorType, metadata: metadata ?? {} },
    })
    .catch((err: unknown) =>
      console.error(`[AuditLog] write failed (${entityType}/${entityId} ${action}):`, err),
    );
}
