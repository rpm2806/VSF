import { db } from "@/lib/db"

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  details
}: {
  userId?: string | null
  action: string
  entityType: string
  entityId: string
  details?: string
}) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details,
      }
    })
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error)
  }
}
