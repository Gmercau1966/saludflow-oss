export type CaseStatus =
  | "Pendiente"
  | "Procesando"
  | "Revisión humana"
  | "Completado";

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export type CaseCategory =
  | "Cambio de datos"
  | "Documentación incompleta"
  | "Reembolso"
  | "Cambio de cita"
  | "Reclamación administrativa";

export type SyntheticCase = {
  id: string;
  subject: string;
  category: CaseCategory;
  status: CaseStatus;
  risk: RiskLevel;
  confidence: number;
  receivedAt: string;
  requiresHumanReview: boolean;
  synthetic: true;
};

const syntheticCases: SyntheticCase[] = [
  {
    id: "SF-DEMO-001",
    subject: "Solicitud sintética de cambio de teléfono de contacto",
    category: "Cambio de datos",
    status: "Pendiente",
    risk: "Bajo",
    confidence: 0.88,
    receivedAt: "2026-06-24T09:15:00.000Z",
    requiresHumanReview: false,
    synthetic: true,
  },
  {
    id: "SF-DEMO-002",
    subject: "Expediente sintético con justificante pendiente de revisión",
    category: "Documentación incompleta",
    status: "Revisión humana",
    risk: "Medio",
    confidence: 0.72,
    receivedAt: "2026-06-24T10:40:00.000Z",
    requiresHumanReview: true,
    synthetic: true,
  },
  {
    id: "SF-DEMO-003",
    subject: "Petición sintética de reembolso por trámite administrativo",
    category: "Reembolso",
    status: "Procesando",
    risk: "Alto",
    confidence: 0.81,
    receivedAt: "2026-06-25T12:05:00.000Z",
    requiresHumanReview: true,
    synthetic: true,
  },
  {
    id: "SF-DEMO-004",
    subject: "Cambio simulado de cita para revisión documental",
    category: "Cambio de cita",
    status: "Completado",
    risk: "Bajo",
    confidence: 0.93,
    receivedAt: "2026-06-26T08:30:00.000Z",
    requiresHumanReview: false,
    synthetic: true,
  },
  {
    id: "SF-DEMO-005",
    subject: "Reclamación administrativa sintética por plazo de respuesta",
    category: "Reclamación administrativa",
    status: "Revisión humana",
    risk: "Alto",
    confidence: 0.68,
    receivedAt: "2026-06-26T15:20:00.000Z",
    requiresHumanReview: true,
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

  return syntheticCases;
}
