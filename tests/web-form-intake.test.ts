import { describe, expect, it } from "vitest";
import { processCase } from "../src/domain/process-case";
import { createCaseFromWebForm } from "../src/domain/web-form-intake";
import {
  validateWebForm,
  type WebFormInput,
} from "../src/domain/validate-web-form";
import {
  addCaseToState,
  createInitialDemoState,
  parseDemoState,
  resetCaseInState,
  serializeDemoState,
} from "../src/lib/demo-storage";

const validInput: WebFormInput = {
  category: "Cambio de cita",
  subject: "Cambio sintético de cita",
  description:
    "Solicitud ficticia para cambiar una cita administrativa de revisión documental sin datos reales.",
  relatedDate: "2026-07-10",
  declaredPriority: "normal",
  preferredResponseChannel: "portal",
  declaredDocuments: ["formulario de solicitud"],
  syntheticDataConfirmed: true,
};

function validSubmission() {
  const result = validateWebForm(validInput);
  if (!result.valid) {
    throw new Error("Expected valid form");
  }
  return result.data;
}

describe("web form validation and intake", () => {
  it("acepta un formulario correcto", () => {
    const result = validateWebForm(validInput);

    expect(result.valid).toBe(true);
  });

  it("rechaza asunto demasiado corto", () => {
    const result = validateWebForm({ ...validInput, subject: "Corto" });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "subject")).toBe(true);
    }
  });

  it("rechaza descripción demasiado corta", () => {
    const result = validateWebForm({ ...validInput, description: "Muy breve" });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "description")).toBe(true);
    }
  });

  it("bloquea si no se confirma el uso de datos sintéticos", () => {
    const result = validateWebForm({
      ...validInput,
      syntheticDataConfirmed: false,
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some((error) => error.field === "syntheticDataConfirmed"),
      ).toBe(true);
    }
  });

  it("crea expediente desde formulario", () => {
    const caseItem = createCaseFromWebForm(validSubmission());

    expect(caseItem.synthetic).toBe(true);
    expect(caseItem.subject).toBe(validInput.subject);
  });

  it("marca source como web_form", () => {
    const caseItem = createCaseFromWebForm(validSubmission());

    expect(caseItem.source).toBe("web_form");
  });

  it("establece estado inicial pending", () => {
    const caseItem = createCaseFromWebForm(validSubmission());

    expect(caseItem.status).toBe("pending");
  });

  it("genera IDs únicos y legibles", () => {
    const first = createCaseFromWebForm(validSubmission());
    const second = createCaseFromWebForm(validSubmission());

    expect(first.id).toMatch(/^SFO-\d{4}-\d{12}$/);
    expect(first.id).not.toBe(second.id);
  });

  it("crea evento intake_received", () => {
    const caseItem = createCaseFromWebForm(validSubmission());

    expect(caseItem.auditEvents[0]).toMatchObject({
      type: "intake_received",
      actor: "Solicitante demo",
      workflowVersion: "web-form-intake-v0.1",
    });
  });

  it("persiste sin sobrescribir casos existentes", () => {
    const initial = createInitialDemoState();
    const newCase = createCaseFromWebForm(validSubmission());
    const state = addCaseToState(initial, newCase);

    expect(state.cases[0].id).toBe(newCase.id);
    expect(state.cases.length).toBe(initial.cases.length + 1);
  });

  it("se integra con el workflow determinista", () => {
    const caseItem = createCaseFromWebForm(validSubmission());
    const processed = processCase(caseItem);

    expect(processed.analysis).toBeDefined();
    expect(processed.auditEvents.some((event) => event.type === "classification_completed")).toBe(true);
  });

  it("convierte documentos declarados al modelo de dominio", () => {
    const caseItem = createCaseFromWebForm(validSubmission());

    expect(caseItem.documents).toContainEqual(
      expect.objectContaining({
        name: "formulario de solicitud",
        required: true,
        presented: true,
        status: "present",
      }),
    );
  });

  it("serializa y recupera expedientes web sin descartarlos", () => {
    const state = addCaseToState(
      createInitialDemoState(),
      createCaseFromWebForm(validSubmission()),
    );
    const parsed = parseDemoState(serializeDemoState(state));

    expect(parsed.cases.some((caseItem) => caseItem.source === "web_form")).toBe(true);
  });

  it("reinicia expedientes web conservando recepción", () => {
    const caseItem = processCase(createCaseFromWebForm(validSubmission()));
    const state = addCaseToState(createInitialDemoState(), caseItem);
    const reset = resetCaseInState(state, caseItem.id);
    const resetCase = reset.cases.find((item) => item.id === caseItem.id);

    expect(resetCase?.status).toBe("pending");
    expect(resetCase?.auditEvents.every((event) => event.type === "intake_received")).toBe(true);
  });
});
