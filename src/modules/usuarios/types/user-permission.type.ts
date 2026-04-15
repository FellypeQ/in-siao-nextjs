import type { PermissionKey } from "@/shared/constants/permissions";

export type UserPermission = {
  userId: string;
  permission: PermissionKey;
  grantedAt: Date;
};
