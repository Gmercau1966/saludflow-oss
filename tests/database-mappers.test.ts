import { describe, expect, it } from "vitest";
import { processCase, recordHumanDecision } from "../src/domain/process-case";
import { createCaseFromWebForm } from "../src/domain/web-form-intake";
import type { WebFormSubmission } from "../src/domain/types";
import {
  auditEventToDatabaseRow,
  caseToDatabaseRow,
  databaseRowToCase,
  humanReviewToDatabaseRow,
  workflowRunToDatabaseRow,
} from "../src/lib/repositories/database-mappers";

const submission: WebFormSubmission = {
  category: "Reembolso",
  subject: "Reembolso sintetico con justificante",
  description:
    "Solicitud ficticia de reembolso administrativo con documentos simulados y sin datos reales.",
  relatedDate: "2026-07-20",
  declaredPriority: "urgent",
  preferredResponseChannel: "portal",
  declaredDocuments: ["formulario de solicitud", "comprobante de pago"],
  syntheticDataConfirmed: true,
};

describe("database mappers", () => {
  it("convierte expediente canonico a fila de cases", () => {
    const caseItem = createCaseFromWebForm(submission);
    const row = caseToDatabaseRow(caseItem, "owner-1");

    expect(row).toMatchObject({
      id: caseItem.id,
      owner_id: "owner-1",
      source: "web_form",
      synthetic: true,
      requires_human_review: caseItem.requiresHumanReview,
      preferred_response_channel: "portal",
    });
    expect(row.case_snapshot.id).toBe(caseItem.id);
    expect(row.updated_at).toEqual(expect.any(String));
  });

  it("recupera expediente desde snapshot validado", () => {
    const caseItem = createCaseFromWebForm(submission);
    const row = caseToDatabaseRow(caseItem, "owner-1");

    expect(databaseRowToCase(row)).toEqual(caseItem);
  });

  it("rechaza snapshots no sinteticos", () => {
    const caseItem = createCaseFromWebForm(submission);

    expect(() =>
      databaseRowToCase({
        id: caseItem.id,
        case_snapshot: { ...caseItem, synthetic: false },
      }),
    ).toThrow("sintetico");
  });

  it("convierte eventos de auditoria a filas append-only", () => {
    const caseItem = createCaseFromWebForm(submission);
    const row = auditEventToDatabaseRow(caseItem.auditEvents[0], "owner-1", caseItem.id);

    expect(row).toMatchObject({
      owner_id: "owner-1",
      case_id: caseItem.id,
      event_type: "intake_received",
      workflow_version: "web-form-intake-v0.1",
    });
    expect(row.result?.domainEventId).toBe(caseItem.auditEvents[0].id);
  });

  it("convierte ejecuciones de workflow con snapshots de entrada y salida", () => {
    const inputCase = createCaseFromWebForm(submission);
    const outputCase = processCase(inputCase);
    const row = workflowRunToDatabaseRow(inputCase, outputCase, "owner-1");

    expect(row).toMatchObject({
      owner_id: "owner-1",
      case_id: outputCase.id,
      workflow_version: "deterministic-v0.1",
      status: "completed",
      input_snapshot: inputCase,
      output_snapshot: outputCase,
    });
    expect(row.started_at).toEqual(expect.any(String));
    expect(row.completed_at).toEqual(expect.any(String));
  });

  it("convierte revision humana a fila separada", () => {
    const processed = processCase(createCaseFromWebForm(submission));
    const reviewed = recordHumanDecision(
      processed,
      "escalate",
      "Revision simulada obligatoria.",
      processed.draftResponse,
    );
    const row = humanReviewToDatabaseRow(reviewed, "owner-1");

    expect(row).toMatchObject({
      owner_id: "owner-1",
      case_id: reviewed.id,
      decision: "escalate",
      reviewer: "Usuario demo",
    });
  });
});
