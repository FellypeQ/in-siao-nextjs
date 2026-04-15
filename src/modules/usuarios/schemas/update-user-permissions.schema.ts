import { z } from "zod";

import { PERMISSIONS, type PermissionKey } from "@/shared/constants/permissions";

const permissionEnum = z.enum(PERMISSIONS);

export const updateUserPermissionsSchema = z.object({
  permissions: z.array(permissionEnum),
});

export type UpdateUserPermissionsInput = {
  permissions: PermissionKey[];
};

export type UpdateUserPermissionsSchemaInput = z.input<
  typeof updateUserPermissionsSchema
>;
export type UpdateUserPermissionsSchemaOutput = z.output<
  typeof updateUserPermissionsSchema
>;
