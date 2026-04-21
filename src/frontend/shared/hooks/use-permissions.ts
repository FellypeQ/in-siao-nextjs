"use client";

import { useCallback, useMemo } from "react";

import type { PermissionKey } from "@/shared/constants/permissions";

type UsePermissionsInput = {
  role: "ADMIN" | "STAFF" | "MASTER";
  permissions: string[];
};

export function usePermissions({ role, permissions }: UsePermissionsInput) {
  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  const can = useCallback(
    (permission: PermissionKey) => {
      if (role === "ADMIN" || role === "MASTER") {
        return true;
      }

      return permissionSet.has(permission);
    },
    [permissionSet, role],
  );

  return { can };
}
