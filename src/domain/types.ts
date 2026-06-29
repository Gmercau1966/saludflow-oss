export type CaseStatus =
  | "pending"
  | "analyzing"
  | "human_review"
  | "approved"
  | "rejected"
  | "escalated"
  | "completed";

export type RiskLevel = "low" | "medium" | "high";

export type DocumentStatus = "present" | "missing" | "invalid";

export type ReviewDecision =
  | "approve"
  | "edit_and_approve"
  | "reject"
  | "escalate";

export type AuditEventType =
  | "case_opened"
  | "analysis_started"
  | "classification_completed"
  | "documents_validated"
  | "procedure_retrieved"
  | "draft_generated"
  | "human_review_requested"
  | "human_decision_recorded"
  | "case_completed";

export type CaseCategory =
  | "Cambio de datos"
  | "Documentación incompleta"
  | "Reembolso"
  | "Cambio de cita"
  | "Reclamación administrativa";

export type ExtractedCaseData = {
  procedureType: CaseCategory;
  channel: "Portal demo" | "Registro sintético" | "Atención administrativa";
  requestedDate: string;
  internalReference: string;
  reason: string;
  priority: "normal" | "preferente" | "urgente";
};

export type CaseDocument = {
  name: string;
  required: boolean;
  presented: boolean;
  status: DocumentStatus;
  invalidReason?: string;
};

export type Procedure = {
  code: string;
  title: string;
  steps: string[];
  requiredDocuments: string[];
  simulatedDeadline: string;
  version: string;
  fictitiousSourceNotice: string;
};

export type AnalysisResult = {
  classification: CaseCategory;
  confidence: number;
  risk: RiskLevel;
  riskFactors: string[];
  activatedRules: string[];
  missingDocuments: string[];
  humanReviewReason?: string;
  stagesCompleted: string[];
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  type: AuditEventType;
  actor: "Sistema" | "Usuario demo";
  description: string;
  workflowVersion: "deterministic-v0.1";
  result: string;
};

export type ReviewRecord = {
  decision: ReviewDecision;
  note: string;
  reviewer: "Usuario demo";
  decidedAt: string;
  editedDraft?: string;
};

export type SyntheticCase = {
  id: string;
  subject: string;
  originalText: string;
  expectedCategory: CaseCategory;
  category: CaseCategory;
  status: CaseStatus;
  risk: RiskLevel;
  confidence: number;
  receivedAt: string;
  documentsPresented: string[];
  requiredDocuments: string[];
  documents: CaseDocument[];
  procedure: Procedure;
  extractedData: ExtractedCaseData;
  draftResponse: string;
  requiresHumanReview: boolean;
  analysis?: AnalysisResult;
  review?: ReviewRecord;
  auditEvents: AuditEvent[];
  synthetic: true;
};

export type DemoState = {
  cases: SyntheticCase[];
  lastUpdatedAt: string;
  storageVersion: 1;
};
