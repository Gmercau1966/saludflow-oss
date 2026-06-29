import { describe, expect, it } from "vitest";
import { getSyntheticCases } from "../src/data/synthetic-cases";
import {
  calculateConfidence,
  calculateRisk,
  canRecordDecision,
  classifyCase,
  generateDraft,
  processCase,
  recordHumanDecision,
  requiresHumanReview,
  validateDocuments,
} from "../src/domain/process-case";

const cases = getSyntheticCases();
const byId = (id: string) => {
  const caseItem = cases.find((item) => item.id === id);
  if (!caseItem) {
    throw new Error(`Missing fixture ${id}`);
  }
  return caseItem;
};

describe("deterministic case workflow", () => {
  it("clasifica cada expediente según su categoría esperada", () => {
    cases.forEach((caseItem) => {
      expect(classifyCase(caseItem)).toBe(caseItem.expectedCategory);
    });
  });

  it("detecta documentación faltante", () => {
    const documents = validateDocuments(byId("SF-DEMO-002"));

    expect(documents.some((document) => document.status === "missing")).toBe(true);
  });

  it("calcula riesgo alto para reclamaciones administrativas", () => {
    const caseItem = byId("SF-DEMO-004");
    const result = calculateRisk(caseItem, validateDocuments(caseItem));

    expect(result.risk).toBe("high");
    expect(result.rules).toContain("reclamación administrativa -> riesgo alto");
  });

  it("calcula confianza dentro de rango y penaliza documentación faltante", () => {
    const caseItem = byId("SF-DEMO-002");
    const confidence = calculateConfidence(caseItem, validateDocuments(caseItem));

    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(1);
    expect(confidence).toBeLessThan(caseItem.confidence);
  });

  it("marca reembolsos para revisión humana", () => {
    const caseItem = byId("SF-DEMO-003");
    const documents = validateDocuments(caseItem);
    const risk = calculateRisk(caseItem, documents);
    const review = requiresHumanReview(
      caseItem,
      risk.risk,
      calculateConfidence(caseItem, documents),
      documents,
    );

    expect(review.required).toBe(true);
  });

  it("bloquea aprobación directa en riesgo alto", () => {
    const processed = processCase(byId("SF-DEMO-004"));
    const permission = canRecordDecision(processed, "approve");

    expect(permission.allowed).toBe(false);
  });

  it("genera borrador de solicitud de documentación faltante", () => {
    const caseItem = byId("SF-DEMO-002");
    const draft = generateDraft(caseItem, validateDocuments(caseItem));

    expect(draft).toContain("documentación pendiente");
    expect(draft).toContain("Justificante sintético");
  });

  it("procesa cambio de cita sin recomendación clínica", () => {
    const processed = processCase(byId("SF-DEMO-005"));

    expect(processed.status).toBe("completed");
    expect(processed.draftResponse.toLowerCase()).not.toContain("diagnóstico");
    expect(processed.draftResponse.toLowerCase()).not.toContain("tratamiento");
  });

  it("registra decisión humana con nota obligatoria", () => {
    const processed = processCase(byId("SF-DEMO-003"));
    const reviewed = recordHumanDecision(
      processed,
      "escalate",
      "Escalado simulado por revisión obligatoria.",
    );

    expect(reviewed.status).toBe("escalated");
    expect(reviewed.auditEvents.some((event) => event.type === "human_decision_recorded")).toBe(true);
  });

  it("rechaza decisiones sin nota de revisor", () => {
    const processed = processCase(byId("SF-DEMO-003"));

    expect(() => recordHumanDecision(processed, "escalate", " ")).toThrow(
      "La nota del revisor es obligatoria.",
    );
  });
});
