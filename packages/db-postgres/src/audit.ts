import { Prisma } from "../prisma/generated-client/index.js";
import { prismaPostgres } from "./client.js";

// Fire-and-forget: the audit trail must never block or fail the request that
// produced it. Failures are logged with enough context to backfill manually.
export function writeAuditLog(
  entityType: string,
  entityId: string,
  action: string,
  actorId: string | null,
  actorType: string,
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
