import { requireAuthSessionForApi } from "@/lib/require-auth-session";
import { updateMyPasswordSchema } from "@/modules/usuarios/schemas/update-my-password.schema";
import { updateMyPasswordService } from "@/modules/usuarios/services/update-my-password.service";
import { toErrorResponse } from "@/shared/errors/app-error";

export async function PUT(request: Request) {
  try {
    const session = await requireAuthSessionForApi();
    const body = await request.json();
    const parsed = updateMyPasswordSchema.safeParse(body);

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

    await updateMyPasswordService(session.sub, parsed.data);

    return Response.json({ success: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}