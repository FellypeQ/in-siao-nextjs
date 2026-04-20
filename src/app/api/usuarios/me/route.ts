import { requireAuthSessionForApi } from "@/lib/require-auth-session";
import { updateMyProfileSchema } from "@/modules/usuarios/schemas/update-my-profile.schema";
import { getMyProfileService } from "@/modules/usuarios/services/get-my-profile.service";
import { updateMyProfileService } from "@/modules/usuarios/services/update-my-profile.service";
import { toErrorResponse } from "@/shared/errors/app-error";

export async function GET() {
  try {
    const session = await requireAuthSessionForApi();
    const perfil = await getMyProfileService(session.sub);

    return Response.json({ success: true, perfil });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuthSessionForApi();
    const body = await request.json();
    const parsed = updateMyProfileSchema.safeParse(body);

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

    await updateMyProfileService(session.sub, parsed.data);

    return Response.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}