import { requireAdminSessionForApi } from "@/lib/require-admin-session";
import { listUsuariosService } from "@/modules/usuarios/services/list-usuarios.service";
import { toErrorResponse } from "@/shared/errors/app-error";

export async function GET() {
  try {
    await requireAdminSessionForApi();
    const usuarios = await listUsuariosService();

    return Response.json({ success: true, usuarios });
  } catch (error) {
    return toErrorResponse(error);
  }
}
