import { describe, expect, it } from "vitest";

import { updateVisitanteSchema } from "@/modules/visitantes/schemas/update-visitante.schema";

describe("updateVisitanteSchema", () => {
  it("valida operacoes incrementais", () => {
    const parsed = updateVisitanteSchema.parse({
      id: "member-1",
      name: "Visitante Teste",
      birthDate: "1990-01-01",
      actualChurch: "EVANGELICAL",
      howKnow: "SOCIAL_MEDIA",
      familyOperations: [
        {
          action: "create",
          payload: {
            name: "Novo Familiar",
            birthDate: "2010-01-01",
            relationshipType: "CHILD",
          },
        },
        {
          action: "unlink",
          relationshipId: "rel-1",
        },
      ],
    });

    expect(parsed.familyOperations).toHaveLength(2);
    expect(parsed).not.toHaveProperty("baptized");
  });

  it("ignora baptized enviado indevidamente", () => {
    const parsed = updateVisitanteSchema.parse({
      id: "member-1",
      name: "Visitante Teste",
      birthDate: "1990-01-01",
      baptized: true,
      actualChurch: "EVANGELICAL",
      howKnow: "SOCIAL_MEDIA",
      familyOperations: [],
    });

    expect(parsed).not.toHaveProperty("baptized");
  });

  it("rejeita howKnow OTHER sem resposta", () => {
    const result = updateVisitanteSchema.safeParse({
      id: "member-1",
      name: "Visitante Teste",
      birthDate: "1990-01-01",
      actualChurch: "EVANGELICAL",
      howKnow: "OTHER",
      familyOperations: [],
    });

    expect(result.success).toBe(false);
  });
});
