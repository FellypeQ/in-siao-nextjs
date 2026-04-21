import { z } from "zod";

import { PERMISSIONS, type PermissionKey } from "@/shared/constants/permissions";

const permissionEnum = z.enum(PERMISSIONS);

export const updateUserPermissionsSchema = z.object({
  profileIds: z.array(z.string()),
  permissions: z.array(permissionEnum),
});

export type UpdateUserPermissionsInput = {
  profileIds: string[];
  permissions: PermissionKey[];
};

export type UpdateUserPermissionsSchemaOutput = z.output<
  typeof updateUserPermissionsSchema
>;
