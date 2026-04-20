import { describe, expect, it } from "vitest";

import { updateMyProfileSchema } from "@/modules/usuarios/schemas/update-my-profile.schema";

describe("updateMyProfileSchema", () => {
  it("aceita payload valido", () => {
    const parsed = updateMyProfileSchema.safeParse({
      nome: "Maria",
      sobrenome: "Silva",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejeita nome muito curto", () => {
    const parsed = updateMyProfileSchema.safeParse({
      nome: "M",
      sobrenome: "Silva",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejeita sobrenome ausente", () => {
    const parsed = updateMyProfileSchema.safeParse({
      nome: "Maria",
    });

    expect(parsed.success).toBe(false);
  });
});