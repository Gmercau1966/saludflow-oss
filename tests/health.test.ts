import { describe, expect, it } from "vitest";
import { getHealthPayload } from "../src/lib/health";

describe("health payload", () => {
  it("devuelve el contrato foundation esperado", () => {
    expect(getHealthPayload()).toEqual({
      status: "ok",
      service: "saludflow-oss",
      mode: "foundation",
    });
  });
});
