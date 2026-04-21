import { requireMasterSessionForApi } from "@/lib/require-master-session";
import { createPerfilSchema } from "@/modules/perfis/schemas/create-perfil.schema";
import { createPerfilService } from "@/modules/perfis/services/create-perfil.service";
import { listPerfisService } from "@/modules/perfis/services/list-perfis.service";
import { toErrorResponse } from "@/shared/errors/app-error";

export async function GET() {
  try {
    await requireMasterSessionForApi();
    const perfis = await listPerfisService();

    return Response.json({ success: true, perfis });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireMasterSessionForApi();
    const body = await request.json();
    const parsed = createPerfilSchema.safeParse(body);

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

    const perfil = await createPerfilService(parsed.data);

    return Response.json({ success: true, perfil }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
