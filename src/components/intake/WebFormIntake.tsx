"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  caseStatusLabels,
  intakeSourceLabels,
  responseChannelLabels,
} from "@/data/synthetic-cases";
import { createCaseFromWebForm } from "@/domain/web-form-intake";
import {
  documentOptionsByCategory,
  validateWebForm,
  webFormCategories,
  webFormCategoryLabels,
  type WebFormField,
  type WebFormInput,
  type WebFormValidationError,
} from "@/domain/validate-web-form";
import type { CaseCategory, SyntheticCase } from "@/domain/types";
import { useAnonymousSession } from "@/components/supabase/AnonymousSessionProvider";
import { createCaseRepository } from "@/lib/repositories/factory";

type Step = "edit" | "review" | "done";

const emptyForm: WebFormInput = {
  category: "Cambio de datos",
  subject: "",
  description: "",
  relatedDate: "",
  declaredPriority: "normal",
  preferredResponseChannel: "portal",
  declaredDocuments: [],
  syntheticDataConfirmed: false,
};

const presets: Array<{ label: string; value: WebFormInput }> = [
  {
    label: "Cambio de cita simple",
    value: {
      category: "Cambio de cita",
      subject: "Cambio sintético de cita administrativa",
      description:
        "Solicitud ficticia para cambiar una cita administrativa de revisión documental a otra fecha disponible. No incluye datos clínicos ni personales reales.",
      relatedDate: "2026-07-10",
      declaredPriority: "normal",
      preferredResponseChannel: "portal",
      declaredDocuments: ["formulario de solicitud"],
      syntheticDataConfirmed: true,
    },
  },
  {
    label: "Reembolso incompleto",
    value: {
      category: "Reembolso",
      subject: "Reembolso sintético con documentación pendiente",
      description:
        "Solicitud ficticia de revisión de reembolso administrativo donde falta el comprobante de pago simulado. No contiene importes reales ni datos identificables.",
      relatedDate: "2026-07-12",
      declaredPriority: "urgent",
      preferredResponseChannel: "portal",
      declaredDocuments: ["formulario de solicitud"],
      syntheticDataConfirmed: true,
    },
  },
  {
    label: "Reclamación administrativa",
    value: {
      category: "Reclamación administrativa",
      subject: "Reclamación sintética por plazo administrativo",
      description:
        "Reclamación administrativa totalmente ficticia por desacuerdo con un plazo de respuesta simulado. Debe escalarse y no tiene efectos reales.",
      relatedDate: "2026-07-15",
      declaredPriority: "urgent",
      preferredResponseChannel: "email_simulated",
      declaredDocuments: ["formulario de solicitud", "comunicación anterior"],
      syntheticDataConfirmed: true,
    },
  },
];

function errorsByField(errors: WebFormValidationError[]) {
  return errors.reduce<Partial<Record<WebFormField, string>>>((acc, error) => {
    acc[error.field] ??= error.message;
    return acc;
  }, {});
}

export function WebFormIntake() {
  const session = useAnonymousSession();
  const [step, setStep] = useState<Step>("edit");
  const [form, setForm] = useState<WebFormInput>(emptyForm);
  const [errors, setErrors] = useState<WebFormValidationError[]>([]);
  const [createdCase, setCreatedCase] = useState<SyntheticCase | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fieldErrors = useMemo(() => errorsByField(errors), [errors]);
  const documents = documentOptionsByCategory[form.category as CaseCategory] ?? [];

  function updateForm(patch: Partial<WebFormInput>) {
    setForm((current) => ({ ...current, ...patch }));
    setErrors([]);
  }

  function focusFirstError(nextErrors: WebFormValidationError[]) {
    const firstError = nextErrors[0];
    if (!firstError) {
      return;
    }

    window.setTimeout(() => {
      document.getElementById(firstError.field)?.focus();
    }, 0);
  }

  function handleDocumentChange(documentName: string, checked: boolean) {
    const nextDocuments = checked
      ? [...form.declaredDocuments, documentName]
      : form.declaredDocuments.filter((item) => item !== documentName);

    updateForm({ declaredDocuments: Array.from(new Set(nextDocuments)) });
  }

  function handleReview() {
    const result = validateWebForm(form);
    if (!result.valid) {
      setErrors(result.errors);
      focusFirstError(result.errors);
      return;
    }

    setStep("review");
    setMessage("Solicitud validada. Revisa antes de confirmar.");
  }

  async function handleConfirm() {
    const result = validateWebForm(form);
    if (!result.valid) {
      setStep("edit");
      setErrors(result.errors);
      focusFirstError(result.errors);
      return;
    }

    if (session.status !== "ready") {
      setMessage("Espera a que la sesión de demostración esté lista.");
      return;
    }

    try {
      setIsSaving(true);
      const repository = createCaseRepository({
        supabase: session.supabase ?? undefined,
        ownerId: session.userId ?? undefined,
      });
      const newCase = createCaseFromWebForm(result.data);
      await repository.createCase(newCase);
      setCreatedCase(newCase);
      setStep("done");
      setMessage(
        session.mode === "local"
          ? "Solicitud recibida y guardada en la bandeja local."
          : "Solicitud recibida y guardada en Supabase.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo guardar la solicitud.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleCreateAnother() {
    setForm(emptyForm);
    setErrors([]);
    setCreatedCase(null);
    setStep("edit");
    setMessage("");
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <ol
        className="mb-6 grid gap-3 text-sm font-semibold sm:grid-cols-3"
        aria-label="Progreso de solicitud"
      >
        {[
          ["edit", "1. Completar solicitud"],
          ["review", "2. Revisar"],
          ["done", "3. Confirmación"],
        ].map(([key, label]) => (
          <li
            className={`rounded-md border p-3 ${
              step === key
                ? "border-teal-300 bg-teal-50 text-accent-strong"
                : "border-border bg-surface-muted text-slate-600"
            }`}
            key={key}
          >
            {label}
          </li>
        ))}
      </ol>

      <p className="mb-5 text-sm text-slate-700" aria-live="polite">
        {message ||
          session.message ||
          "Completa una solicitud ficticia para crear un expediente."}
      </p>

      {step === "edit" ? (
        <div className="grid gap-6">
          <div className="rounded-md border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-slate-950">
              Presets de demostración
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  className="min-h-10 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-slate-900 transition hover:bg-teal-50"
                  key={preset.label}
                  onClick={() => updateForm(preset.value)}
                  type="button"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Tipo de trámite" error={fieldErrors.category} id="category">
              <select
                aria-describedby={fieldErrors.category ? "category-error" : undefined}
                className="min-h-11 rounded-md border border-border px-3"
                id="category"
                onChange={(event) =>
                  updateForm({
                    category: event.target.value,
                    declaredDocuments: [],
                  })
                }
                value={form.category}
              >
                {webFormCategories.map((category) => (
                  <option key={category} value={category}>
                    {webFormCategoryLabels[category]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Asunto" error={fieldErrors.subject} id="subject">
              <input
                aria-describedby={fieldErrors.subject ? "subject-error" : undefined}
                className="min-h-11 rounded-md border border-border px-3"
                id="subject"
                maxLength={120}
                minLength={10}
                onChange={(event) => updateForm({ subject: event.target.value })}
                value={form.subject}
              />
            </Field>
          </div>

          <Field label="Descripción" error={fieldErrors.description} id="description">
            <textarea
              aria-describedby={
                fieldErrors.description ? "description-error" : undefined
              }
              className="min-h-36 rounded-md border border-border p-3"
              id="description"
              maxLength={2000}
              minLength={30}
              onChange={(event) => updateForm({ description: event.target.value })}
              value={form.description}
            />
          </Field>

          <div className="grid gap-5 lg:grid-cols-3">
            <Field
              label="Fecha relacionada"
              error={fieldErrors.relatedDate}
              id="relatedDate"
            >
              <input
                aria-describedby={
                  fieldErrors.relatedDate ? "relatedDate-error" : undefined
                }
                className="min-h-11 rounded-md border border-border px-3"
                id="relatedDate"
                onChange={(event) => updateForm({ relatedDate: event.target.value })}
                type="date"
                value={form.relatedDate}
              />
            </Field>

            <Field
              label="Prioridad declarada"
              error={fieldErrors.declaredPriority}
              id="declaredPriority"
            >
              <select
                className="min-h-11 rounded-md border border-border px-3"
                id="declaredPriority"
                onChange={(event) =>
                  updateForm({ declaredPriority: event.target.value })
                }
                value={form.declaredPriority}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgente</option>
              </select>
            </Field>

            <Field
              label="Canal preferido de respuesta"
              error={fieldErrors.preferredResponseChannel}
              id="preferredResponseChannel"
            >
              <select
                className="min-h-11 rounded-md border border-border px-3"
                id="preferredResponseChannel"
                onChange={(event) =>
                  updateForm({ preferredResponseChannel: event.target.value })
                }
                value={form.preferredResponseChannel}
              >
                <option value="portal">Portal de seguimiento</option>
                <option value="email_simulated">Email simulado</option>
              </select>
            </Field>
          </div>

          <p className="rounded-md border border-border bg-surface-muted p-3 text-sm text-slate-700">
            La prioridad declarada no determina automáticamente la prioridad
            administrativa final. No solicites ni introduzcas una dirección de
            email real.
          </p>

          <fieldset
            aria-describedby={
              fieldErrors.declaredDocuments ? "declaredDocuments-error" : undefined
            }
            className="rounded-md border border-border p-4"
            id="declaredDocuments"
            tabIndex={-1}
          >
            <legend className="px-1 text-sm font-semibold text-slate-950">
              Documentación declarada
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {documents.map((documentName) => (
                <label
                  className="flex items-center gap-3 rounded-md bg-surface-muted p-3 text-sm text-slate-800"
                  key={documentName}
                >
                  <input
                    checked={form.declaredDocuments.includes(documentName)}
                    onChange={(event) =>
                      handleDocumentChange(documentName, event.target.checked)
                    }
                    type="checkbox"
                  />
                  {documentName}
                </label>
              ))}
            </div>
            {fieldErrors.declaredDocuments ? (
              <p className="mt-2 text-sm text-red-700" id="declaredDocuments-error">
                {fieldErrors.declaredDocuments}
              </p>
            ) : null}
          </fieldset>

          <label className="flex gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <input
              aria-describedby={
                fieldErrors.syntheticDataConfirmed
                  ? "syntheticDataConfirmed-error"
                  : undefined
              }
              checked={form.syntheticDataConfirmed}
              id="syntheticDataConfirmed"
              onChange={(event) =>
                updateForm({ syntheticDataConfirmed: event.target.checked })
              }
              type="checkbox"
            />
            <span>
              Confirmo que toda la información introducida es sintética y que no
              contiene datos personales ni clínicos reales.
            </span>
          </label>
          {fieldErrors.syntheticDataConfirmed ? (
            <p className="text-sm text-red-700" id="syntheticDataConfirmed-error">
              {fieldErrors.syntheticDataConfirmed}
            </p>
          ) : null}

          <div className="flex justify-end">
            <button
              className="min-h-11 rounded-md bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!form.syntheticDataConfirmed}
              onClick={handleReview}
              type="button"
            >
              Revisar solicitud
            </button>
          </div>
        </div>
      ) : null}

      {step === "review" ? (
        <div className="grid gap-5">
          <Preview form={form} />
          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="min-h-11 rounded-md border border-border px-5 text-sm font-semibold text-slate-900 transition hover:bg-surface-muted"
              onClick={() => setStep("edit")}
              type="button"
            >
              Volver a editar
            </button>
            <button
              className="min-h-11 rounded-md bg-accent px-5 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving || session.status !== "ready"}
              onClick={handleConfirm}
              type="button"
            >
              {isSaving ? "Guardando..." : "Confirmar envío"}
            </button>
          </div>
        </div>
      ) : null}

      {step === "done" && createdCase ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-xl font-semibold text-emerald-950">
            Solicitud recibida
          </h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Summary label="Expediente" value={createdCase.id} />
            <Summary
              label="Recepción"
              value={new Date(createdCase.receivedAt).toLocaleString("es-ES")}
            />
            <Summary label="Estado inicial" value={caseStatusLabels[createdCase.status]} />
            <Summary label="Origen" value={intakeSourceLabels[createdCase.source]} />
          </dl>
          <p className="mt-5 text-sm text-emerald-950">
            El expediente ya está disponible en la bandeja local y puede
            procesarse con el workflow determinista.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 text-sm font-semibold text-white"
              href={`/demo/cases/${createdCase.id}`}
            >
              Ver expediente
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-slate-900"
              href="/demo"
            >
              Ir a la bandeja
            </Link>
            <button
              className="min-h-11 rounded-md border border-border bg-surface px-5 text-sm font-semibold text-slate-900"
              onClick={handleCreateAnother}
              type="button"
            >
              Crear otra solicitud
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  id: WebFormField;
  label: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      {children}
      {error ? (
        <span className="text-sm font-normal text-red-700" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Preview({ form }: { form: WebFormInput }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-5">
      <h2 className="text-xl font-semibold text-slate-950">Vista previa</h2>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <Summary label="Origen" value="Formulario web" />
        <Summary label="Categoría" value={form.category} />
        <Summary label="Asunto" value={form.subject} />
        <Summary label="Fecha relacionada" value={form.relatedDate || "No indicada"} />
        <Summary
          label="Prioridad declarada"
          value={form.declaredPriority === "urgent" ? "Urgente" : "Normal"}
        />
        <Summary
          label="Canal de respuesta"
          value={
            responseChannelLabels[
              form.preferredResponseChannel as keyof typeof responseChannelLabels
            ]
          }
        />
        <Summary
          label="Documentos declarados"
          value={form.declaredDocuments.join(", ") || "Sin documentación"}
        />
        <Summary label="Datos sintéticos" value="Confirmado por el solicitante demo" />
      </dl>
      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-950">Descripción</p>
        <p className="mt-2 rounded-md bg-surface p-3 text-sm leading-6 text-slate-700">
          {form.description}
        </p>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium text-slate-950">{value}</dd>
    </div>
  );
}
