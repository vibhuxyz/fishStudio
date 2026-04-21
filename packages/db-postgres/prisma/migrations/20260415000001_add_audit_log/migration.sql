-- CreateTable: immutable financial audit trail
CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId"   TEXT NOT NULL,
    "action"     TEXT NOT NULL,
    "actorId"    TEXT,
    "actorType"  TEXT,
    "metadata"   JSONB,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx"            ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_entityType_entityId_idx"  ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_actorId_idx"              ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_createdAt_idx"            ON "AuditLog"("createdAt");
