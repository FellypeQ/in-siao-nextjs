import { describe, expect, it } from "vitest";

import { updateUsuarioSchema } from "@/modules/usuarios/schemas/update-usuario.schema";

describe("updateUsuarioSchema", () => {
  it("aceita payload valido", () => {
    const parsed = updateUsuarioSchema.safeParse({
      nome: "Maria",
      sobrenome: "Silva",
      email: "maria@example.com",
      role: "STAFF",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejeita payload sem campos", () => {
    const parsed = updateUsuarioSchema.safeParse({});

    expect(parsed.success).toBe(false);
  });

  it("rejeita role invalida", () => {
    const parsed = updateUsuarioSchema.safeParse({ role: "OUTRO" });

    expect(parsed.success).toBe(false);
  });
});
