import { describe, expect, it } from "vitest";

import { generateUserInviteSchema } from "@/modules/usuarios/schemas/generate-user-invite.schema";

describe("generateUserInviteSchema", () => {
  it("aceita role valida", () => {
    const parsed = generateUserInviteSchema.parse({ role: "STAFF" });

    expect(parsed.role).toBe("STAFF");
  });

  it("rejeita role invalida", () => {
    const result = generateUserInviteSchema.safeParse({ role: "INVALID" });

    expect(result.success).toBe(false);
  });
});
