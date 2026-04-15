import type { SessionPayload } from "@/lib/auth";
import type { PermissionKey } from "@/shared/constants/permissions";

export function hasPermission(
  session: SessionPayload,
  permission: PermissionKey,
): boolean {
  if (session.role === "ADMIN") {
    return true;
  }

  return session.permissions.includes(permission);
}
