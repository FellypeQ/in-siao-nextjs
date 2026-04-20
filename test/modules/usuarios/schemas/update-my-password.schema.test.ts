import { describe, expect, it } from "vitest";

import { updateMyPasswordSchema } from "@/modules/usuarios/schemas/update-my-password.schema";

describe("updateMyPasswordSchema", () => {
  it("aceita senhas validas e coincidentes", () => {
    const parsed = updateMyPasswordSchema.safeParse({
      senhaAtual: "SenhaAtual@123",
      novaSenha: "SenhaNova@123",
      confirmacaoNovaSenha: "SenhaNova@123",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejeita confirmacao diferente da nova senha", () => {
    const parsed = updateMyPasswordSchema.safeParse({
      senhaAtual: "SenhaAtual@123",
      novaSenha: "SenhaNova@123",
      confirmacaoNovaSenha: "OutraSenha@123",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejeita nova senha sem criterios minimos", () => {
    const parsed = updateMyPasswordSchema.safeParse({
      senhaAtual: "SenhaAtual@123",
      novaSenha: "fraca",
      confirmacaoNovaSenha: "fraca",
    });

    expect(parsed.success).toBe(false);
  });
});