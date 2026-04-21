import { requireAdminSessionForApi } from "@/lib/require-admin-session";
import { updateUsuarioSchema } from "@/modules/usuarios/schemas/update-usuario.schema";
import { getUsuarioService } from "@/modules/usuarios/services/get-usuario.service";
import { softDeleteUsuarioService } from "@/modules/usuarios/services/soft-delete-usuario.service";
import { updateUsuarioService } from "@/modules/usuarios/services/update-usuario.service";
import { toErrorResponse } from "@/shared/errors/app-error";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await requireAdminSessionForApi();
    const { id } = await params;
    const usuario = await getUsuarioService(id);

    return Response.json({ success: true, usuario });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireAdminSessionForApi();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUsuarioSchema.safeParse(body);

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

    await updateUsuarioService({
      id,
      data: parsed.data,
      actorId: session.sub,
      actorRole: session.role,
    });

    const usuario = await getUsuarioService(id);

    return Response.json({ success: true, usuario });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const session = await requireAdminSessionForApi();
    const { id } = await params;

    const result = await softDeleteUsuarioService({
      id,
      actorId: session.sub,
      actorRole: session.role,
    });

    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
