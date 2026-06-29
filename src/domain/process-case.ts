import type {
  AnalysisResult,
  AuditEvent,
  AuditEventType,
  CaseCategory,
  CaseDocument,
  ReviewDecision,
  ReviewRecord,
  RiskLevel,
  SyntheticCase,
} from "@/domain/types";

export const WORKFLOW_VERSION = "deterministic-v0.1" as const;

const stages = [
  "Clasificación",
  "Extracción",
  "Validación documental",
  "Consulta de procedimiento",
  "Evaluación de riesgo",
  "Generación de borrador",
];

function eventId(caseId: string, type: AuditEventType, index: number) {
  return `${caseId}-${type}-${index + 1}`;
}

export function createAuditEvent(
  caseItem: SyntheticCase,
  type: AuditEventType,
  description: string,
  result: string,
  actor: AuditEvent["actor"] = "Sistema",
): AuditEvent {
  return {
    id: eventId(caseItem.id, type, caseItem.auditEvents.length),
    timestamp: new Date().toISOString(),
    type,
    actor,
    description,
    workflowVersion: WORKFLOW_VERSION,
    result,
  };
}

export function classifyCase(caseItem: SyntheticCase): CaseCategory {
  return caseItem.expectedCategory;
}

export function extractCaseData(caseItem: SyntheticCase) {
  return caseItem.extractedData;
}

export function validateDocuments(caseItem: SyntheticCase): CaseDocument[] {
  return caseItem.requiredDocuments.map((documentName) => {
    const existing = caseItem.documents.find(
      (document) => document.name === documentName,
    );

    if (existing) {
      return existing;
    }

    return {
      name: documentName,
      required: true,
      presented: false,
      status: "missing",
    };
  });
}

export function retrieveProcedure(caseItem: SyntheticCase) {
  return caseItem.procedure;
}

export function calculateRisk(
  caseItem: SyntheticCase,
  documents: CaseDocument[],
): { risk: RiskLevel; factors: string[]; rules: string[] } {
  const factors: string[] = [];
  const rules: string[] = [];
  const hasMissingDocuments = documents.some(
    (document) => document.status === "missing",
  );

  if (caseItem.expectedCategory === "Reclamación administrativa") {
    factors.push("La categoría de reclamación exige escalado.");
    rules.push("reclamación administrativa -> riesgo alto");
    return { risk: "high", factors, rules };
  }

  if (caseItem.expectedCategory === "Reembolso") {
    factors.push("La solicitud puede afectar importes o derechos.");
    rules.push("reembolso -> revisión humana");
  }

  if (hasMissingDocuments) {
    factors.push("Falta documentación obligatoria.");
    rules.push("documentación faltante -> revisión humana");
  }

  if (caseItem.expectedCategory === "Cambio de cita") {
    factors.push("No se detecta conflicto administrativo en el fixture.");
    rules.push("cambio de cita sin conflicto -> riesgo bajo");
  }

  if (caseItem.expectedCategory === "Cambio de datos") {
    factors.push("Documentación completa para trámite administrativo simple.");
    rules.push("cambio de datos completo -> riesgo bajo");
  }

  if (caseItem.expectedCategory === "Consulta sobre un procedimiento") {
    factors.push("Consulta informativa sobre procedimiento ficticio.");
    rules.push("consulta de procedimiento -> riesgo bajo");
  }

  if (hasMissingDocuments || caseItem.expectedCategory === "Reembolso") {
    return { risk: "medium", factors, rules };
  }

  return { risk: "low", factors, rules };
}

export function calculateConfidence(
  caseItem: SyntheticCase,
  documents: CaseDocument[],
): number {
  const missingPenalty = documents.some((document) => document.status === "missing")
    ? 0.08
    : 0;
  const invalidPenalty = documents.some((document) => document.status === "invalid")
    ? 0.12
    : 0;
  const confidence = caseItem.confidence - missingPenalty - invalidPenalty;

  return Math.max(0, Math.min(1, Number(confidence.toFixed(2))));
}

export function requiresHumanReview(
  caseItem: SyntheticCase,
  risk: RiskLevel,
  confidence: number,
  documents: CaseDocument[],
): { required: boolean; reason?: string } {
  if (risk === "high") {
    return { required: true, reason: "Riesgo alto: no se permite aprobación directa." };
  }

  if (documents.some((document) => document.status === "missing")) {
    return {
      required: true,
      reason: "Falta documentación obligatoria antes de completar el trámite.",
    };
  }

  if (confidence < 0.75) {
    return {
      required: true,
      reason: "Confianza simulada inferior al umbral de 0,75.",
    };
  }

  if (caseItem.expectedCategory === "Reembolso") {
    return {
      required: true,
      reason: "Los reembolsos requieren revisión humana en esta demo.",
    };
  }

  return { required: false };
}

export function generateDraft(
  caseItem: SyntheticCase,
  documents: CaseDocument[],
  reviewReason?: string,
): string {
  const missing = documents
    .filter((document) => document.status === "missing")
    .map((document) => document.name);

  if (missing.length > 0) {
    return `Borrador sintético: se informa de que el expediente ${caseItem.id} no puede completarse todavía. Solicitar al interesado la documentación pendiente: ${missing.join(", ")}. No contiene recomendaciones clínicas.`;
  }

  if (caseItem.expectedCategory === "Reclamación administrativa") {
    return `Borrador sintético: registrar acuse de recibo del expediente ${caseItem.id} y escalar a revisión responsable por tratarse de una reclamación administrativa. No emitir resolución automática.`;
  }

  if (caseItem.expectedCategory === "Reembolso") {
    return `Borrador sintético: confirmar recepción del expediente ${caseItem.id}, indicar que la documentación administrativa está completa y derivar a revisión humana antes de cualquier respuesta final.`;
  }

  if (reviewReason) {
    return `Borrador sintético: el expediente ${caseItem.id} requiere revisión humana por ${reviewReason}. No se ejecuta ninguna acción administrativa real.`;
  }

  return `Borrador sintético: el expediente ${caseItem.id} puede tramitarse con la información administrativa aportada. Confirmar al usuario que el trámite queda registrado en modo demo, sin efectos reales ni recomendaciones clínicas.`;
}

export function processCase(caseItem: SyntheticCase): SyntheticCase {
  const openedEvent =
    caseItem.auditEvents.length === 0
      ? [createAuditEvent(caseItem, "case_opened", "Expediente abierto", caseItem.id)]
      : [];
  const baseCase = {
    ...caseItem,
    status: "analyzing" as const,
    auditEvents: [
      ...caseItem.auditEvents,
      ...openedEvent,
      createAuditEvent(
        { ...caseItem, auditEvents: [...caseItem.auditEvents, ...openedEvent] },
        "analysis_started",
        "Análisis determinista iniciado",
        "Reglas locales sin IA",
      ),
    ],
  };
  const classification = classifyCase(baseCase);
  const extractedData = extractCaseData(baseCase);
  const documents = validateDocuments(baseCase);
  const procedure = retrieveProcedure(baseCase);
  const riskResult = calculateRisk(baseCase, documents);
  const confidence = calculateConfidence(baseCase, documents);
  const review = requiresHumanReview(
    baseCase,
    riskResult.risk,
    confidence,
    documents,
  );
  const draftResponse = generateDraft(baseCase, documents, review.reason);
  const analysis: AnalysisResult = {
    classification,
    confidence,
    risk: riskResult.risk,
    riskFactors: riskResult.factors,
    activatedRules: riskResult.rules,
    missingDocuments: documents
      .filter((document) => document.status === "missing")
      .map((document) => document.name),
    humanReviewReason: review.reason,
    stagesCompleted: stages,
  };
  const eventSource: SyntheticCase = {
    ...baseCase,
    category: classification,
    confidence,
    risk: riskResult.risk,
    documents,
    procedure,
    extractedData,
    draftResponse,
    requiresHumanReview: review.required,
    analysis,
  };
  const auditEvents = [
    ...baseCase.auditEvents,
    createAuditEvent(eventSource, "classification_completed", "Clasificación completada", classification),
    createAuditEvent(eventSource, "documents_validated", "Documentación validada", analysis.missingDocuments.length > 0 ? `Faltan: ${analysis.missingDocuments.join(", ")}` : "Documentación completa"),
    createAuditEvent(eventSource, "procedure_retrieved", "Procedimiento simulado consultado", procedure.code),
    createAuditEvent(eventSource, "draft_generated", "Borrador generado", "Borrador sintético disponible"),
  ];

  if (review.required) {
    auditEvents.push(
      createAuditEvent(
        { ...eventSource, auditEvents },
        "human_review_requested",
        "Revisión humana solicitada",
        review.reason ?? "Regla determinista",
      ),
    );
  } else {
    auditEvents.push(
      createAuditEvent(
        { ...eventSource, auditEvents },
        "case_completed",
        "Expediente completado por lógica determinista",
        "Sin efectos administrativos reales",
      ),
    );
  }

  return {
    ...eventSource,
    status: review.required ? "human_review" : "completed",
    auditEvents,
  };
}

export function canRecordDecision(
  caseItem: SyntheticCase,
  decision: ReviewDecision,
): { allowed: boolean; reason?: string } {
  const missingDocuments = caseItem.documents.some(
    (document) => document.status === "missing",
  );

  if (caseItem.risk === "high" && decision === "approve") {
    return {
      allowed: false,
      reason: "Riesgo alto: la aprobación directa está bloqueada.",
    };
  }

  if (
    caseItem.expectedCategory === "Reclamación administrativa" &&
    decision !== "escalate"
  ) {
    return {
      allowed: false,
      reason: "Las reclamaciones administrativas deben escalarse.",
    };
  }

  if (missingDocuments && decision === "approve") {
    return {
      allowed: false,
      reason: "No puede completarse sin solicitar documentación pendiente.",
    };
  }

  return { allowed: true };
}

export function recordHumanDecision(
  caseItem: SyntheticCase,
  decision: ReviewDecision,
  note: string,
  editedDraft?: string,
): SyntheticCase {
  const cleanNote = note.trim();
  if (!cleanNote) {
    throw new Error("La nota del revisor es obligatoria.");
  }

  const permission = canRecordDecision(caseItem, decision);
  if (!permission.allowed) {
    throw new Error(permission.reason);
  }

  const review: ReviewRecord = {
    decision,
    note: cleanNote,
    reviewer: "Usuario demo",
    decidedAt: new Date().toISOString(),
    editedDraft:
      decision === "edit_and_approve" ? editedDraft?.trim() || caseItem.draftResponse : undefined,
  };
  const status =
    decision === "approve" || decision === "edit_and_approve"
      ? "approved"
      : decision === "reject"
        ? "rejected"
        : "escalated";
  const updatedCase: SyntheticCase = {
    ...caseItem,
    status,
    review,
    draftResponse: review.editedDraft ?? caseItem.draftResponse,
  };
  const auditEvents = [
    ...caseItem.auditEvents,
    createAuditEvent(
      updatedCase,
      "human_decision_recorded",
      "Decisión humana registrada",
      `${decision}: ${cleanNote}`,
      "Usuario demo",
    ),
    createAuditEvent(
      { ...updatedCase, auditEvents: [...caseItem.auditEvents] },
      "case_completed",
      "Expediente cerrado en modo demo",
      status,
      "Sistema",
    ),
  ];

  return {
    ...updatedCase,
    auditEvents,
  };
}
