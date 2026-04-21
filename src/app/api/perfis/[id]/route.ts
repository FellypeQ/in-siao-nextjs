import { requireMasterSessionForApi } from "@/lib/require-master-session";
import { updatePerfilSchema } from "@/modules/perfis/schemas/update-perfil.schema";
import { deletePerfilService } from "@/modules/perfis/services/delete-perfil.service";
import { getPerfilService } from "@/modules/perfis/services/get-perfil.service";
import { updatePerfilService } from "@/modules/perfis/services/update-perfil.service";
import { toErrorResponse } from "@/shared/errors/app-error";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await requireMasterSessionForApi();
    const { id } = await params;
    const perfil = await getPerfilService(id);

    return Response.json({ success: true, perfil });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireMasterSessionForApi();
    const { id } = await params;
    const body = await request.json();
    const parsed = updatePerfilSchema.safeParse(body);

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

    const perfil = await updatePerfilService(id, parsed.data);

    return Response.json({ success: true, perfil });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await requireMasterSessionForApi();
    const { id } = await params;
    const result = await deletePerfilService(id);

    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
