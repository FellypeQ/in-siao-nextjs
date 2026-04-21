import { requireAdminSessionForApi } from "@/lib/require-admin-session";
import { generateUserInviteSchema } from "@/modules/usuarios/schemas/generate-user-invite.schema";
import { generateUserInviteService } from "@/modules/usuarios/services/generate-user-invite.service";
import { toErrorResponse } from "@/shared/errors/app-error";

export async function POST(request: Request) {
  try {
    const session = await requireAdminSessionForApi();
    const body = await request.json();
    const parsed = generateUserInviteSchema.safeParse(body);

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

    const requestUrl = new URL(request.url);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? requestUrl.origin;

    const invite = await generateUserInviteService(
      {
        role: parsed.data.role,
        createdById: session.sub,
        appUrl,
      },
      session.role,
    );

    return Response.json(
      {
        success: true,
        token: invite.token,
        link: invite.link,
      },
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
