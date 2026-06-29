import { afterEach, describe, expect, it, vi } from "vitest";
import { createCaseFromWebForm } from "../src/domain/web-form-intake";
import type { WebFormSubmission } from "../src/domain/types";
import { LocalCaseRepository } from "../src/lib/repositories/local-case-repository";
import { createCaseRepository } from "../src/lib/repositories/factory";

const submission: WebFormSubmission = {
  category: "Cambio de cita",
  subject: "Cambio sintetico de cita",
  description:
    "Solicitud ficticia para cambiar una cita administrativa sin datos personales reales.",
  relatedDate: "2026-08-01",
  declaredPriority: "normal",
  preferredResponseChannel: "portal",
  declaredDocuments: ["formulario de solicitud"],
  syntheticDataConfirmed: true,
};

function installLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    },
  });
}

describe("case repositories", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("el repositorio local crea expedientes sin sobrescribir fixtures", async () => {
    installLocalStorage();
    const repository = new LocalCaseRepository();
    const before = await repository.listCases();
    const created = createCaseFromWebForm(submission);

    await repository.createCase(created);
    const after = await repository.listCases();

    expect(after[0].id).toBe(created.id);
    expect(after.length).toBe(before.length + 1);
  });

  it("el repositorio local actualiza un expediente procesado", async () => {
    installLocalStorage();
    const repository = new LocalCaseRepository();
    const created = createCaseFromWebForm(submission);
    await repository.createCase(created);

    await repository.updateCase({ ...created, status: "completed" });
    const stored = await repository.getCase(created.id);

    expect(stored?.status).toBe("completed");
  });

  it("la factoria usa modo local por defecto", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");

    expect(createCaseRepository().mode).toBe("local");
  });

  it("la factoria exige sesion en modo Supabase", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");

    expect(() => createCaseRepository()).toThrow("sesion anonima activa");
  });
});
