import type {
  CaseCategory,
  CaseDocument,
  DeclaredPriority,
  PreferredResponseChannel,
  Procedure,
  SyntheticCase,
  WebFormSubmission,
} from "@/domain/types";

const sourceNotice =
  "Fuente ficticia para demostración. No corresponde a normativa real.";

const requiredDocumentsByCategory: Record<CaseCategory, string[]> = {
  "Cambio de datos": ["formulario de solicitud", "justificante"],
  "Documentación incompleta": ["formulario de solicitud", "justificante"],
  Reembolso: ["formulario de solicitud", "comprobante de pago", "justificante"],
  "Cambio de cita": ["formulario de solicitud"],
  "Reclamación administrativa": ["formulario de solicitud", "comunicación anterior"],
  "Consulta sobre un procedimiento": ["formulario de solicitud"],
};

const procedureCodeByCategory: Record<CaseCategory, string> = {
  "Cambio de datos": "ADM-WEB-DATA",
  "Documentación incompleta": "ADM-WEB-DOC",
  Reembolso: "ADM-WEB-REB",
  "Cambio de cita": "ADM-WEB-CITA",
  "Reclamación administrativa": "ADM-WEB-REC",
  "Consulta sobre un procedimiento": "ADM-WEB-CONS",
};

function generateCaseId(now = new Date()): string {
  const year = now.getFullYear();
  const timePart = now.getTime().toString().slice(-6);
  const randomPart = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");

  return `SFO-${year}-${timePart}${randomPart}`;
}

function buildDocuments(
  requiredDocuments: string[],
  declaredDocuments: string[],
): CaseDocument[] {
  return requiredDocuments.map((documentName) => {
    const presented = declaredDocuments.includes(documentName);

    return {
      name: documentName,
      required: true,
      presented,
      status: presented ? "present" : "missing",
    };
  });
}

function buildProcedure(category: CaseCategory): Procedure {
  return {
    code: procedureCodeByCategory[category],
    title: `Procedimiento web sintético: ${category}`,
    steps: [
      "Registrar solicitud recibida por formulario web.",
      "Validar contenido sintético y documentación declarada.",
      "Preparar expediente canónico para el workflow determinista.",
    ],
    requiredDocuments: requiredDocumentsByCategory[category],
    simulatedDeadline:
      category === "Reclamación administrativa"
        ? "10 días hábiles simulados"
        : "5 días hábiles simulados",
    version: "web-form-intake-v0.1",
    fictitiousSourceNotice: sourceNotice,
  };
}

function mapPriority(priority: DeclaredPriority) {
  return priority === "urgent" ? "urgente" : "normal";
}

function mapChannel(channel: PreferredResponseChannel) {
  return channel === "portal" ? "Portal demo" : "Registro sintético";
}

export function createCaseFromWebForm(
  submission: WebFormSubmission,
): SyntheticCase {
  const now = new Date();
  const id = generateCaseId(now);
  const requiredDocuments = requiredDocumentsByCategory[submission.category];
  const documents = buildDocuments(requiredDocuments, submission.declaredDocuments);

  return {
    id,
    source: "web_form",
    subject: submission.subject,
    originalText: `Solicitud recibida por formulario web: ${submission.description}`,
    expectedCategory: submission.category,
    category: submission.category,
    status: "pending",
    risk:
      submission.category === "Reclamación administrativa"
        ? "high"
        : submission.category === "Reembolso"
          ? "medium"
          : "low",
    confidence: 0.86,
    receivedAt: now.toISOString(),
    declaredPriority: submission.declaredPriority,
    preferredResponseChannel: submission.preferredResponseChannel,
    declaredDocuments: submission.declaredDocuments,
    documentsPresented: submission.declaredDocuments.filter(
      (document) => document !== "sin documentación",
    ),
    requiredDocuments,
    documents,
    procedure: buildProcedure(submission.category),
    extractedData: {
      procedureType: submission.category,
      channel: mapChannel(submission.preferredResponseChannel),
      requestedDate: submission.relatedDate ?? now.toISOString().slice(0, 10),
      internalReference: `REF-WEB-${id}`,
      reason: submission.description.slice(0, 160),
      priority: mapPriority(submission.declaredPriority),
    },
    draftResponse: "",
    requiresHumanReview:
      submission.category === "Reclamación administrativa" ||
      submission.category === "Reembolso" ||
      documents.some((document) => document.status === "missing"),
    auditEvents: [
      {
        id: `${id}-intake_received-1`,
        timestamp: now.toISOString(),
        type: "intake_received",
        actor: "Solicitante demo",
        description: "Solicitud recibida mediante formulario web.",
        workflowVersion: "web-form-intake-v0.1",
        result: id,
      },
    ],
    synthetic: true,
  };
}
