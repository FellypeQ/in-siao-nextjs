import { requireAdminSessionForApi } from "@/lib/require-admin-session";
import { updateUserPermissionsSchema } from "@/modules/usuarios/schemas/update-user-permissions.schema";
import { loadUserPermissionsService } from "@/modules/usuarios/services/load-user-permissions.service";
import { updateUserPermissionsService } from "@/modules/usuarios/services/update-user-permissions.service";
import { toErrorResponse } from "@/shared/errors/app-error";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await requireAdminSessionForApi();
    const { id } = await params;
    const result = await loadUserPermissionsService(id);

    return Response.json({ success: true, ...result });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminSessionForApi();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserPermissionsSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Dados invalidos",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    await updateUserPermissionsService({
      userId: id,
      profileIds: parsed.data.profileIds,
      manualPermissions: parsed.data.permissions,
    });

    return Response.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
