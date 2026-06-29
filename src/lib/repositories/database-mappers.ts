import type {
  AuditEvent,
  CaseCategory,
  CaseStatus,
  IntakeSource,
  PreferredResponseChannel,
  ReviewDecision,
  RiskLevel,
  SyntheticCase,
} from "../../domain/types";

export type DatabaseCaseRow = {
  id: string;
  owner_id: string;
  source: IntakeSource;
  category: CaseCategory;
  subject: string;
  description: string;
  related_date: string | null;
  status: CaseStatus;
  risk_level: RiskLevel;
  confidence: number;
  requires_human_review: boolean;
  declared_priority: "normal" | "urgent";
  preferred_response_channel: PreferredResponseChannel;
  synthetic: boolean;
  received_at: string;
  case_snapshot: SyntheticCase;
  created_at?: string;
  updated_at: string;
};

export type DatabaseWorkflowRunRow = {
  owner_id: string;
  case_id: string;
  workflow_version: "deterministic-v0.1";
  status: "running" | "completed" | "failed";
  input_snapshot: SyntheticCase;
  output_snapshot: SyntheticCase | null;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
};

export type DatabaseAuditEventRow = {
  id: string;
  owner_id: string;
  case_id: string;
  event_type: AuditEvent["type"];
  actor: AuditEvent["actor"];
  description: string;
  workflow_version: AuditEvent["workflowVersion"];
  result: { value: string; domainEventId: string } | null;
  created_at?: string;
};

export type DatabaseHumanReviewRow = {
  id: string;
  owner_id: string;
  case_id: string;
  decision: ReviewDecision;
  reviewer: "Usuario demo";
  note: string;
  edited_draft: string | null;
  created_at?: string;
};

function assertCaseSnapshot(value: unknown): SyntheticCase {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    !("synthetic" in value)
  ) {
    throw new Error("La fila de expediente no contiene un snapshot valido.");
  }

  const caseItem = value as SyntheticCase;
  if (caseItem.synthetic !== true) {
    throw new Error("El expediente recuperado no esta marcado como sintetico.");
  }

  if (
    caseItem.source !== "web_form" &&
    caseItem.source !== "seed_fixture" &&
    caseItem.source !== "email"
  ) {
    throw new Error("El origen del expediente recuperado no esta permitido.");
  }

  return caseItem;
}

export function caseToDatabaseRow(
  caseItem: SyntheticCase,
  ownerId: string,
): DatabaseCaseRow {
  return {
    id: caseItem.id,
    owner_id: ownerId,
    source: caseItem.source,
    category: caseItem.category,
    subject: caseItem.subject,
    description: caseItem.originalText,
    related_date: caseItem.extractedData.requestedDate || null,
    status: caseItem.status,
    risk_level: caseItem.risk,
    confidence: caseItem.confidence,
    requires_human_review: caseItem.requiresHumanReview,
    declared_priority: caseItem.declaredPriority,
    preferred_response_channel: caseItem.preferredResponseChannel,
    synthetic: caseItem.synthetic,
    received_at: caseItem.receivedAt,
    case_snapshot: caseItem,
    updated_at: new Date().toISOString(),
  };
}

export function workflowRunToDatabaseRow(
  inputCase: SyntheticCase,
  outputCase: SyntheticCase,
  ownerId: string,
): DatabaseWorkflowRunRow {
  const startedAt =
    outputCase.auditEvents.find((event) => event.type === "analysis_started")
      ?.timestamp ?? inputCase.receivedAt;
  const completedAt =
    outputCase.auditEvents.findLast((event) =>
      ["case_completed", "human_review_requested"].includes(event.type),
    )?.timestamp ?? new Date().toISOString();

  return {
    owner_id: ownerId,
    case_id: outputCase.id,
    workflow_version: "deterministic-v0.1",
    status: "completed",
    input_snapshot: inputCase,
    output_snapshot: outputCase,
    started_at: startedAt,
    completed_at: completedAt,
    error_message: null,
  };
}

export function databaseRowToCase(row: { id: string; case_snapshot: unknown }) {
  const caseItem = assertCaseSnapshot(row.case_snapshot);
  if (caseItem.id !== row.id) {
    throw new Error("El snapshot del expediente no coincide con la fila.");
  }

  return caseItem;
}

export function auditEventToDatabaseRow(
  event: AuditEvent,
  ownerId: string,
  caseId: string,
): DatabaseAuditEventRow {
  return {
    id: crypto.randomUUID(),
    owner_id: ownerId,
    case_id: caseId,
    event_type: event.type,
    actor: event.actor,
    description: event.description,
    workflow_version: event.workflowVersion,
    result: {
      value: event.result,
      domainEventId: event.id,
    },
    created_at: event.timestamp,
  };
}

export function humanReviewToDatabaseRow(
  caseItem: SyntheticCase,
  ownerId: string,
): DatabaseHumanReviewRow | null {
  if (!caseItem.review) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    owner_id: ownerId,
    case_id: caseItem.id,
    decision: caseItem.review.decision,
    reviewer: caseItem.review.reviewer,
    note: caseItem.review.note,
    edited_draft: caseItem.review.editedDraft || null,
    created_at: caseItem.review.decidedAt,
  };
}
