import type { PermissionKey } from "@/shared/constants/permissions";

export type PerfilPublic = {
  id: string;
  nome: string;
  permissions: PermissionKey[];
  createdAt: Date;
  updatedAt: Date;
};

export type PerfilListItem = {
  id: string;
  nome: string;
  permissionsCount: number;
  usersCount: number;
};
