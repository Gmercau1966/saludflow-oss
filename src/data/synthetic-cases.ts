import type { CaseStatus, RiskLevel, SyntheticCase } from "@/domain/types";

export type {
  AuditEvent,
  AuditEventType,
  CaseCategory,
  CaseDocument,
  CaseStatus,
  DemoState,
  DocumentStatus,
  ExtractedCaseData,
  Procedure,
  ReviewDecision,
  RiskLevel,
  SyntheticCase,
} from "@/domain/types";

const sourceNotice =
  "Fuente ficticia para demostración. No corresponde a normativa real.";

function initialAudit(caseId: string) {
  return [
    {
      id: `${caseId}-case_opened-1`,
      timestamp: "2026-06-29T08:00:00.000Z",
      type: "case_opened" as const,
      actor: "Sistema" as const,
      description: "Expediente sintético cargado en la demo",
      workflowVersion: "deterministic-v0.1" as const,
      result: caseId,
    },
  ];
}

const syntheticCases: SyntheticCase[] = [
  {
    id: "SF-DEMO-001",
    subject: "Cambio sintético de datos de contacto",
    originalText:
      "Solicitud demo: se pide actualizar el teléfono de contacto administrativo asociado a un expediente ficticio. Se adjunta formulario firmado y justificante sintético de titularidad.",
    expectedCategory: "Cambio de datos",
    category: "Cambio de datos",
    status: "pending",
    risk: "low",
    confidence: 0.91,
    receivedAt: "2026-06-24T09:15:00.000Z",
    documentsPresented: ["Formulario administrativo", "Justificante sintético"],
    requiredDocuments: ["Formulario administrativo", "Justificante sintético"],
    documents: [
      {
        name: "Formulario administrativo",
        required: true,
        presented: true,
        status: "present",
      },
      {
        name: "Justificante sintético",
        required: true,
        presented: true,
        status: "present",
      },
    ],
    procedure: {
      code: "ADM-DATA-001",
      title: "Actualización administrativa de datos de contacto",
      steps: [
        "Comprobar que el formulario está presente.",
        "Verificar que el justificante sintético está aportado.",
        "Preparar confirmación administrativa sin efectos reales.",
      ],
      requiredDocuments: ["Formulario administrativo", "Justificante sintético"],
      simulatedDeadline: "2 días hábiles simulados",
      version: "2026.0-demo",
      fictitiousSourceNotice: sourceNotice,
    },
    extractedData: {
      procedureType: "Cambio de datos",
      channel: "Portal demo",
      requestedDate: "2026-06-24",
      internalReference: "REF-SYN-DATA-001",
      reason: "Actualización de contacto administrativo",
      priority: "normal",
    },
    draftResponse: "",
    requiresHumanReview: false,
    auditEvents: initialAudit("SF-DEMO-001"),
    synthetic: true,
  },
  {
    id: "SF-DEMO-002",
    subject: "Documentación sintética incompleta",
    originalText:
      "Solicitud demo: se solicita continuar un trámite administrativo, pero solo consta el formulario. Falta el justificante sintético obligatorio indicado por el procedimiento.",
    expectedCategory: "Documentación incompleta",
    category: "Documentación incompleta",
    status: "pending",
    risk: "medium",
    confidence: 0.78,
    receivedAt: "2026-06-24T10:40:00.000Z",
    documentsPresented: ["Formulario administrativo"],
    requiredDocuments: ["Formulario administrativo", "Justificante sintético"],
    documents: [
      {
        name: "Formulario administrativo",
        required: true,
        presented: true,
        status: "present",
      },
      {
        name: "Justificante sintético",
        required: true,
        presented: false,
        status: "missing",
      },
    ],
    procedure: {
      code: "ADM-DOC-002",
      title: "Subsanación de documentación administrativa",
      steps: [
        "Identificar documentos obligatorios.",
        "Detener la tramitación si falta documentación.",
        "Preparar solicitud de subsanación para revisión humana.",
      ],
      requiredDocuments: ["Formulario administrativo", "Justificante sintético"],
      simulatedDeadline: "5 días hábiles simulados",
      version: "2026.0-demo",
      fictitiousSourceNotice: sourceNotice,
    },
    extractedData: {
      procedureType: "Documentación incompleta",
      channel: "Registro sintético",
      requestedDate: "2026-06-24",
      internalReference: "REF-SYN-DOC-002",
      reason: "Subsanación documental pendiente",
      priority: "preferente",
    },
    draftResponse: "",
    requiresHumanReview: true,
    auditEvents: initialAudit("SF-DEMO-002"),
    synthetic: true,
  },
  {
    id: "SF-DEMO-003",
    subject: "Solicitud sintética de reembolso administrativo",
    originalText:
      "Solicitud demo: se pide revisar un posible reembolso administrativo con justificantes sintéticos completos. El caso no implica valoración clínica.",
    expectedCategory: "Reembolso",
    category: "Reembolso",
    status: "pending",
    risk: "medium",
    confidence: 0.84,
    receivedAt: "2026-06-25T12:05:00.000Z",
    documentsPresented: ["Formulario de reembolso", "Justificante sintético"],
    requiredDocuments: ["Formulario de reembolso", "Justificante sintético"],
    documents: [
      {
        name: "Formulario de reembolso",
        required: true,
        presented: true,
        status: "present",
      },
      {
        name: "Justificante sintético",
        required: true,
        presented: true,
        status: "present",
      },
    ],
    procedure: {
      code: "ADM-REB-003",
      title: "Revisión administrativa de reembolso sintético",
      steps: [
        "Confirmar documentación aportada.",
        "Aplicar regla de revisión humana por posible impacto económico.",
        "Preparar borrador informativo sin resolución automática.",
      ],
      requiredDocuments: ["Formulario de reembolso", "Justificante sintético"],
      simulatedDeadline: "7 días hábiles simulados",
      version: "2026.0-demo",
      fictitiousSourceNotice: sourceNotice,
    },
    extractedData: {
      procedureType: "Reembolso",
      channel: "Portal demo",
      requestedDate: "2026-06-25",
      internalReference: "REF-SYN-REB-003",
      reason: "Revisión de reembolso administrativo",
      priority: "preferente",
    },
    draftResponse: "",
    requiresHumanReview: true,
    auditEvents: initialAudit("SF-DEMO-003"),
    synthetic: true,
  },
  {
    id: "SF-DEMO-004",
    subject: "Reclamación administrativa sintética",
    originalText:
      "Solicitud demo: se registra una reclamación administrativa por desacuerdo con un plazo de respuesta simulado. Debe escalarse y no puede aprobarse automáticamente.",
    expectedCategory: "Reclamación administrativa",
    category: "Reclamación administrativa",
    status: "pending",
    risk: "high",
    confidence: 0.82,
    receivedAt: "2026-06-26T15:20:00.000Z",
    documentsPresented: ["Formulario de reclamación", "Relato sintético"],
    requiredDocuments: ["Formulario de reclamación", "Relato sintético"],
    documents: [
      {
        name: "Formulario de reclamación",
        required: true,
        presented: true,
        status: "present",
      },
      {
        name: "Relato sintético",
        required: true,
        presented: true,
        status: "present",
      },
    ],
    procedure: {
      code: "ADM-REC-004",
      title: "Escalado de reclamación administrativa",
      steps: [
        "Registrar acuse de recibo.",
        "Bloquear resolución automática.",
        "Escalar a revisión responsable.",
      ],
      requiredDocuments: ["Formulario de reclamación", "Relato sintético"],
      simulatedDeadline: "10 días hábiles simulados",
      version: "2026.0-demo",
      fictitiousSourceNotice: sourceNotice,
    },
    extractedData: {
      procedureType: "Reclamación administrativa",
      channel: "Atención administrativa",
      requestedDate: "2026-06-26",
      internalReference: "REF-SYN-REC-004",
      reason: "Reclamación por plazo administrativo simulado",
      priority: "urgente",
    },
    draftResponse: "",
    requiresHumanReview: true,
    auditEvents: initialAudit("SF-DEMO-004"),
    synthetic: true,
  },
  {
    id: "SF-DEMO-005",
    subject: "Cambio sintético de cita administrativa",
    originalText:
      "Solicitud demo: se pide cambiar una cita administrativa de revisión documental a otra fecha disponible. No se solicita consejo clínico ni valoración sanitaria.",
    expectedCategory: "Cambio de cita",
    category: "Cambio de cita",
    status: "pending",
    risk: "low",
    confidence: 0.94,
    receivedAt: "2026-06-27T08:30:00.000Z",
    documentsPresented: ["Solicitud de cambio de cita"],
    requiredDocuments: ["Solicitud de cambio de cita"],
    documents: [
      {
        name: "Solicitud de cambio de cita",
        required: true,
        presented: true,
        status: "present",
      },
    ],
    procedure: {
      code: "ADM-CITA-005",
      title: "Cambio administrativo de cita",
      steps: [
        "Comprobar solicitud administrativa.",
        "Confirmar que no hay conflicto en el fixture.",
        "Preparar respuesta de cambio de cita sin recomendación clínica.",
      ],
      requiredDocuments: ["Solicitud de cambio de cita"],
      simulatedDeadline: "1 día hábil simulado",
      version: "2026.0-demo",
      fictitiousSourceNotice: sourceNotice,
    },
    extractedData: {
      procedureType: "Cambio de cita",
      channel: "Portal demo",
      requestedDate: "2026-06-27",
      internalReference: "REF-SYN-CITA-005",
      reason: "Cambio de fecha de revisión documental",
      priority: "normal",
    },
    draftResponse: "",
    requiresHumanReview: false,
    auditEvents: initialAudit("SF-DEMO-005"),
    synthetic: true,
  },
];

export function validateConfidence(confidence: number): boolean {
  return Number.isFinite(confidence) && confidence >= 0 && confidence <= 1;
}

export function getSyntheticCases(): SyntheticCase[] {
  syntheticCases.forEach((caseItem) => {
    if (!validateConfidence(caseItem.confidence)) {
      throw new Error(`Confianza fuera de rango en ${caseItem.id}`);
    }
  });

  return structuredClone(syntheticCases);
}

export function getSyntheticCaseById(id: string): SyntheticCase | undefined {
  return getSyntheticCases().find((caseItem) => caseItem.id === id);
}

export const caseStatusLabels: Record<CaseStatus, string> = {
  pending: "Pendiente",
  analyzing: "Analizando",
  human_review: "Revisión humana",
  approved: "Aprobado",
  rejected: "Rechazado",
  escalated: "Escalado",
  completed: "Completado",
};

export const riskLevelLabels: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
};
