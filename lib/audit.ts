import {prisma} from "@/lib/prisma";
import type { AuditLog as _AuditLogType } from "@prisma/client";

type LogAuditInput = {
  actorId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
};

export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        meta: input.meta ? JSON.parse(JSON.stringify(input.meta)) : undefined,
      },
    });
  } catch (err) {
    // Never let audit failures break the main flow
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}

/** Extract IP from request — handles X-Forwarded-For for proxy setups */
export function getIp(req: Request): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return undefined;
}
