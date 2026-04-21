import type { SessionPayload } from "@/lib/auth";
import type { PermissionKey } from "@/shared/constants/permissions";

export function hasPermission(
  session: SessionPayload,
  permission: PermissionKey,
): boolean {
  if (session.role === "ADMIN" || session.role === "MASTER") {
    return true;
  }

  return session.permissions.includes(permission);
}
