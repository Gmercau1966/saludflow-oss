import type {
  CaseCategory,
  DeclaredPriority,
  PreferredResponseChannel,
  WebFormSubmission,
} from "@/domain/types";

export type WebFormInput = {
  category: string;
  subject: string;
  description: string;
  relatedDate?: string;
  declaredPriority: string;
  preferredResponseChannel: string;
  declaredDocuments: string[];
  syntheticDataConfirmed: boolean;
};

export type WebFormField = keyof WebFormInput;

export type WebFormValidationError = {
  field: WebFormField;
  message: string;
};

export type WebFormValidationResult =
  | { valid: true; data: WebFormSubmission }
  | { valid: false; errors: WebFormValidationError[] };

export const webFormCategories: CaseCategory[] = [
  "Cambio de datos",
  "Documentación incompleta",
  "Reembolso",
  "Cambio de cita",
  "Reclamación administrativa",
  "Consulta sobre un procedimiento",
];

export const webFormCategoryLabels: Record<CaseCategory, string> = {
  "Cambio de datos": "Cambio de datos",
  "Documentación incompleta": "Documentación incompleta",
  Reembolso: "Solicitud de reembolso",
  "Cambio de cita": "Cambio o cancelación de cita",
  "Reclamación administrativa": "Reclamación administrativa",
  "Consulta sobre un procedimiento": "Consulta sobre un procedimiento",
};

export const declaredPriorities: DeclaredPriority[] = ["normal", "urgent"];

export const preferredResponseChannels: PreferredResponseChannel[] = [
  "portal",
  "email_simulated",
];

export const documentOptionsByCategory: Record<CaseCategory, string[]> = {
  "Cambio de datos": [
    "formulario de solicitud",
    "justificante",
    "documento de respaldo",
    "sin documentación",
  ],
  "Documentación incompleta": [
    "formulario de solicitud",
    "justificante",
    "documento de respaldo",
    "sin documentación",
  ],
  Reembolso: [
    "formulario de solicitud",
    "comprobante de pago",
    "justificante",
    "sin documentación",
  ],
  "Cambio de cita": [
    "formulario de solicitud",
    "comunicación anterior",
    "sin documentación",
  ],
  "Reclamación administrativa": [
    "formulario de solicitud",
    "comunicación anterior",
    "documento de respaldo",
    "sin documentación",
  ],
  "Consulta sobre un procedimiento": [
    "formulario de solicitud",
    "comunicación anterior",
    "sin documentación",
  ],
};

function isValidDate(value: string): boolean {
  if (!value) {
    return true;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

export function validateWebForm(input: WebFormInput): WebFormValidationResult {
  const errors: WebFormValidationError[] = [];
  const category = input.category as CaseCategory;
  const subject = input.subject.trim();
  const description = input.description.trim();
  const declaredDocuments = Array.from(new Set(input.declaredDocuments));

  if (!webFormCategories.includes(category)) {
    errors.push({ field: "category", message: "Selecciona un tipo de trámite válido." });
  }

  if (subject.length < 10) {
    errors.push({ field: "subject", message: "El asunto debe tener al menos 10 caracteres." });
  }

  if (subject.length > 120) {
    errors.push({ field: "subject", message: "El asunto no puede superar 120 caracteres." });
  }

  if (description.length < 30) {
    errors.push({
      field: "description",
      message: "La descripción debe tener al menos 30 caracteres.",
    });
  }

  if (description.length > 2000) {
    errors.push({
      field: "description",
      message: "La descripción no puede superar 2.000 caracteres.",
    });
  }

  if (input.relatedDate && !isValidDate(input.relatedDate)) {
    errors.push({ field: "relatedDate", message: "La fecha relacionada no es válida." });
  }

  if (!declaredPriorities.includes(input.declaredPriority as DeclaredPriority)) {
    errors.push({ field: "declaredPriority", message: "Selecciona una prioridad válida." });
  }

  if (
    !preferredResponseChannels.includes(
      input.preferredResponseChannel as PreferredResponseChannel,
    )
  ) {
    errors.push({
      field: "preferredResponseChannel",
      message: "Selecciona un canal de respuesta válido.",
    });
  }

  if (!Array.isArray(input.declaredDocuments)) {
    errors.push({ field: "declaredDocuments", message: "Selecciona documentación válida." });
  }

  if (webFormCategories.includes(category)) {
    const allowedDocuments = documentOptionsByCategory[category];
    const hasUnknownDocument = declaredDocuments.some(
      (document) => !allowedDocuments.includes(document),
    );

    if (hasUnknownDocument) {
      errors.push({
        field: "declaredDocuments",
        message: "La documentación declarada no corresponde al tipo de trámite.",
      });
    }
  }

  if (!input.syntheticDataConfirmed) {
    errors.push({
      field: "syntheticDataConfirmed",
      message: "Debes confirmar que los datos son sintéticos.",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      category,
      subject,
      description,
      relatedDate: input.relatedDate || undefined,
      declaredPriority: input.declaredPriority as DeclaredPriority,
      preferredResponseChannel:
        input.preferredResponseChannel as PreferredResponseChannel,
      declaredDocuments,
      syntheticDataConfirmed: true,
    },
  };
}
