import { validateUserInviteService } from "@/modules/usuarios/services/validate-user-invite.service";
import { toErrorResponse } from "@/shared/errors/app-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json({ success: true, valid: false });
    }

    const result = await validateUserInviteService(token);

    if (!result.valid) {
      return Response.json({ success: true, valid: false });
    }

    return Response.json({ success: true, valid: true, role: result.role });
  } catch (error) {
    return toErrorResponse(error);
  }
}
